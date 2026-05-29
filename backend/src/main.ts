import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilitar CORS para conectar con Next.js
  await app.listen(process.env.PORT ?? 4000);
  console.log('Backend running on http://localhost:4000');
}
bootstrap();
