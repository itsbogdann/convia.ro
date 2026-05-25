import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../../entities/profile.entity';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * AuthModule
 *
 * Exposes `/api/auth/me` and `/api/auth/me/sync`. The actual JWT validation
 * is handled globally by `SupabaseAuthGuard` (registered in app.module.ts),
 * so endpoints here are guaranteed to have an authenticated user.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Profile, Team, TeamMember])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
