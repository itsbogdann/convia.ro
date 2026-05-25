import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import {
  AgentStatus,
  Industry,
  TeamRole,
  WidgetPosition,
} from '@convia/shared-types';
import { Agent } from '../../entities/agent.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

const DEFAULT_SYSTEM_PROMPT_BY_INDUSTRY: Record<Industry, string> = {
  [Industry.HOTEL]:
    'Ești un asistent AI prietenos pentru un hotel. Răspunzi în limba română despre disponibilitate, prețuri, facilități și preia rezervări. Niciodată nu inventezi informații care nu sunt în baza de cunoștințe.',
  [Industry.RESTAURANT]:
    'Ești un asistent AI pentru un restaurant. Răspunzi în română despre meniu, alergeni, program și preia rezervări. Tonul e cald și politicos. Niciodată nu inventezi.',
  [Industry.ECOMMERCE]:
    'Ești un asistent AI pentru un magazin online. Răspunzi în română despre produse, stoc, livrare, retururi și status comenzi. Recomanzi produse bazat pe nevoile clientului. Niciodată nu inventezi.',
  [Industry.SERVICII]:
    'Ești un asistent AI pentru o afacere de servicii. Răspunzi în română despre prețuri, program, locație și preia programări. Tonul e profesionist și clar. Niciodată nu inventezi.',
  [Industry.OTHER]:
    'Ești un asistent AI pentru o afacere din România. Răspunzi în română, politicos și clar. Folosești doar informațiile din baza de cunoștințe. Recunoști când nu știi ceva.',
};

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    @InjectRepository(Agent) private readonly agents: Repository<Agent>,
    @InjectRepository(TeamMember) private readonly members: Repository<TeamMember>,
  ) {}

  // ───────────────────────────────────────────────────────────────────────
  // Access control — mirrors the can_access_agent() SQL function from RLS.
  // Most roles see all team agents; human_agent is scoped via assigned_agent_ids.
  // ───────────────────────────────────────────────────────────────────────

  private async canAccessAgent(
    userId: string,
    teamId: string,
    agentId: string,
  ): Promise<boolean> {
    const membership = await this.members.findOne({
      where: { teamId, userId, acceptedAt: undefined },
    });
    if (!membership) return false;
    if (membership.role !== TeamRole.HUMAN_AGENT) return true;
    // human_agent with empty array = all agents in team
    if (!membership.assignedAgentIds || membership.assignedAgentIds.length === 0) {
      return true;
    }
    return membership.assignedAgentIds.includes(agentId);
  }

  private async filterAccessibleAgents(
    userId: string,
    teamId: string,
    agents: Agent[],
  ): Promise<Agent[]> {
    const membership = await this.members.findOne({
      where: { teamId, userId },
    });
    if (!membership) return [];
    if (membership.role !== TeamRole.HUMAN_AGENT) return agents;
    if (!membership.assignedAgentIds || membership.assignedAgentIds.length === 0) {
      return agents;
    }
    const allowed = new Set(membership.assignedAgentIds);
    return agents.filter((a) => allowed.has(a.id));
  }

  // ───────────────────────────────────────────────────────────────────────
  // CRUD
  // ───────────────────────────────────────────────────────────────────────

  async list(teamId: string, userId: string): Promise<Agent[]> {
    const all = await this.agents.find({
      where: { teamId },
      order: { createdAt: 'DESC' },
    });
    return this.filterAccessibleAgents(userId, teamId, all);
  }

  async create(teamId: string, dto: CreateAgentDto): Promise<Agent> {
    const industry = dto.industry ?? Industry.OTHER;
    const systemPrompt =
      dto.systemPrompt ?? DEFAULT_SYSTEM_PROMPT_BY_INDUSTRY[industry];

    const agent = this.agents.create({
      teamId,
      name: dto.name,
      description: dto.description ?? null,
      status: AgentStatus.DRAFT,
      industry,
      language: dto.language ?? 'ro',
      systemPrompt,
      model: dto.model ?? 'gpt-4o-mini',
      temperature: dto.temperature ?? 0.7,
      maxTokens: dto.maxTokens ?? 1000,
      allowedDomains: dto.allowedDomains ?? [],
      apiKey: this.generateApiKey(),
      appearance: {
        primaryColor: '#1D4ED8',
        position: WidgetPosition.BOTTOM_RIGHT,
        avatarUrl: null,
        chatTitle: 'Asistent',
        welcomeMessage: 'Salut! Cu ce te ajut?',
        inputPlaceholder: 'Scrie un mesaj...',
        showBranding: true,
      },
      isPublished: false,
    });

    const saved = await this.agents.save(agent);
    this.logger.log(`Agent ${saved.id} created in team ${teamId}`);
    return saved;
  }

  async findOne(teamId: string, agentId: string, userId: string): Promise<Agent> {
    if (!(await this.canAccessAgent(userId, teamId, agentId))) {
      // Don't leak existence to human_agents who aren't assigned
      throw new NotFoundException('Bot not found');
    }
    const agent = await this.agents.findOne({ where: { id: agentId, teamId } });
    if (!agent) throw new NotFoundException('Bot not found');
    return agent;
  }

  async update(teamId: string, agentId: string, dto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.agents.findOne({ where: { id: agentId, teamId } });
    if (!agent) throw new NotFoundException('Bot not found');

    if (dto.name !== undefined) agent.name = dto.name;
    if (dto.description !== undefined) agent.description = dto.description;
    if (dto.status !== undefined) agent.status = dto.status;
    if (dto.industry !== undefined) agent.industry = dto.industry;
    if (dto.language !== undefined) agent.language = dto.language;
    if (dto.systemPrompt !== undefined) agent.systemPrompt = dto.systemPrompt;
    if (dto.model !== undefined) agent.model = dto.model;
    if (dto.temperature !== undefined) agent.temperature = dto.temperature;
    if (dto.maxTokens !== undefined) agent.maxTokens = dto.maxTokens;
    if (dto.allowedDomains !== undefined) agent.allowedDomains = dto.allowedDomains;
    if (dto.appearance !== undefined) {
      agent.appearance = { ...agent.appearance, ...dto.appearance };
    }

    return this.agents.save(agent);
  }

  async remove(teamId: string, agentId: string): Promise<void> {
    const result = await this.agents.delete({ id: agentId, teamId });
    if (result.affected === 0) throw new NotFoundException('Bot not found');
  }

  /**
   * Mark the bot as published — flips status to ACTIVE and stamps published_at.
   * Onboarding wizard calls this when the user clicks "Pune botul live".
   */
  async publish(teamId: string, agentId: string): Promise<Agent> {
    const agent = await this.agents.findOne({ where: { id: agentId, teamId } });
    if (!agent) throw new NotFoundException('Bot not found');
    if (!agent.systemPrompt) {
      throw new ForbiddenException(
        'Botul nu are un prompt configurat. Termină onboarding-ul înainte să-l publici.',
      );
    }
    agent.status = AgentStatus.ACTIVE;
    agent.isPublished = true;
    agent.publishedAt = new Date();
    return this.agents.save(agent);
  }

  /** Rotate the API key. Old key stops working immediately on next request. */
  async regenerateApiKey(teamId: string, agentId: string): Promise<Agent> {
    const agent = await this.agents.findOne({ where: { id: agentId, teamId } });
    if (!agent) throw new NotFoundException('Bot not found');
    agent.apiKey = this.generateApiKey();
    return this.agents.save(agent);
  }

  // ───────────────────────────────────────────────────────────────────────

  private generateApiKey(): string {
    // 24 random bytes → 48 hex chars. Prefixed for visual identification.
    return `cv_${randomBytes(24).toString('hex')}`;
  }
}
