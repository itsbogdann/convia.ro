import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';

import configuration from './config/configuration';
import { getDatabaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { TeamsModule } from './modules/teams/teams.module';
import { AgentsModule } from './modules/agents/agents.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { WidgetModule } from './modules/widget/widget.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';

/**
 * Convia API root module.
 *
 * Feature modules are added one at a time as we rebuild them under Path B.
 * The current skeleton boots auth + DB + config + common services so the
 * server runs even before any feature endpoints exist.
 *
 * Next modules to wire (in order):
 *   1. AuthModule        — /api/auth/me, session validation
 *   2. TeamsModule       — /api/teams, member management
 *   3. AgentsModule      — /api/teams/:teamId/agents
 *   4. ChannelsModule    — /api/teams/:teamId/agents/:agentId/channels
 *   5. KnowledgeBaseModule
 *   6. ConversationsModule
 *   7. WidgetModule      — anonymous /api/widget/* endpoints
 *   8. BillingModule     — Stripe subscriptions + metered usage
 *   9. NotificationsModule
 *   10. FilesModule
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [
        '../../.env.local',
        '../../.env',
        '.env.local',
        '.env',
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 50 },
      { name: 'long', ttl: 60000, limit: 200 },
    ]),
    CommonModule,
    AuthModule,
    TeamsModule,
    AgentsModule,
    ChannelsModule,
    KnowledgeBaseModule,
    ConversationsModule,
    WidgetModule,
    BillingModule,
    NotificationsModule,
    FilesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
