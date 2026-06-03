// src/dress/dress.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DressService } from './dress.service';
import { CreateDressDto } from './dto/create-dress.dto';
import { UpdateDressDto } from './dto/update-dress.dto';

/**
 * Konfigurasi multer — foto disimpan ke folder public/uploads/dresses
 */
const multerConfig = {
  storage: diskStorage({
    destination: './public/uploads/dresses',
    filename: (req, file, cb) => {
      // Nama file: timestamp-random + ekstensi asli
      // Contoh: 1714900000000-123456789.jpg
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    // Hanya izinkan gambar
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp|avif)$/)) {
      cb(
        new Error(
          'Hanya file gambar yang diizinkan (jpg, jpeg, png, webp, avif)',
        ),
        false,
      );
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // maks 5MB per foto
};

@Controller('dresses')
export class DressController {
  constructor(private dressService: DressService) {}

  /**
   * POST /dresses
   * Gunakan multipart/form-data karena ada upload foto
   * Maks 10 foto sekaligus
   */
  @Post()
  @UseInterceptors(FilesInterceptor('photos', 10, multerConfig))
  create(
    @Body() dto: CreateDressDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.dressService.create(dto, files ?? []);
  }

  @Get()
  findAll() {
    return this.dressService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.dressService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dressService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('photos', 10, multerConfig))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDressDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.dressService.update(id, dto, files ?? []);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dressService.remove(id);
  }

  /** PATCH /dresses/:dressId/photos/:photoId/thumbnail */
  @Patch(':dressId/photos/:photoId/thumbnail')
  setThumbnail(
    @Param('dressId', ParseIntPipe) dressId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.dressService.setThumbnail(dressId, photoId);
  }

  /** DELETE /dresses/:dressId/photos/:photoId */
  @Delete(':dressId/photos/:photoId')
  removePhoto(
    @Param('dressId', ParseIntPipe) dressId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.dressService.removePhoto(dressId, photoId);
  }
}

// ════════════════════════════════════════
// src/dress/dress.module.ts
// ════════════════════════════════════════

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dress } from './dress.entity';
import { DressPhoto } from './dress-photo.entity';
import { DressSize } from './dress-size.entity';

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
