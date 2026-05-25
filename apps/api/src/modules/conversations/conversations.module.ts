import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

/**
 * ConversationsModule — authenticated endpoints for the dashboard inbox.
 *
 *   GET    /api/teams/:teamId/agents/:agentId/conversations
 *   GET    /api/teams/:teamId/agents/:agentId/conversations/:conversationId
 *   PATCH  /api/teams/:teamId/agents/:agentId/conversations/:conversationId    (status)
 *   POST   /api/teams/:teamId/agents/:agentId/conversations/:conversationId/takeover
 *   POST   /api/teams/:teamId/agents/:agentId/conversations/:conversationId/release
 *   POST   /api/teams/:teamId/agents/:agentId/conversations/:conversationId/messages
 *           — send a human-agent reply
 */
@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, TeamMember])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService, TypeOrmModule],
})
export class ConversationsModule {}
