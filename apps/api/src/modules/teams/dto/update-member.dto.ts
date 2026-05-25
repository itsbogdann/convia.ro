import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TeamRole } from '@convia/shared-types';

export class UpdateMemberDto {
  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedAgentIds?: string[];
}
