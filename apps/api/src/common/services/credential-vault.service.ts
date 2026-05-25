import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  hkdfSync,
} from 'crypto';

/**
 * Credential Vault Service
 *
 * AES-256-GCM encryption for integration credential storage.
 * Uses HKDF key derivation with a master key + teamId salt
 * for per-tenant key isolation.
 *
 * If CREDENTIAL_ENCRYPTION_KEY is not set, the service loads
 * normally but throws a clear error when encrypt/decrypt is called.
 */
@Injectable()
export class CredentialVaultService {
  private readonly logger = new Logger(CredentialVaultService.name);
  private readonly masterKey: string | null;

  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;
  private static readonly KEY_LENGTH = 32;
  private static readonly HKDF_INFO = 'convia-credential-vault';

  constructor(private configService: ConfigService) {
    this.masterKey = this.configService.get<string>('integrations.credentialEncryptionKey') || null;

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    if (!this.masterKey && isProduction) {
      throw new Error(
        'CREDENTIAL_ENCRYPTION_KEY is required in production. ' +
        'Set this environment variable before starting the API.',
      );
    } else if (!this.masterKey) {
      this.logger.warn(
        'CREDENTIAL_ENCRYPTION_KEY not configured — credential encryption is unavailable. ' +
        'Set this env variable before connecting integrations.',
      );
    } else {
      this.logger.log('Credential vault initialized');
    }
  }

  /**
   * Check if the vault is configured and ready
   */
  isConfigured(): boolean {
    return this.masterKey !== null;
  }

  /**
   * Encrypt a plaintext value for a specific team.
   * Returns a string in format: base64(iv):base64(ciphertext):base64(authTag)
   */
  encrypt(plaintext: string, teamId: string): string {
    this.ensureConfigured();

    const derivedKey = this.deriveKey(teamId);
    const iv = randomBytes(CredentialVaultService.IV_LENGTH);

    const cipher = createCipheriv(CredentialVaultService.ALGORITHM, derivedKey, iv, {
      authTagLength: CredentialVaultService.AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      encrypted.toString('base64'),
      authTag.toString('base64'),
    ].join(':');
  }

  /**
   * Decrypt an encrypted value for a specific team.
   * Expects format: base64(iv):base64(ciphertext):base64(authTag)
   */
  decrypt(encryptedValue: string, teamId: string): string {
    this.ensureConfigured();

    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted value format — expected iv:ciphertext:authTag');
    }

    const [ivB64, ciphertextB64, authTagB64] = parts;
    const iv = Buffer.from(ivB64, 'base64');
    const ciphertext = Buffer.from(ciphertextB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    const derivedKey = this.deriveKey(teamId);

    const decipher = createDecipheriv(CredentialVaultService.ALGORITHM, derivedKey, iv, {
      authTagLength: CredentialVaultService.AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * Derive a per-tenant encryption key using HKDF.
   * Same master key + same teamId = same derived key (deterministic).
   */
  private deriveKey(teamId: string): Buffer {
    return Buffer.from(
      hkdfSync(
        'sha256',
        this.masterKey!,
        teamId,
        CredentialVaultService.HKDF_INFO,
        CredentialVaultService.KEY_LENGTH,
      ),
    );
  }

  /**
   * Ensure the master key is configured before attempting crypto operations.
   */
  private ensureConfigured(): void {
    if (!this.masterKey) {
      throw new Error(
        'Credential vault is not configured. Set CREDENTIAL_ENCRYPTION_KEY environment variable.',
      );
    }
  }
}
