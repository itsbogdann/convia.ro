import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateKnowledgeBaseDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(200)
  @Max(4000)
  chunkSize?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  chunkOverlap?: number;
}
