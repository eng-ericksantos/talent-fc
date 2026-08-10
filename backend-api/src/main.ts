import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { AppModule } from './app.module';

admin.initializeApp({
  credential: admin.credential.cert(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(path.join(__dirname, '..', 'firebase-service-account.json')),
  ),
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:8100'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

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
