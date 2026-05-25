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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TeamMemberGuard } from '../../common/guards/team-member.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@ApiTags('Agents')
@ApiBearerAuth()
@Controller('teams/:teamId/agents')
@UseGuards(SupabaseAuthGuard, TeamMemberGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  list(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.agentsService.list(teamId, userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  create(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() dto: CreateAgentDto,
  ) {
    return this.agentsService.create(teamId, dto);
  }

  @Get(':agentId')
  getOne(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.agentsService.findOne(teamId, agentId, userId);
  }

  @Patch(':agentId')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  update(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.agentsService.update(teamId, agentId, dto);
  }

  @Delete(':agentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  async remove(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
  ) {
    await this.agentsService.remove(teamId, agentId);
  }

  /** Promote a draft bot to active. */
  @Post(':agentId/publish')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  publish(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
  ) {
    return this.agentsService.publish(teamId, agentId);
  }

  /** Rotate the bot's API key (used by the embed widget). */
  @Post(':agentId/regenerate-key')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  regenerateKey(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
  ) {
    return this.agentsService.regenerateApiKey(teamId, agentId);
  }
}
