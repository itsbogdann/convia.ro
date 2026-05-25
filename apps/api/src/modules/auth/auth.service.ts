import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRole } from '@convia/shared-types';
import { Profile } from '../../entities/profile.entity';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface MeTeamEntry {
  team: Team;
  role: TeamRole;
  memberId: string;
  isOwner: boolean;
}

export interface MeResponse {
  profile: Profile;
  teams: MeTeamEntry[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
    @InjectRepository(Team)
    private readonly teams: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly members: Repository<TeamMember>,
  ) {}

  /**
   * Return the current user's profile + all teams they're a member of.
   *
   * The Postgres trigger `handle_new_user` creates the profiles row on signup,
   * but we sync from the JWT defensively in case the trigger missed a field
   * (e.g., social-login users whose metadata arrives late).
   */
  async getMe(user: CurrentUserData): Promise<MeResponse> {
    const profile = await this.syncProfile(user);

    const memberships = await this.members.find({
      where: { userId: user.id },
      relations: ['team'],
    });

    const teams = memberships
      .filter((m) => m.acceptedAt !== null && m.team)
      .map<MeTeamEntry>((m) => ({
        team: m.team!,
        role: m.role,
        memberId: m.id,
        isOwner: m.role === TeamRole.OWNER,
      }));

    return { profile, teams };
  }

  /**
   * Idempotent profile upsert from the current JWT payload.
   * Safe to call on every request — only writes when something actually changes.
   */
  async syncProfile(user: CurrentUserData): Promise<Profile> {
    const existing = await this.profiles.findOne({ where: { id: user.id } });

    if (!existing) {
      const created = this.profiles.create({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        locale: 'ro',
        preferences: {},
      });
      this.logger.log(`Created profile for ${user.email} (${user.id})`);
      return this.profiles.save(created);
    }

    let dirty = false;
    if (existing.email !== user.email) {
      existing.email = user.email;
      dirty = true;
    }
    // Only overwrite name/avatar from JWT if local fields are empty,
    // so user edits don't get clobbered.
    if (!existing.fullName && user.fullName) {
      existing.fullName = user.fullName;
      dirty = true;
    }
    if (!existing.avatarUrl && user.avatarUrl) {
      existing.avatarUrl = user.avatarUrl;
      dirty = true;
    }

    return dirty ? this.profiles.save(existing) : existing;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profiles.findOne({ where: { id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (dto.fullName !== undefined) profile.fullName = dto.fullName;
    if (dto.avatarUrl !== undefined) profile.avatarUrl = dto.avatarUrl;
    if (dto.locale !== undefined) profile.locale = dto.locale;
    if (dto.preferences !== undefined) profile.preferences = dto.preferences;

    return this.profiles.save(profile);
  }
}
