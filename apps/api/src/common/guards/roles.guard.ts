import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamRole } from '@convia/shared-types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Roles Guard
 *
 * Checks that the current user's team role is in the allowed roles list.
 * Must be used AFTER TeamMemberGuard (which attaches teamMembership to request).
 *
 * If no @Roles decorator is present on the handler or class, access is allowed
 * for any team member (the TeamMemberGuard already verified membership).
 *
 * Usage:
 * ```typescript
 * @UseGuards(SupabaseAuthGuard, TeamMemberGuard, RolesGuard)
 * @Roles('owner', 'admin')
 * @Patch(':teamId')
 * async updateTeam() { ... }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<TeamRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles decorator, allow any team member
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const membership = request.teamMembership;

    if (!membership) {
      throw new ForbiddenException('Team membership not found');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
