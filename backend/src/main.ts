import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = app.get(ConfigService);
  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  
  // Convertimos la cadena separada por comas en un array de orígenes
  const origins = corsOrigin.split(',').map((o) => o.trim());

  app.enableCors({ origin: origins, credentials: true });
  app.setGlobalPrefix('api/v1');

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}
bootstrap();
