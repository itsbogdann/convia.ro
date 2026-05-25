import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../../entities/team-member.entity';
import { Team } from '../../entities/team.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Team Member Guard
 *
 * Verifies that the current user is a member of the team
 * specified in the route parameters (teamId or team_id).
 *
 * Also attaches the team to the request for downstream use.
 * Skips validation for @Public() endpoints.
 *
 * Usage:
 * ```typescript
 * @UseGuards(SupabaseAuthGuard, TeamMemberGuard)
 * @Get(':teamId/data')
 * async getData(@CurrentTeam() team: Team) { ... }
 * ```
 */
@Injectable()
export class TeamMemberGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException('Not authenticated');
    }

    // Get teamId from route params
    const teamId = request.params.teamId || request.params.team_id;

    if (!teamId) {
      throw new ForbiddenException('Team ID is required');
    }

    // Check if team exists
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is a member
    const membership = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Attach team and membership to request
    request.team = team;
    request.teamMembership = membership;

    return true;
  }
}
