import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';

/**
 * Current team data attached by TeamMemberGuard or TeamAdminGuard
 */
export interface CurrentTeamData {
  team: Team;
  membership: TeamMember;
}

/**
 * Parameter decorator to extract current team from request
 *
 * Requires TeamMemberGuard or TeamAdminGuard to be applied first.
 *
 * @example
 * // Get team object
 * @UseGuards(SupabaseAuthGuard, TeamMemberGuard)
 * @Get(':teamId/agents')
 * async getAgents(@CurrentTeam() team: Team) {
 *   return this.agentService.findByTeamId(team.id);
 * }
 *
 * @example
 * // Get both team and membership
 * @UseGuards(SupabaseAuthGuard, TeamMemberGuard)
 * @Get(':teamId/info')
 * async getInfo(@CurrentTeamWithMembership() data: CurrentTeamData) {
 *   return { team: data.team, role: data.membership.role };
 * }
 */
export const CurrentTeam = createParamDecorator(
  (data: keyof Team | undefined, ctx: ExecutionContext): Team | string | null => {
    const request = ctx.switchToHttp().getRequest();
    const team = request.team as Team | undefined;

    if (!team) return null;

    // If a property name is passed (e.g., 'id'), return just that property
    if (data && data in team) {
      return team[data] as string;
    }

    return team;
  },
);

/**
 * Get current team membership (includes role)
 */
export const CurrentTeamMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TeamMember | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.teamMembership || null;
  },
);

/**
 * Get both team and membership
 */
export const CurrentTeamWithMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentTeamData | null => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.team) return null;
    return {
      team: request.team,
      membership: request.teamMembership,
    };
  },
);
