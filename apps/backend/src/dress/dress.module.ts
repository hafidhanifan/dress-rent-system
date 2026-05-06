import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dress } from './dress.entity';
import { DressPhoto } from './dress-photo.entity';
import { DressSize } from './dress-size.entity';
import { DressController } from './dress.controller';
import { DressService } from './dress.service';

@Module({
  imports: [
    // Daftarkan ketiga entity — Dress, DressPhoto, DressSize
    TypeOrmModule.forFeature([Dress, DressPhoto, DressSize]),
  ],
  controllers: [DressController],
  providers: [DressService],
  exports: [DressService],
})
export class DressModule {}
