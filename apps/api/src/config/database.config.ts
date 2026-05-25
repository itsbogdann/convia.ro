import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { entities } from '../entities';

/**
 * TypeORM Configuration Factory
 *
 * Connects to Supabase PostgreSQL database.
 * Uses environment variables for connection details.
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('database.url');

  // If DATABASE_URL is provided, parse it
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities,
      // IMPORTANT: Set to false in production
      // Schema is managed by Supabase migrations
      synchronize: false,
      // SSL configuration for Supabase
      ssl: {
        rejectUnauthorized: false,
      },
      // Connection pool settings
      extra: {
        max: 10,
        connectionTimeoutMillis: 10000,
      },
      // Logging
      logging: configService.get('app.env') === 'development' ? ['error', 'warn'] : ['error'],
    };
  }

  // Otherwise, use individual connection parameters
  return {
    type: 'postgres',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.database'),
    entities,
    // IMPORTANT: Set to false in production
    // Schema is managed by Supabase migrations
    synchronize: false,
    // SSL configuration for Supabase
    ssl: configService.get<boolean>('database.ssl')
      ? {
          rejectUnauthorized: false,
        }
      : false,
    // Connection pool settings
    extra: {
      max: 10,
      connectionTimeoutMillis: 10000,
    },
    // Logging
    logging: configService.get('app.env') === 'development' ? ['error', 'warn'] : ['error'],
  };
};

/**
 * Database configuration for app.module.ts
 *
 * Usage:
 * ```typescript
 * TypeOrmModule.forRootAsync({
 *   imports: [ConfigModule],
 *   inject: [ConfigService],
 *   useFactory: getDatabaseConfig,
 * })
 * ```
 */
export default getDatabaseConfig;
