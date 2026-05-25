import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../../entities/channel.entity';
import { Agent } from '../../entities/agent.entity';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

/**
 * ChannelsModule
 *
 * Endpoints (nested under agents):
 *   GET    /api/teams/:teamId/agents/:agentId/channels
 *   POST   /api/teams/:teamId/agents/:agentId/channels                (developer+)
 *   PATCH  /api/teams/:teamId/agents/:agentId/channels/:channelId     (developer+)
 *   DELETE /api/teams/:teamId/agents/:agentId/channels/:channelId     (developer+)
 *
 * Channel types supported in MVP: `web` (widget) and `whatsapp` (WhatsApp Business).
 * WhatsApp access tokens are encrypted via CredentialVaultService before persisting.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Channel, Agent])],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService, TypeOrmModule],
})
export class ChannelsModule {}
