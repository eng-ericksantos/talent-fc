import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import fastifyMultipart from '@fastify/multipart';
import { initializeApp, cert } from 'firebase-admin/app';
import * as path from 'path';
import { AppModule } from './app.module';

initializeApp({
  credential: cert(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(path.join(__dirname, '..', 'firebase-service-account.json')),
  ),
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Registrar plugin de multipart antes de habilitar CORS
  await app.register(fastifyMultipart, { limits: { fileSize: 52428800 } }); // 50MB

  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:8100'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

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

  app.setGlobalPrefix('api/v1');

  const configuracaoSwagger = new DocumentBuilder()
    .setTitle('TalentFC Core API')
    .setDescription(
      'API de fornecimento de dados de jogadores para o Modo Carreira do TalentFC. ' +
      'Expõe endpoints para listagem, filtro por categoria e busca de jogadores.',
    )
    .setVersion('1.0')
    .build();

  const documento = SwaggerModule.createDocument(app, configuracaoSwagger);
  SwaggerModule.setup('api/docs', app, documento);

  const porta = process.env.PORT ?? 3000;
  await app.listen(porta, '0.0.0.0');
}

bootstrap();
