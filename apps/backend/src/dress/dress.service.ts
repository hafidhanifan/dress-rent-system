// src/dress/dress.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Dress } from './dress.entity';
import { DressPhoto } from './dress-photo.entity';
import { DressSize } from './dress-size.entity';
import { CreateDressDto, CreateDressSizeDto } from './dto/create-dress.dto';
import { UpdateDressDto } from './dto/update-dress.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DressService {
  constructor(
    @InjectRepository(Dress)
    private dressRepo: Repository<Dress>,
    @InjectRepository(DressPhoto)
    private photoRepo: Repository<DressPhoto>,
    @InjectRepository(DressSize)
    private sizeRepo: Repository<DressSize>,
  ) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  /**
   * Parse sizes dari FormData — dikirim sebagai JSON string
   * Mengembalikan array CreateDressSizeDto yang sudah bersih
   */
  private parseSizes(
    raw: CreateDressSizeDto[] | string | undefined,
  ): CreateDressSizeDto[] {
    if (!raw) return [];

    try {
      const parsed: CreateDressSizeDto[] =
        typeof raw === 'string'
          ? (JSON.parse(raw) as CreateDressSizeDto[])
          : raw;

      // Pastikan hasilnya array
      if (!Array.isArray(parsed)) return [];

      return parsed;
    } catch {
      throw new BadRequestException('Format sizes tidak valid');
    }
  }

  // ── CREATE ──────────────────────────────────────────────────
  async create(
    dto: CreateDressDto,
    files: Express.Multer.File[],
  ): Promise<Dress> {
    const slug = dto.slug ?? this.toSlug(dto.name);

    const existing = await this.dressRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictException(`Slug "${slug}" sudah digunakan`);

    // Parse sizes
    const sizes = this.parseSizes(dto.sizes);

    // Buat dan simpan dress
    const dress = this.dressRepo.create({
      name: dto.name,
      slug,
      description: dto.description,
      pricePerDay: dto.pricePerDay,
      minRentalDays: dto.minRentalDays ?? 1,
      status: dto.status ?? 'available',
      condition: dto.condition ?? 'good',
      color: dto.color,
      material: dto.material,
      isActive: dto.isActive ?? true,
      categoryId: dto.categoryId,
    });

    const saved = await this.dressRepo.save(dress);

    // Simpan ukuran
    if (sizes.length > 0) {
      const sizeEntities = sizes.map((s: CreateDressSizeDto) =>
        this.sizeRepo.create({
          label: s.label,
          bust: s.bust ?? null,
          waist: s.waist ?? null,
          hip: s.hip ?? null,
          length: s.length ?? null,
          stock: s.stock ?? 1,
          dressId: saved.id,
        }),
      );
      await this.sizeRepo.save(sizeEntities);
    }

    // Simpan foto — foto pertama otomatis jadi thumbnail
    if (files && files.length > 0) {
      const photoEntities = files.map((file, i) =>
        this.photoRepo.create({
          url: `/uploads/dresses/${file.filename}`,
          isThumbnail: i === 0,
          order: i,
          dressId: saved.id,
        }),
      );
      await this.photoRepo.save(photoEntities);
    }

    return this.findOne(saved.id);
  }

  // ── READ ALL ─────────────────────────────────────────────────
  async findAll(): Promise<Dress[]> {
    return this.dressRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findSpotlight(): Promise<Dress[]> {
    const spotlighted = await this.dressRepo.find({
      where: { spotlightOrder: Not(IsNull()), isActive: true },
      order: { spotlightOrder: 'ASC' },
      take: 4,
    });

    if (spotlighted.length > 0) return spotlighted;

    return this.dressRepo.find({
      where: { isActive: true, status: 'available' },
      order: { createdAt: 'DESC' },
      take: 4,
    });
  }

  // ── READ ONE ─────────────────────────────────────────────────
  async findOne(id: number): Promise<Dress> {
    const dress = await this.dressRepo.findOne({ where: { id } });
    if (!dress)
      throw new NotFoundException(`Dress dengan ID ${id} tidak ditemukan`);
    return dress;
  }

  async findBySlug(slug: string): Promise<Dress> {
    const dress = await this.dressRepo.findOne({ where: { slug } });
    if (!dress) throw new NotFoundException(`Dress tidak ditemukan`);
    return dress;
  }

  // ── UPDATE ───────────────────────────────────────────────────
  async update(
    id: number,
    dto: UpdateDressDto,
    files?: Express.Multer.File[],
  ): Promise<Dress> {
    const dress = await this.findOne(id);

    // Update slug jika nama berubah
    if (dto.name && dto.name !== dress.name) {
      const newSlug = dto.slug ?? this.toSlug(dto.name);
      const conflict = await this.dressRepo.findOne({
        where: { slug: newSlug },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Slug "${newSlug}" sudah digunakan`);
      }
      dress.slug = newSlug;
    }

    // Parse sizes
    const sizes = this.parseSizes(dto.sizes);

    // Update field dress — exclude sizes karena handle terpisah
    const { sizes: _sizes, slug: _slug, ...dressData } = dto;
    Object.assign(dress, dressData);
    await this.dressRepo.save(dress);

    // Update ukuran — hapus lama, buat baru
    if (sizes.length > 0) {
      await this.sizeRepo.delete({ dressId: id });
      const sizeEntities = sizes.map((s: CreateDressSizeDto) =>
        this.sizeRepo.create({
          label: s.label,
          bust: s.bust ?? null,
          waist: s.waist ?? null,
          hip: s.hip ?? null,
          length: s.length ?? null,
          stock: s.stock ?? 1,
          dressId: id,
        }),
      );
      await this.sizeRepo.save(sizeEntities);
    }

    // Tambah foto baru jika ada
    if (files && files.length > 0) {
      const existingCount = await this.photoRepo.count({
        where: { dressId: id },
      });
      const photoEntities = files.map((file, i) =>
        this.photoRepo.create({
          url: `/uploads/dresses/${file.filename}`,
          isThumbnail: existingCount === 0 && i === 0,
          order: existingCount + i,
          dressId: id,
        }),
      );
      await this.photoRepo.save(photoEntities);
    }

    return this.findOne(id);
  }

  // ── DELETE ───────────────────────────────────────────────────
  async remove(id: number): Promise<{ message: string }> {
    const dress = await this.findOne(id);

    // Hapus file foto dari disk sebelum hapus record
    const photos = await this.photoRepo.find({ where: { dressId: id } });
    for (const photo of photos) {
      const filePath = path.join(process.cwd(), 'public', photo.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await this.dressRepo.remove(dress);
    return { message: `Dress "${dress.name}" berhasil dihapus` };
  }

  // ── SET THUMBNAIL ────────────────────────────────────────────
  async setThumbnail(dressId: number, photoId: number): Promise<DressPhoto[]> {
    await this.photoRepo.update({ dressId }, { isThumbnail: false });
    await this.photoRepo.update(
      { id: photoId, dressId },
      { isThumbnail: true },
    );
    return this.photoRepo.find({ where: { dressId }, order: { order: 'ASC' } });
  }

  // ── DELETE FOTO ──────────────────────────────────────────────
  async removePhoto(
    dressId: number,
    photoId: number,
  ): Promise<{ message: string }> {
    const photo = await this.photoRepo.findOne({
      where: { id: photoId, dressId },
    });
    if (!photo) throw new NotFoundException('Foto tidak ditemukan');

    const filePath = path.join(process.cwd(), 'public', photo.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await this.photoRepo.remove(photo);

    // Kalau thumbnail yang dihapus, set foto pertama sebagai thumbnail baru
    if (photo.isThumbnail) {
      const firstPhoto = await this.photoRepo.findOne({
        where: { dressId },
        order: { order: 'ASC' },
      });
      if (firstPhoto) {
        firstPhoto.isThumbnail = true;
        await this.photoRepo.save(firstPhoto);
      }
    }

    return { message: 'Foto berhasil dihapus' };
  }
}
