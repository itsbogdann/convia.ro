import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../../entities/agent.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { KnowledgeBase } from '../../entities/knowledge-base.entity';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { WidgetAuthGuard } from './guards/widget-auth.guard';

/**
 * WidgetModule — anonymous endpoints called by the embedded chat widget.
 * Auth is via the bot's per-agent `api_key` (header `X-API-Key`), validated
 * by `WidgetAuthGuard`. Bypasses the global Supabase JWT guard via @Public().
 *
 *   GET    /api/widget/config                          (header X-API-Key)
 *   POST   /api/widget/messages                        (header X-API-Key)
 *   GET    /api/widget/sessions/:sessionId/messages    (header X-API-Key)
 *
 * Chat flow:
 *   1. Resolve or create the conversation (per-session, 30-min inactivity)
 *   2. Run usage check — Free plan rejects at hard cap, paid flags overage
 *   3. Save user message
 *   4. If human-takeover: stay silent, just broadcast
 *   5. Otherwise: RAG search → build prompt → call OpenAI → save reply
 *   6. Broadcast both messages to widget channel + team inbox channel
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, Conversation, Message, KnowledgeBase]),
    KnowledgeBaseModule,
  ],
  controllers: [WidgetController],
  providers: [WidgetService, WidgetAuthGuard],
  exports: [WidgetService],
})
export class WidgetModule {}
