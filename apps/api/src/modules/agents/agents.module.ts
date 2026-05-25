import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../../entities/agent.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';

/**
 * AgentsModule
 *
 * Endpoints (all team-scoped under /api/teams/:teamId/agents):
 *   GET    /          — list bots in workspace (filtered by human_agent access)
 *   POST   /          — create bot (developer+)
 *   GET    /:agentId  — get bot detail (filtered by access)
 *   PATCH  /:agentId  — update bot (developer+)
 *   DELETE /:agentId  — delete bot (admin+)
 *   POST   /:agentId/publish          — promote draft → active (developer+)
 *   POST   /:agentId/regenerate-key   — rotate API key (admin+)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Agent, TeamMember])],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService, TypeOrmModule],
})
export class AgentsModule {}
