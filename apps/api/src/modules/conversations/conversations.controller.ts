import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConversationStatus } from '@convia/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TeamMemberGuard } from '../../common/guards/team-member.guard';
import { ConversationsService } from './conversations.service';
import { SendHumanMessageDto } from './dto/send-human-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller('teams/:teamId/agents/:agentId/conversations')
@UseGuards(SupabaseAuthGuard, TeamMemberGuard)
export class ConversationsController {
  constructor(private readonly service: ConversationsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Query('status') status?: ConversationStatus,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.list(userId, teamId, agentId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':conversationId')
  findOne(
    @CurrentUser('id') userId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.service.findOne(userId, teamId, agentId, conversationId);
  }

  @Patch(':conversationId')
  update(
    @CurrentUser('id') userId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: UpdateConversationDto,
  ) {
    if (!dto.status) {
      throw new Error('Nothing to update');
    }
    return this.service.updateStatus(userId, teamId, agentId, conversationId, dto.status);
  }

  /** Claim ownership of the conversation. Bot stops responding. */
  @Post(':conversationId/takeover')
  takeOver(
    @CurrentUser('id') userId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.service.takeOver(userId, teamId, agentId, conversationId);
  }

  /** Release back to the bot. */
  @Post(':conversationId/release')
  release(
    @CurrentUser('id') userId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.service.release(userId, teamId, agentId, conversationId);
  }

  /** Send a message as a human agent. Auto-takeover if needed. */
  @Post(':conversationId/messages')
  sendMessage(
    @CurrentUser('id') userId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendHumanMessageDto,
  ) {
    return this.service.sendHumanMessage(
      userId,
      teamId,
      agentId,
      conversationId,
      dto.content,
    );
  }
}
