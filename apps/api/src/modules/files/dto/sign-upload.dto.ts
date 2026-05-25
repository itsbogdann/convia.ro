import { IsIn, IsInt, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';

const ALLOWED_BUCKETS = ['kb-sources', 'agent-assets'] as const;

export class SignUploadDto {
  @IsIn(ALLOWED_BUCKETS)
  bucket!: (typeof ALLOWED_BUCKETS)[number];

  /** Original filename (used to derive extension + content-type). */
  @IsString()
  @MaxLength(255)
  filename!: string;

  /** Optional content type override. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contentType?: string;

  /** Optional content size hint (in bytes). Used for client-side validation. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50 * 1024 * 1024)
  sizeBytes?: number;
}
