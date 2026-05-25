import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { DocumentSourceType } from '@convia/shared-types';

/**
 * Add a document to a knowledge base. Exactly one of `sourceUrl` or
 * `content` must be provided depending on `sourceType`:
 *
 *   sourceType = 'url'      → require `sourceUrl`
 *   sourceType = 'raw_text' → require `content`
 *
 * File-uploaded sources (pdf, docx, xlsx, csv) come through a separate
 * upload-then-create flow that posts the storage path as `sourceUrl`.
 */
export class CreateDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsEnum(DocumentSourceType)
  sourceType!: DocumentSourceType;

  /** Required when sourceType is `url` or a file path. */
  @ValidateIf((o: CreateDocumentDto) => o.sourceType !== DocumentSourceType.RAW_TEXT)
  @IsUrl({ require_tld: true, require_protocol: true })
  @MaxLength(1000)
  sourceUrl?: string;

  /** Required when sourceType is `raw_text`. */
  @ValidateIf((o: CreateDocumentDto) => o.sourceType === DocumentSourceType.RAW_TEXT)
  @IsString()
  @MinLength(20, { message: 'Raw text must be at least 20 characters' })
  @MaxLength(500_000, { message: 'Raw text must be under 500 000 characters' })
  content?: string;
}
