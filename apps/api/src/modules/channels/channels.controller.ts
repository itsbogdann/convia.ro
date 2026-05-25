import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TeamRole } from '@convia/shared-types';
import { Roles } from '../../common/decorators/roles.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TeamMemberGuard } from '../../common/guards/team-member.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@ApiTags('Channels')
@ApiBearerAuth()
@Controller('teams/:teamId/agents/:agentId/channels')
@UseGuards(SupabaseAuthGuard, TeamMemberGuard)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  list(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
  ) {
    return this.channelsService.list(teamId, agentId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  create(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: CreateChannelDto,
  ) {
    return this.channelsService.create(teamId, agentId, dto);
  }

  @Patch(':channelId')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  update(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Body() dto: UpdateChannelDto,
  ) {
    return this.channelsService.update(teamId, agentId, channelId, dto);
  }

  @Delete(':channelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  async remove(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('channelId', ParseUUIDPipe) channelId: string,
  ) {
    await this.channelsService.remove(teamId, agentId, channelId);
  }
}
