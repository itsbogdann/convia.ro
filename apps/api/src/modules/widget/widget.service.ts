import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import {
  ConversationStatus,
  MessageContentType,
  MessageSender,
  PlanId,
} from '@convia/shared-types';
import { Agent } from '../../entities/agent.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { KnowledgeBase } from '../../entities/knowledge-base.entity';
import { OpenAIService } from '../../common/services/openai.service';
import { PusherService } from '../../common/services/pusher.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { WidgetMessageDto } from './dto/widget-message.dto';

interface UsageState {
  /** TRUE if the team has reached a hard cap (Free plan only). */
  outOfQuota: boolean;
  /** TRUE if this new conversation pushed the team over their included limit. */
  isOverage: boolean;
}

export interface WidgetResponse {
  conversation: Conversation;
  messages: Message[];
  outOfQuota: boolean;
}

const DEFAULT_HISTORY_MESSAGES = 10;
const RAG_TOP_K = 5;
const RAG_THRESHOLD = 0.6;

@Injectable()
export class WidgetService {
  private readonly logger = new Logger(WidgetService.name);
  private readonly sessionTimeoutMinutes: number;

  constructor(
    @InjectRepository(Agent) private readonly agents: Repository<Agent>,
    @InjectRepository(Conversation) private readonly conversations: Repository<Conversation>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    @InjectRepository(KnowledgeBase) private readonly kbs: Repository<KnowledgeBase>,
    private readonly openai: OpenAIService,
    private readonly realtime: PusherService,
    private readonly supabase: SupabaseService,
    private readonly kbService: KnowledgeBaseService,
    private readonly dataSource: DataSource,
    config: ConfigService,
  ) {
    this.sessionTimeoutMinutes =
      config.get<number>('convia.sessionTimeoutMinutes') || 30;
  }

  /**
   * Public bot config — what the widget needs to render and label itself.
   * Excludes the system prompt and other internal config.
   */
  getPublicConfig(agent: Agent) {
    return {
      id: agent.id,
      name: agent.name,
      language: agent.language,
      appearance: agent.appearance,
      status: agent.status,
    };
  }

