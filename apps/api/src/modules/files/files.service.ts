import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { SupabaseService } from '../../common/services/supabase.service';

export interface SignedUpload {
  /** Bucket and team-scoped path the client should upload to. */
  bucket: string;
  path: string;
  /** Pre-signed PUT URL — direct upload, no API proxy. */
  uploadUrl: string;
  /** Token to include in the signed-URL request (Supabase quirk). */
  token: string;
  /** Read URL after upload finishes (may need re-signing for private buckets). */
  publicReadUrl?: string;
}

const ALLOWED_EXTENSIONS: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  csv: 'text/csv',
  txt: 'text/plain',
  md: 'text/markdown',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Issue a pre-signed upload URL for a Supabase Storage bucket. The path
   * is namespaced under the team ID so RLS on the bucket can scope access.
   *
   * Convia uses two buckets:
   *   - `kb-sources`    : knowledge-base file uploads (private)
   *   - `agent-assets`  : bot avatars, logos, etc. (public-read)
   */
  async createSignedUpload(
    teamId: string,
    userId: string,
    input: {
      bucket: string;
      filename: string;
      contentType?: string;
      sizeBytes?: number;
    },
  ): Promise<SignedUpload> {
    const ext = this.safeExtension(input.filename);
    if (!ext || !ALLOWED_EXTENSIONS[ext]) {
      throw new BadRequestException(
        `Tipul de fișier ".${ext}" nu este acceptat. Acceptate: ${Object.keys(ALLOWED_EXTENSIONS).join(', ')}`,
      );
    }

    const contentType = input.contentType || ALLOWED_EXTENSIONS[ext];
    const sizeLimit = 50 * 1024 * 1024;
    if (input.sizeBytes && input.sizeBytes > sizeLimit) {
      throw new BadRequestException('Fișierul trebuie să fie sub 50 MB');
    }

    const random = randomBytes(8).toString('hex');
    const path = `${teamId}/${userId}/${Date.now()}-${random}.${ext}`;

    const client = this.supabase.getClient();
    const { data, error } = await client.storage
      .from(input.bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      this.logger.error(`Failed to create signed upload: ${error?.message}`);
      throw new InternalServerErrorException(
        'Could not generate upload URL. Make sure the storage bucket exists.',
      );
    }

    // For public buckets, the read URL is deterministic. Private buckets
    // need a separate signed-read URL request when serving the file.
    const { data: publicData } = client.storage
      .from(input.bucket)
      .getPublicUrl(path);

    return {
      bucket: input.bucket,
      path,
      uploadUrl: data.signedUrl,
      token: data.token,
      publicReadUrl:
        input.bucket === 'agent-assets' ? publicData.publicUrl : undefined,
    };
  }

  /**
   * Generate a short-lived signed read URL for a private file. Used by the
   * KB module when fetching uploaded sources for parsing.
   */
  async getSignedReadUrl(
    bucket: string,
    path: string,
    expiresInSeconds = 60 * 60,
  ): Promise<string> {
    const client = this.supabase.getClient();
    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);
    if (error || !data) {
      throw new InternalServerErrorException(
        `Could not sign read URL: ${error?.message ?? 'unknown'}`,
      );
    }
    return data.signedUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const client = this.supabase.getClient();
    const { error } = await client.storage.from(bucket).remove([path]);
    if (error) {
      throw new InternalServerErrorException(
        `Could not delete file: ${error.message}`,
      );
    }
  }

  private safeExtension(filename: string): string | null {
    const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
    return match ? match[1] : null;
  }
}
