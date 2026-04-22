import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); //izinkan Next.js untuk mengakses backend
  await app.listen(process.env.PORT ?? 3001); //ganti port supaya tidak bentrok
  console.log('Backend jalan di port 3001');
}
bootstrap();
