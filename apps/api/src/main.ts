import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    // Enable raw body for Stripe webhook signature verification
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // CORS Configuration
  // Widget endpoints (/api/widget/*) must be accessible from any origin
  // since the chat widget is embedded on customer websites.
  // All other endpoints use the configured allowed origins.
  const corsOrigins = configService.get<string[]>('app.corsOrigins');
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow all origins — widget is embedded on external sites
      // and webhooks come from third-party services (Stripe, Telegram, etc.)
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Start server (Convia API runs on 9002 by default; landing 9000, web 9001, widget 9003)
  const port = configService.get<number>('app.port') || 9002;

  // Swagger documentation (disabled in production)
  const nodeEnv = configService.get('app.env') || process.env.NODE_ENV;
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Convia API')
      .setDescription('API documentation for Convia — chatbot AI pentru afaceri din România')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Teams', 'Workspace management')
      .addTag('Agents', 'Bot management')
      .addTag('Channels', 'Web widget + WhatsApp Business channels')
      .addTag('Knowledge Base', 'Knowledge base and documents')
      .addTag('Conversations', 'Conversation management + human takeover')
      .addTag('Billing', 'Subscriptions, usage, Stripe integration')
      .addTag('Widget', 'Public widget API (no auth)')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
  }

  await app.listen(port);

  logger.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
