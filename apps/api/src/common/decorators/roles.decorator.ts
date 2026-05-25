import { SetMetadata } from '@nestjs/common';
import { TeamRole } from '@convia/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Restrict access to specific team roles.
 *
 * Usage:
 * ```typescript
 * @Roles('owner', 'admin')          // Only owners and admins
 * @Roles('owner', 'admin', 'member') // Everyone except human agents
 * ```
 *
 * Must be used with TeamMemberGuard (which attaches teamMembership to request).
 * If no @Roles decorator is present, any team member can access the endpoint.
 */
export const Roles = (...roles: TeamRole[]) => SetMetadata(ROLES_KEY, roles);
