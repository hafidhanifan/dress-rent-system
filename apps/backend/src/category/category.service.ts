import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  /**
   * Buat slug dari nama
   * "Evening Gown" → "evening-gown"
   * Dipakai saat create/update jika slug tidak diisi manual
   */
  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // spasi → strip
      .replace(/[^a-z0-9-]/g, '') // hapus karakter selain huruf, angka, strip
      .replace(/-+/g, '-'); // strip berulang → satu strip
  }

  // ── CREATE ──────────────────────────────
  async create(dto: CreateCategoryDto): Promise<Category> {
    // Generate slug dari nama jika tidak diisi
    const slug = dto.slug ? dto.slug : this.toSlug(dto.name);

    // Cek duplikat nama
    const existingName = await this.categoryRepo.findOne({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException(`Kategori "${dto.name}" sudah ada`);
    }

    // Cek duplikat slug
    const existingSlug = await this.categoryRepo.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException(`Slug "${slug}" sudah digunakan`);
    }

    const category = this.categoryRepo.create({
      ...dto,
      slug,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.categoryRepo.save(category);
  }

  // ── READ ALL ─────────────────────────────
  async findAll(): Promise<Category[]> {
    /**
     * Ambil semua kategori, urutkan berdasarkan field "order"
     * Nanti saat Dress entity sudah dibuat, kita bisa tambahkan
     * .loadRelationCountAndMap() untuk menghitung jumlah dress per kategori
     */
    return this.categoryRepo.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  // ── READ ONE ─────────────────────────────
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Kategori dengan ID ${id} tidak ditemukan`);
    }
    return category;
  }

  // ── READ BY SLUG (untuk halaman publik) ──
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { slug } });
    if (!category) {
      throw new NotFoundException(`Kategori "${slug}" tidak ditemukan`);
    }
    return category;
  }

  // ── UPDATE ───────────────────────────────
  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    // Pastikan kategori ada
    const category = await this.findOne(id);

    // Kalau nama diubah, buat slug baru
    if (dto.name && dto.name !== category.name) {
      const newSlug = dto.slug ?? this.toSlug(dto.name);

      // Cek tidak bentrok dengan kategori lain
      const conflict = await this.categoryRepo.findOne({
        where: { slug: newSlug },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Slug "${newSlug}" sudah digunakan`);
      }

      dto.slug = newSlug;
    }

    // Object.assign → update field yang ada di dto saja
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  // ── DELETE ───────────────────────────────
  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);

    /**
     * TODO: setelah Dress entity dibuat, tambahkan pengecekan:
     * Jika kategori masih punya dress, tolak penghapusan
     * atau set dressnya ke null dulu
     *
     * Contoh:
     * const dressCount = await this.dressRepo.count({ where: { categoryId: id } });
     * if (dressCount > 0) throw new ConflictException('Kategori masih memiliki dress');
     */

    await this.categoryRepo.remove(category);
    return { message: `Kategori "${category.name}" berhasil dihapus` };
  }

  // ── TOGGLE ACTIVE ────────────────────────
  async toggleActive(id: number): Promise<Category> {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    return this.categoryRepo.save(category);
  }
}
