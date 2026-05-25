import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PlanId, TeamRole } from '@convia/shared-types';
import { Profile } from '../../entities/profile.entity';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(Team) private readonly teams: Repository<Team>,
    @InjectRepository(TeamMember) private readonly members: Repository<TeamMember>,
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    private readonly dataSource: DataSource,
  ) {}

  // ───────────────────────────────────────────────────────────────────────
  // Teams CRUD
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Create a new team and assign the creator as owner.
   * Wrapped in a transaction so we never end up with a team that has no owner.
   * The `gratuit` subscription + first usage_period are created automatically
   * by the DB trigger `on_team_insert_create_subscription` (003_billing.sql).
   */
  async create(userId: string, dto: CreateTeamDto): Promise<Team> {
    return this.dataSource.transaction(async (manager) => {
      const team = manager.create(Team, {
        name: dto.name,
        plan: PlanId.GRATUIT,
        settings: dto.settings || {},
      });
      const saved = await manager.save(team);

      const owner = manager.create(TeamMember, {
        teamId: saved.id,
        userId,
        role: TeamRole.OWNER,
        acceptedAt: new Date(),
        assignedAgentIds: [],
      });
      await manager.save(owner);

      this.logger.log(`Team ${saved.id} created by ${userId}`);
      return saved;
    });
  }

  async findOne(teamId: string): Promise<Team> {
    const team = await this.teams.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async update(teamId: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(teamId);
    if (dto.name !== undefined) team.name = dto.name;
    if (dto.settings !== undefined) {
      team.settings = { ...team.settings, ...dto.settings };
    }
    return this.teams.save(team);
  }

  /** Permanent delete. Cascades to all members, agents, conversations, etc. */
  async remove(teamId: string): Promise<void> {
    const result = await this.teams.delete(teamId);
    if (result.affected === 0) throw new NotFoundException('Team not found');
  }

  // ───────────────────────────────────────────────────────────────────────
  // Members
  // ───────────────────────────────────────────────────────────────────────

  async listMembers(teamId: string): Promise<TeamMember[]> {
    return this.members.find({
      where: { teamId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Add an existing Convia user to a team by email.
   *
   * For users that don't have a profile yet (haven't signed up), call this
   * after they sign up — or use the invitation flow (not yet wired).
   */
  async addMember(
    teamId: string,
    invitedBy: string,
    dto: AddMemberDto,
  ): Promise<TeamMember> {
    if (dto.role === TeamRole.OWNER) {
      throw new BadRequestException('Cannot add another owner. Transfer ownership instead.');
    }
    if (dto.role !== TeamRole.HUMAN_AGENT && dto.assignedAgentIds?.length) {
      throw new BadRequestException('assignedAgentIds is only valid for human_agent role');
    }

    const profile = await this.profiles.findOne({ where: { email: dto.email } });
    if (!profile) {
      throw new NotFoundException(
        `No Convia user found for ${dto.email}. Send them an invite link instead.`,
      );
    }

    const existing = await this.members.findOne({
      where: { teamId, userId: profile.id },
    });
    if (existing) throw new ConflictException('User is already a member of this team');

    const member = this.members.create({
      teamId,
      userId: profile.id,
      role: dto.role,
      assignedAgentIds: dto.assignedAgentIds || [],
      invitedBy,
      acceptedAt: new Date(), // direct add = auto-accepted
    });
    return this.members.save(member);
  }

  async updateMember(
    teamId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<TeamMember> {
    const member = await this.members.findOne({ where: { id: memberId, teamId } });
    if (!member) throw new NotFoundException('Member not found');

    if (member.role === TeamRole.OWNER) {
      throw new ForbiddenException(
        'Cannot modify the owner directly. Transfer ownership first.',
      );
    }

    if (dto.role === TeamRole.OWNER) {
      throw new BadRequestException(
        'Use the transfer-ownership flow to promote a member to owner.',
      );
    }

    if (dto.role !== undefined) member.role = dto.role;
    if (dto.assignedAgentIds !== undefined) {
      // assignedAgentIds is only meaningful for HUMAN_AGENT; clear it otherwise.
      const targetRole = dto.role ?? member.role;
      member.assignedAgentIds =
        targetRole === TeamRole.HUMAN_AGENT ? dto.assignedAgentIds : [];
    }
    return this.members.save(member);
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    const member = await this.members.findOne({ where: { id: memberId, teamId } });
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === TeamRole.OWNER) {
      throw new ForbiddenException(
        'Cannot remove the owner. Transfer ownership or delete the team.',
      );
    }
    await this.members.delete(member.id);
  }
}
