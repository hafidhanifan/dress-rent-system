import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * ValidationPipe → aktifkan validasi DTO secara global
   * Tanpa ini, decorator @IsEmail, @IsNotEmpty, dll tidak akan jalan
   *
   * whitelist: true → hapus field yang tidak ada di DTO (keamanan)
   * forbidNonWhitelisted: true → error jika ada field tidak dikenal
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Izinkan frontend Next.js akses backend
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);
  console.log('🚀 Backend jalan di http://localhost:3001');
}
bootstrap();
