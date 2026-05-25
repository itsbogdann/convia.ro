import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { ChannelType } from '@convia/shared-types';

export class CreateChannelDto {
  @IsEnum(ChannelType)
  type!: ChannelType;

  /**
   * Per-type config. Validated at the service level since shape differs:
   *   web:      { allowedDomains: string[] }
   *   whatsapp: { phoneNumberId, businessAccountId, encryptedToken, displayName? }
   */
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
