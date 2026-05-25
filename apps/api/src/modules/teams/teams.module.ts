import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../../entities/profile.entity';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

/**
 * TeamsModule
 *
 * Owns the workspace + membership API. Endpoints:
 *
 *   POST   /api/teams                                 — create workspace
 *   GET    /api/teams/:teamId                         — get workspace
 *   PATCH  /api/teams/:teamId                         — update settings (admin+)
 *   DELETE /api/teams/:teamId                         — delete workspace (owner only)
 *
 *   GET    /api/teams/:teamId/members                 — list members
 *   POST   /api/teams/:teamId/members                 — add member by email (admin+)
 *   PATCH  /api/teams/:teamId/members/:memberId       — update role / assigned bots (admin+)
 *   DELETE /api/teams/:teamId/members/:memberId       — remove (admin+, or self)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Profile, Team, TeamMember])],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
