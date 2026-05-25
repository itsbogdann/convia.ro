import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { SupabaseService } from './services/supabase.service';
import { PusherService } from './services/pusher.service';
import { OpenAIService } from './services/openai.service';
import { PineconeService } from './services/pinecone.service';
import { StripeService } from './services/stripe.service';
import { CredentialVaultService } from './services/credential-vault.service';
import { SupabaseVectorService } from './services/supabase-vector.service';
import { SupabaseRealtimeService } from './services/supabase-realtime.service';

// Entities used by team-member / team-admin guards
import { Profile } from '../entities/profile.entity';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';

// Guards
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamAdminGuard } from './guards/team-admin.guard';

/**
 * Common Module
 *
 * Provides global services and guards. Marked @Global() so feature modules
 * don't need to re-import it.
 *
 * Vector and realtime providers are pluggable via env:
 *   VECTOR_PROVIDER=supabase | pinecone   (default: supabase)
 *   REALTIME_PROVIDER=supabase | pusher   (default: supabase)
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Profile, Team, TeamMember]),
  ],
  providers: [
    // Always-on services
    SupabaseService,
    OpenAIService,
    StripeService,
    CredentialVaultService,

    // Vector provider (token resolves to Pinecone-flavored or Supabase-flavored impl)
    {
      provide: PineconeService,
      useFactory: (
        configService: ConfigService,
        supabaseService: SupabaseService,
        openaiService: OpenAIService,
      ) => {
        const provider = configService.get<string>('providers.vector') || 'supabase';
        if (provider === 'pinecone') {
          return new PineconeService(configService);
        }
        return new SupabaseVectorService(supabaseService, openaiService, configService);
      },
      inject: [ConfigService, SupabaseService, OpenAIService],
    },

    // Realtime provider (PusherService token, factory resolves the right impl)
    {
      provide: PusherService,
      useFactory: (configService: ConfigService, supabaseService: SupabaseService) => {
        const provider = configService.get<string>('providers.realtime') || 'supabase';
        if (provider === 'pusher') {
          return new PusherService(configService);
        }
        return new SupabaseRealtimeService(supabaseService, configService);
      },
      inject: [ConfigService, SupabaseService],
    },

    // Guards
    SupabaseAuthGuard,
    TeamMemberGuard,
    TeamAdminGuard,
  ],
  exports: [
    SupabaseService,
    OpenAIService,
    StripeService,
    CredentialVaultService,
    PineconeService,
    PusherService,
    SupabaseAuthGuard,
    TeamMemberGuard,
    TeamAdminGuard,
    TypeOrmModule,
  ],
})
export class CommonModule {}
