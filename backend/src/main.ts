import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  const lanPattern =
    /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        localhostPattern.test(origin) ||
        lanPattern.test(origin) ||
        configuredOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origen no permitido por CORS: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
