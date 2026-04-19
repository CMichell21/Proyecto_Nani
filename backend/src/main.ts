import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081', // Expo web local
    process.env.FRONTEND_URL || 'https://proyectonani123.nancarrillo20032114.workers.dev',
  ],
  credentials: true,
});

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

}
bootstrap();
