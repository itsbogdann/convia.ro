import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WebSocket } from 'ws';

/**
 * Supabase Service
 *
 * Uses the NEW Supabase API keys (sb_secret_...) for backend operations.
 * Docs: https://supabase.com/docs/guides/api/api-keys
 *
 * Key Types:
 * - Publishable key (sb_publishable_...): For client-side, respects RLS
 * - Secret key (sb_secret_...): For backend only, bypasses RLS
 *
 * This service uses the SECRET KEY for full database access.
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('supabase.url');

    // Prefer new secret key, fall back to legacy service_role key
    const secretKey =
      this.configService.get<string>('supabase.secretKey') ||
      this.configService.get<string>('supabase.serviceRoleKey');

    if (!url || !secretKey) {
      this.logger.error(
        'Supabase URL or Secret Key not configured. Check your environment variables.',
      );
      throw new Error('Supabase configuration missing');
    }

    // Log which key type is being used (for debugging, don't log actual keys!)
    if (secretKey.startsWith('sb_secret_')) {
      this.logger.log('Using new Supabase Secret Key (sb_secret_...)');
    } else if (secretKey.startsWith('eyJ')) {
      this.logger.warn(
        'Using legacy service_role JWT key. Consider migrating to sb_secret_ keys.',
      );
    }

    this.client = createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        // Node 20 has no native WebSocket — provide `ws` as the transport.
        transport: WebSocket as unknown as typeof globalThis.WebSocket,
      },
    });

    this.logger.log('Supabase client initialized successfully');
  }

  /**
   * Get the Supabase client with admin/secret access
   * Use this for operations that need to bypass RLS
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Get a Supabase client scoped to a specific user
   * This respects RLS policies for that user
   */
  getClientForUser(accessToken: string): SupabaseClient {
    const url = this.configService.get<string>('supabase.url');
    const publishableKey =
      this.configService.get<string>('supabase.publishableKey') ||
      this.configService.get<string>('supabase.anonKey');

    if (!url || !publishableKey) {
      throw new Error('Supabase URL or publishable key not configured');
    }

    return createClient(url, publishableKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        transport: WebSocket as unknown as typeof globalThis.WebSocket,
      },
    });
  }

  // ============================================
  // Storage Operations
  // ============================================

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    options?: {
      contentType?: string;
      upsert?: boolean;
    },
  ): Promise<{ path: string; error?: Error }> {
    const { data, error } = await this.client.storage.from(bucket).upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? false,
    });

    if (error) {
      this.logger.error(`Failed to upload file to ${bucket}/${path}:`, error.message);
      return { path: '', error: new Error(error.message) };
    }

    return { path: data.path };
  }

  async deleteFile(bucket: string, paths: string[]): Promise<{ error?: Error }> {
    const { error } = await this.client.storage.from(bucket).remove(paths);

    if (error) {
      this.logger.error(`Failed to delete files from ${bucket}:`, error.message);
      return { error: new Error(error.message) };
    }

    return {};
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600,
  ): Promise<{ url: string; error?: Error }> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      this.logger.error(`Failed to create signed URL for ${bucket}/${path}:`, error.message);
      return { url: '', error: new Error(error.message) };
    }

    return { url: data.signedUrl };
  }

  // ============================================
  // Auth Helpers (for verifying users)
  // ============================================

  async getUser(accessToken: string) {
    const { data, error } = await this.client.auth.getUser(accessToken);

    if (error) {
      this.logger.warn('Failed to get user from token:', error.message);
      return null;
    }

    return data.user;
  }
}