  async listMessagesForSession(
    agent: Agent,
    sessionId: string,
  ): Promise<{ conversation: Conversation | null; messages: Message[] }> {
    const conversation = await this.conversations.findOne({
      where: { agentId: agent.id, sessionId },
    });
    if (!conversation) return { conversation: null, messages: [] };
    const messages = await this.messages.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });
    return { conversation, messages };
  }

  /**
   * Main chat entrypoint. Resolves the conversation (per-session + 30-min
   * inactivity), runs billing checks, saves the user message, runs RAG +
   * LLM if the bot is in charge, saves the assistant message, broadcasts to
   * realtime, and returns the full payload.
   */
  async handleIncomingMessage(
    agent: Agent,
    dto: WidgetMessageDto,
  ): Promise<WidgetResponse> {
    // Step 1: resolve or create the conversation
    const { conversation, usage, wasCreated } = await this.resolveConversation(
      agent,
      dto,
    );

    // Step 2: hard-cap rejection (Free plan only). We don't save the user
    // message either — the bot has effectively gone offline for this team.
    if (usage.outOfQuota) {
      const systemMsg: Message = {
        id: 'out-of-quota',
        conversationId: conversation.id,
        sender: MessageSender.ASSISTANT,
        senderId: null,
        contentType: MessageContentType.TEXT,
        content:
          'Acest cont a atins limita lunară de conversații. Te rog contactează administratorul.',
        model: null,
        tokensUsed: null,
        toolName: null,
        toolResult: null,
        uiComponent: null,
        createdAt: new Date(),
        deliveredAt: null,
        readAt: null,
      } as Message;
      return {
        conversation,
        messages: [systemMsg],
        outOfQuota: true,
      };
    }

    // Step 3: persist the user message
    const userMessage = await this.messages.save(
      this.messages.create({
        conversationId: conversation.id,
        sender: MessageSender.USER,
        contentType: MessageContentType.TEXT,
        content: dto.content,
      }),
    );

    // Update last_activity_at + source_url on reused conversations
    conversation.lastActivityAt = new Date();
    if (dto.sourceUrl) conversation.sourceUrl = dto.sourceUrl;
    await this.conversations.save(conversation);

    // Step 4: if a human has taken over, the bot stays silent.
    if (conversation.status === ConversationStatus.HUMAN_TAKEOVER) {
      this.broadcast(conversation, userMessage);
      return {
        conversation,
        messages: [userMessage],
        outOfQuota: false,
      };
    }

    // Step 5: bot reply via RAG + LLM
    let assistantMessage: Message;
    try {
      assistantMessage = await this.generateAssistantReply(
        agent,
        conversation,
        dto.content,
      );
    } catch (err) {
      this.logger.error(
        `LLM call failed for agent=${agent.id} conv=${conversation.id}: ${
          err instanceof Error ? err.message : err
        }`,
      );
      assistantMessage = await this.messages.save(
        this.messages.create({
          conversationId: conversation.id,
          sender: MessageSender.ASSISTANT,
          contentType: MessageContentType.TEXT,
          content:
            'Îmi pare rău, am o problemă tehnică momentan. Te rog încearcă din nou peste un minut.',
          model: agent.model,
        }),
      );
    }

    this.broadcast(conversation, userMessage);
    this.broadcast(conversation, assistantMessage);

    return {
      conversation,
      messages: [userMessage, assistantMessage],
      outOfQuota: false,
    };
  }

  // ───────────────────────────────────────────────────────────────────────
  // Conversation resolution + billing
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Find an existing live conversation for (agent, visitor) or create a new one.
   *
   * "Live" means status not in (ENDED, ARCHIVED) AND last_activity_at within
   * the session-timeout window. Outside that window, a new conversation row
   * is created — that's the per-session billing unit.
   *
   * Wrapped in a transaction so the usage counter increment is atomic with
   * the conversation insert.
   */
  private async resolveConversation(
    agent: Agent,
    dto: WidgetMessageDto,
  ): Promise<{
    conversation: Conversation;
    usage: UsageState;
    wasCreated: boolean;
  }> {
    const cutoff = new Date(
      Date.now() - this.sessionTimeoutMinutes * 60 * 1000,
    );

    return this.dataSource.transaction(async (manager) => {
      // Look for an existing live conversation
      const existing = await manager
        .createQueryBuilder(Conversation, 'c')
        .where('c.agent_id = :agentId', { agentId: agent.id })
        .andWhere('c.visitor_id = :visitorId', { visitorId: dto.visitorId })
        .andWhere('c.last_activity_at >= :cutoff', { cutoff })
        .andWhere(
          new Brackets((qb) => {
            qb.where('c.status NOT IN (:...closed)', {
              closed: [ConversationStatus.ENDED, ConversationStatus.ARCHIVED],
            });
          }),
        )
        .orderBy('c.last_activity_at', 'DESC')
        .getOne();

      if (existing) {
        return {
          conversation: existing,
          usage: { outOfQuota: false, isOverage: existing.isOverage },
          wasCreated: false,
        };
      }

      // No live session → new conversation. First, run the billing check.
      const usage = await this.checkAndIncrementUsage(manager, agent.teamId);
      if (usage.outOfQuota) {
        // We still need *a* conversation object to return to the widget so
        // it can render the message bubble. Make one in memory but don't
        // persist or increment counters.
        const pseudo = manager.create(Conversation, {
          agentId: agent.id,
          teamId: agent.teamId,
          visitorId: dto.visitorId,
          sessionId: dto.sessionId,
          status: ConversationStatus.ENDED,
          isOverage: false,
          messageCount: 0,
          variables: {},
          context: {},
          source: 'web',
          sourceUrl: dto.sourceUrl ?? null,
        });
        pseudo.id = 'out-of-quota';
        pseudo.createdAt = new Date();
        pseudo.updatedAt = new Date();
        pseudo.lastActivityAt = new Date();
        return { conversation: pseudo, usage, wasCreated: false };
      }

      const created = manager.create(Conversation, {
        agentId: agent.id,
        teamId: agent.teamId,
        visitorId: dto.visitorId,
        visitorMetadata: dto.visitorMetadata ?? {},
        sessionId: dto.sessionId,
        status: ConversationStatus.ACTIVE,
        isOverage: usage.isOverage,
        source: 'web',
        sourceUrl: dto.sourceUrl ?? null,
        lastActivityAt: new Date(),
      });
      const saved = await manager.save(created);

      this.logger.log(
        `New conversation ${saved.id} for agent=${agent.id} team=${agent.teamId} (overage=${usage.isOverage})`,
      );

      return { conversation: saved, usage, wasCreated: true };
    });
  }

  /**
   * Atomically increment the team's used_conversations counter and decide
   * whether the new conversation should be flagged as overage. Free plan
   * teams that hit their cap are rejected (outOfQuota=true).
   */
  private async checkAndIncrementUsage(
    manager: import('typeorm').EntityManager,
    teamId: string,
  ): Promise<UsageState> {
    // Use the Supabase admin client for the RPC — TypeORM manager is fine
    // for the SELECT but we need to make sure we see the latest period.
    const result = await manager.query(
      `
      SELECT id, plan, included_conversations, used_conversations
      FROM usage_periods
      WHERE team_id = $1
        AND period_start <= NOW()
        AND period_end > NOW()
      ORDER BY period_start DESC
      LIMIT 1
      FOR UPDATE
      `,
      [teamId],
    );

    if (!result || result.length === 0) {
      // No period set up — happens for legacy teams. Don't block, no overage.
      this.logger.warn(`No active usage_period for team=${teamId}`);
      return { outOfQuota: false, isOverage: false };
    }

    const period = result[0];
    const used: number = Number(period.used_conversations);
    const included: number = Number(period.included_conversations);
    const newUsed = used + 1;
    const isOverage = newUsed > included;

    // Free plan: hard stop when included is exhausted (no overage rate).
    if (period.plan === PlanId.GRATUIT && newUsed > included) {
      return { outOfQuota: true, isOverage: false };
    }

    // Increment the counter.
    await manager.query(
      `
      UPDATE usage_periods
      SET used_conversations = used_conversations + 1,
          overage_conversations = overage_conversations + CASE WHEN $2 THEN 1 ELSE 0 END,
          updated_at = NOW()
      WHERE id = $1
      `,
      [period.id, isOverage],
    );

    return { outOfQuota: false, isOverage };
  }

  // ───────────────────────────────────────────────────────────────────────
  // RAG + LLM
  // ───────────────────────────────────────────────────────────────────────

  private async generateAssistantReply(
    agent: Agent,
    conversation: Conversation,
    userInput: string,
  ): Promise<Message> {
    // Retrieve top-K chunks from the bot's knowledge base
    const kb = await this.kbs.findOne({ where: { agentId: agent.id } });
    const retrieved = kb
      ? await this.kbService.searchSimilar(kb.id, userInput, {
          topK: RAG_TOP_K,
          threshold: RAG_THRESHOLD,
        })
      : [];

    // Build the prompt
    const systemPrompt = this.buildSystemPrompt(agent.systemPrompt, retrieved);

    // Load the last N messages (excluding the brand-new user message
    // which we'll append separately) for short-term context
    const history = await this.messages.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'DESC' },
      take: DEFAULT_HISTORY_MESSAGES,
    });
    history.reverse();

    const conversationMessages = [
      ...history.map((m) => ({
        role:
          m.sender === MessageSender.ASSISTANT || m.sender === MessageSender.HUMAN_AGENT
            ? ('assistant' as const)
            : ('user' as const),
        content: m.content,
      })),
      { role: 'user' as const, content: userInput },
    ];

    const content = await this.openai.generateResponse({
      messages: conversationMessages,
      systemPrompt,
      model: agent.model,
      maxTokens: agent.maxTokens,
    });

    return this.messages.save(
      this.messages.create({
        conversationId: conversation.id,
        sender: MessageSender.ASSISTANT,
        contentType: MessageContentType.TEXT,
        content:
          content ||
          'Îmi pare rău, nu am putut genera un răspuns. Te rog încearcă din nou.',
        model: agent.model,
      }),
    );
  }

  private buildSystemPrompt(
    botPrompt: string | null,
    retrieved: { content: string; similarity: number }[],
  ): string {
    const base =
      botPrompt ||
      'Ești un asistent AI pentru o afacere din România. Răspunde clar, politicos, în limba română.';

    if (retrieved.length === 0) {
      return `${base}\n\nNu ai informații specifice în baza de cunoștințe pentru această întrebare. Dacă utilizatorul cere ceva concret pe care nu îl știi, recunoaște onest și sugerează să fie contactat un coleg uman.`;
    }

    const contextBlock = retrieved
      .map(
        (r, i) =>
          `[Fragment ${i + 1} · similaritate ${(r.similarity * 100).toFixed(0)}%]\n${r.content}`,
      )
      .join('\n---\n');

    return `${base}\n\nContext din baza ta de cunoștințe (folosește DOAR aceste informații pentru fapte concrete):\n\n${contextBlock}\n\nDacă întrebarea utilizatorului nu se regăsește în context, spune că nu știi în loc să inventezi.`;
  }

  // ───────────────────────────────────────────────────────────────────────

  private broadcast(conversation: Conversation, message: Message): void {
    try {
      void this.realtime.trigger(
        `widget-${conversation.sessionId}`,
        'message',
        { conversationId: conversation.id, message },
      );
      void this.realtime.trigger(
        `team-${conversation.teamId}-conversations`,
        'message',
        { conversationId: conversation.id, message },
      );
    } catch (err) {
      this.logger.debug(`Realtime broadcast failed: ${err}`);
    }
  }
}
