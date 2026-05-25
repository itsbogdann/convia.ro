import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationStatus,
  MessageContentType,
  MessageSender,
  TeamRole,
} from '@convia/shared-types';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { PusherService } from '../../common/services/pusher.service';

export interface ConversationListItem {
  id: string;
  status: ConversationStatus;
  visitorId: string;
  source: string;
  messageCount: number;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  lastMessagePreview: string | null;
}

const PAGE_SIZE_DEFAULT = 25;
const PAGE_SIZE_MAX = 100;

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversations: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messages: Repository<Message>,
    @InjectRepository(TeamMember)
    private readonly members: Repository<TeamMember>,
    private readonly realtime: PusherService,
  ) {}

  // ───────────────────────────────────────────────────────────────────────
  // Access control (mirrors can_access_agent from RLS)
  // ───────────────────────────────────────────────────────────────────────

  private async assertCanAccessAgent(
    userId: string,
    teamId: string,
    agentId: string,
  ): Promise<void> {
    const m = await this.members.findOne({ where: { teamId, userId } });
    if (!m) throw new ForbiddenException('Not a member of this team');
    if (m.role !== TeamRole.HUMAN_AGENT) return;
    if (!m.assignedAgentIds || m.assignedAgentIds.length === 0) return;
    if (!m.assignedAgentIds.includes(agentId)) {
      throw new NotFoundException('Bot not found'); // don't leak existence
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // List + read
  // ───────────────────────────────────────────────────────────────────────

  async list(
    userId: string,
    teamId: string,
    agentId: string,
    options: {
      status?: ConversationStatus;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<{ items: ConversationListItem[]; total: number; page: number; pageSize: number }> {
    await this.assertCanAccessAgent(userId, teamId, agentId);

    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, options.pageSize ?? PAGE_SIZE_DEFAULT));

    const qb = this.conversations
      .createQueryBuilder('c')
      .where('c.agent_id = :agentId AND c.team_id = :teamId', { agentId, teamId })
      .orderBy('c.last_activity_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (options.status) qb.andWhere('c.status = :status', { status: options.status });

    const [items, total] = await qb.getManyAndCount();

    // Fetch the last message of each in a single query for the preview column.
    const previews = await this.getLastMessagePreviews(items.map((c) => c.id));

    return {
      items: items.map<ConversationListItem>((c) => ({
        id: c.id,
        status: c.status,
        visitorId: c.visitorId,
        source: c.source,
        messageCount: c.messageCount,
        assignedTo: c.assignedTo,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        lastActivityAt: c.lastActivityAt,
        lastMessagePreview: previews.get(c.id) || null,
      })),
      total,
      page,
      pageSize,
    };
  }

  private async getLastMessagePreviews(
    conversationIds: string[],
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (conversationIds.length === 0) return map;

    // Window function: pick the latest message per conversation
    const rows = await this.messages
      .createQueryBuilder('m')
      .select(['DISTINCT ON (m.conversation_id) m.conversation_id', 'm.content'])
      .where('m.conversation_id IN (:...ids)', { ids: conversationIds })
      .orderBy('m.conversation_id')
      .addOrderBy('m.created_at', 'DESC')
      .getRawMany();

    for (const r of rows) {
      const preview = String(r.m_content || '').slice(0, 140);
      map.set(r.conversation_id, preview);
    }
    return map;
  }

  async findOne(
    userId: string,
    teamId: string,
    agentId: string,
    conversationId: string,
  ): Promise<{ conversation: Conversation; messages: Message[] }> {
    await this.assertCanAccessAgent(userId, teamId, agentId);

    const conversation = await this.conversations.findOne({
      where: { id: conversationId, agentId, teamId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const messages = await this.messages.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    return { conversation, messages };
  }

  // ───────────────────────────────────────────────────────────────────────
  // Human takeover + reply
  // ───────────────────────────────────────────────────────────────────────

  async takeOver(
    userId: string,
    teamId: string,
    agentId: string,
    conversationId: string,
  ): Promise<Conversation> {
    await this.assertCanAccessAgent(userId, teamId, agentId);
    const c = await this.conversations.findOne({
      where: { id: conversationId, agentId, teamId },
    });
    if (!c) throw new NotFoundException('Conversation not found');

    if (
      c.status !== ConversationStatus.ACTIVE &&
      c.status !== ConversationStatus.WAITING &&
      c.status !== ConversationStatus.HUMAN_TAKEOVER
    ) {
      throw new BadRequestException(
        `Cannot take over a conversation in status "${c.status}"`,
      );
    }

    c.status = ConversationStatus.HUMAN_TAKEOVER;
    c.assignedTo = userId;
    c.takenOverAt = new Date();
    const saved = await this.conversations.save(c);

    this.publishConversationEvent(saved, 'takeover');
    return saved;
  }

  async release(
    userId: string,
    teamId: string,
    agentId: string,
    conversationId: string,
  ): Promise<Conversation> {
    await this.assertCanAccessAgent(userId, teamId, agentId);
    const c = await this.conversations.findOne({
      where: { id: conversationId, agentId, teamId },
    });
    if (!c) throw new NotFoundException('Conversation not found');

    if (c.status !== ConversationStatus.HUMAN_TAKEOVER) {
      throw new BadRequestException('Conversation is not currently in human takeover');
    }
    c.status = ConversationStatus.ACTIVE;
    c.assignedTo = null;
    c.takenOverAt = null;
    const saved = await this.conversations.save(c);

    this.publishConversationEvent(saved, 'release');
    return saved;
  }

  async sendHumanMessage(
    userId: string,
    teamId: string,
    agentId: string,
    conversationId: string,
    content: string,
  ): Promise<Message> {
    await this.assertCanAccessAgent(userId, teamId, agentId);
    const c = await this.conversations.findOne({
      where: { id: conversationId, agentId, teamId },
    });
    if (!c) throw new NotFoundException('Conversation not found');

    // Auto-takeover if not already
    if (c.status !== ConversationStatus.HUMAN_TAKEOVER) {
      c.status = ConversationStatus.HUMAN_TAKEOVER;
      c.assignedTo = userId;
      c.takenOverAt = new Date();
      await this.conversations.save(c);
    }

    const message = this.messages.create({
      conversationId,
      sender: MessageSender.HUMAN_AGENT,
      senderId: userId,
      contentType: MessageContentType.TEXT,
      content,
    });
    const saved = await this.messages.save(message);

    this.publishMessage(c, saved);
    return saved;
  }

  // ───────────────────────────────────────────────────────────────────────
  // Status updates (archive, end)
  // ───────────────────────────────────────────────────────────────────────

  async updateStatus(
    userId: string,
    teamId: string,
    agentId: string,
    conversationId: string,
    status: ConversationStatus,
  ): Promise<Conversation> {
    await this.assertCanAccessAgent(userId, teamId, agentId);
    const c = await this.conversations.findOne({
      where: { id: conversationId, agentId, teamId },
    });
    if (!c) throw new NotFoundException('Conversation not found');

    c.status = status;
    if (status === ConversationStatus.ENDED && !c.endedAt) {
      c.endedAt = new Date();
    }
    return this.conversations.save(c);
  }

  // ───────────────────────────────────────────────────────────────────────
  // Realtime broadcasts (best effort; failures don't break the request)
  // ───────────────────────────────────────────────────────────────────────

  private publishMessage(conversation: Conversation, message: Message): void {
    try {
      // Send to both the widget (visitor) channel and the team inbox channel
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
      this.logger.warn(`Realtime publish failed: ${err}`);
    }
  }

  private publishConversationEvent(
    conversation: Conversation,
    event: 'takeover' | 'release' | 'status',
  ): void {
    try {
      void this.realtime.trigger(
        `team-${conversation.teamId}-conversations`,
        event,
        {
          conversationId: conversation.id,
          status: conversation.status,
          assignedTo: conversation.assignedTo,
        },
      );
    } catch (err) {
      this.logger.warn(`Realtime publish failed: ${err}`);
    }
  }
}
