import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    industry?: string;
    brandColor?: string;
    companyLegalName?: string;
    cui?: string;
    registrationNumber?: string;
    defaultLanguage?: 'ro' | 'en';
  };
}
