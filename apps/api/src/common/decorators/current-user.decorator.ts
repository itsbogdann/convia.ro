import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User data attached to request by SupabaseAuthGuard
 */
export interface CurrentUserData {
  /** User UUID from Supabase Auth */
  id: string;
  /** User email address */
  email: string;
  /** Full name from user metadata */
  fullName: string | null;
  /** Avatar URL from user metadata */
  avatarUrl: string | null;
  /** Whether email is verified */
  emailVerified: boolean;
  /** User role (usually 'authenticated') */
  role: string;
}

/**
 * Parameter decorator to extract current user from request
 *
 * @example
 * // Get entire user object
 * @Get('me')
 * async getMe(@CurrentUser() user: CurrentUserData) {
 *   return user;
 * }
 *
 * @example
 * // Get specific field
 * @Get('email')
 * async getEmail(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 *
 * @example
 * // Get user ID
 * @Post('something')
 * async create(@CurrentUser('id') userId: string) {
 *   // Use userId
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

/**
 * Get the raw access token from the request
 * Useful for passing to Supabase for RLS-scoped queries
 *
 * @example
 * @Get('data')
 * async getData(@AccessToken() token: string) {
 *   const supabase = this.supabaseService.getClientForUser(token);
 *   // RLS-scoped queries
 * }
 */
export const AccessToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.accessToken || null;
  },
);
