import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { WebSocket } from 'ws';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Decoded Supabase JWT payload
 */
interface SupabaseJwtPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  phone?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
  role: string;
  session_id?: string;
}

/**
 * User data attached to request
 */
export interface RequestUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  role: string;
}

/**
 * Supabase Auth Guard
 *
 * Verifies JWT tokens from Supabase Auth.
 * Supports both local JWT verification (preferred) and API-based verification.
 *
 * Usage:
 * ```typescript
 * @UseGuards(SupabaseAuthGuard)
 * @Get('protected')
 * async protectedRoute(@CurrentUser() user: RequestUser) { ... }
 * ```
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private readonly jwtSecret: string | undefined;
  private readonly supabaseUrl: string | undefined;
  private readonly supabaseKey: string | undefined;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.jwtSecret = this.configService.get<string>('supabase.jwtSecret');
    this.supabaseUrl = this.configService.get<string>('supabase.url');
    this.supabaseKey =
      this.configService.get<string>('supabase.publishableKey') ||
      this.configService.get<string>('supabase.anonKey');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const payload = await this.verifyToken(token);
      const user = this.extractUserFromPayload(payload);

      // Attach user and token to request
      request.user = user;
      request.accessToken = token;

      return true;
    } catch (error) {
      this.logger.warn(`Auth failed: ${error.message}`);
      throw error instanceof UnauthorizedException
        ? error
        : new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Extract Bearer token from request
   */
  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }

  /**
   * Verify JWT token
   * Tries local verification first, falls back to API call
   */
  private async verifyToken(token: string): Promise<SupabaseJwtPayload> {
    // Try local JWT verification (faster, no network call)
    if (this.jwtSecret) {
      try {
        const decoded = jwt.verify(token, this.jwtSecret) as SupabaseJwtPayload;

        // Validate required fields
        if (!decoded.sub || !decoded.email) {
          throw new UnauthorizedException('Invalid token payload');
        }

        return decoded;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedException('Token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
          // Token might be signed differently, try API verification
          this.logger.verbose('Local JWT verification failed, using API fallback');
        } else {
          throw error;
        }
      }
    }

    // Fallback to Supabase API verification
    return this.verifyTokenViaApi(token);
  }

  /**
   * Verify token using Supabase API
   */
  private async verifyTokenViaApi(token: string): Promise<SupabaseJwtPayload> {
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new UnauthorizedException('Supabase not configured');
    }

    const supabase = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        transport: WebSocket as unknown as typeof globalThis.WebSocket,
      },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException(error?.message || 'Invalid token');
    }

    // Construct payload from user data
    return {
      sub: data.user.id,
      email: data.user.email || '',
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      iss: this.supabaseUrl || '',
      app_metadata: data.user.app_metadata || {},
      user_metadata: data.user.user_metadata || {},
      role: 'authenticated',
    };
  }

  /**
   * Extract user data from JWT payload
   */
  private extractUserFromPayload(payload: SupabaseJwtPayload): RequestUser {
    return {
      id: payload.sub,
      email: payload.email,
      fullName: payload.user_metadata?.full_name || payload.user_metadata?.name || null,
      avatarUrl: payload.user_metadata?.avatar_url || null,
      emailVerified: payload.aud === 'authenticated',
      role: payload.role || 'authenticated',
    };
  }
}
