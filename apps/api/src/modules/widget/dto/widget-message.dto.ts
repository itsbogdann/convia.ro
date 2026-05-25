import {
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class WidgetMessageDto {
  /** Browser-generated session ID; reused for the duration of the visitor's session. */
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  sessionId!: string;

  /** Stable per-visitor identifier (cookie / localStorage on the host site). */
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  visitorId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;

  /** Host page URL where the message was sent from. */
  @IsOptional()
  @IsUrl({ require_tld: false })
  sourceUrl?: string;

  @IsOptional()
  @IsObject()
  visitorMetadata?: Record<string, unknown>;
}
