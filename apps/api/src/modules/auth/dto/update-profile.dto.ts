import { IsIn, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @IsOptional()
  @IsIn(['ro', 'en'])
  locale?: 'ro' | 'en';

  @IsOptional()
  @IsObject()
  preferences?: Record<string, unknown>;
}
