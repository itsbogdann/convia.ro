import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { ChannelStatus } from '@convia/shared-types';

export class UpdateChannelDto {
  @IsOptional()
  @IsEnum(ChannelStatus)
  status?: ChannelStatus;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
