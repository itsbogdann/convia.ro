import { IsEnum, IsOptional } from 'class-validator';
import { ConversationStatus } from '@convia/shared-types';

export class UpdateConversationDto {
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;
}
