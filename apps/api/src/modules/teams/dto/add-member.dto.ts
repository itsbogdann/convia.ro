import { IsArray, IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TeamRole } from '@convia/shared-types';

export class AddMemberDto {
  /** Email of the user being added. Must have an existing Convia profile. */
  @IsEmail()
  email!: string;

  @IsEnum(TeamRole)
  role!: TeamRole;

  /** For role=HUMAN_AGENT only. Empty array = access to all bots. */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedAgentIds?: string[];
}
