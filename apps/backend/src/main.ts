import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // untuk menghapus field yang tidak ada di DTO
      forbidNonWhitelisted: true, // error jika field tidak dikenal
      transform: true, // otomatis konversi tipe data
    }),
  );

  //izinkan Next.js untuk mengakses backend atau izinkan request dari front end
  app.enableCors({ origin: 'http://localhost:3000' });

  await app.listen(process.env.PORT ?? 3001); //ganti port supaya tidak bentrok
  // console.log('Backend jalan di port 3001');
}
bootstrap();
