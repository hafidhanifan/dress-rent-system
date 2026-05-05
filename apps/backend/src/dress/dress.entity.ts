// src/dress/dress.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';

/**
 * Entity DressPhoto — menyimpan foto-foto tiap dress
 * Relasi: satu Dress bisa punya banyak DressPhoto (One-to-Many)
 */
@Entity('dress_photos')
export class DressPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  /** Path file foto, disimpan relatif dari folder uploads */
  @Column()
  url: string;

  /** Apakah foto ini yang jadi thumbnail utama */
  @Column({ default: false })
  isThumbnail: boolean;

  /** Urutan tampil foto */
  @Column({ default: 0 })
  order: number;

  /** Relasi balik ke Dress */
  @ManyToOne(() => Dress, (dress) => dress.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dressId' })
  dress: Dress;

  @Column()
  dressId: number;
}

/**
 * Entity DressSize — ukuran detail per dress
 * Lebih informatif dari sekadar S/M/L
 */
@Entity('dress_sizes')
export class DressSize {
  @PrimaryGeneratedColumn()
  id: number;

  /** Label ukuran: XS, S, M, L, XL, XXL, atau custom */
  @Column()
  label: string;

  /** Lingkar dada dalam cm */
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  bust: number;

  /** Lingkar pinggang dalam cm */
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  waist: number;

  /** Lingkar pinggul dalam cm */
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  hip: number;

  /** Panjang dress dari bahu ke bawah dalam cm */
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  length: number;

  /** Stok untuk ukuran ini */
  @Column({ default: 1 })
  stock: number;

  @ManyToOne(() => Dress, (dress) => dress.sizes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dressId' })
  dress: Dress;

  @Column()
  dressId: number;
}

/**
 * Entity Dress — produk utama
 * Relasi:
 * - Many-to-One ke Category (banyak dress, satu kategori)
 * - One-to-Many ke DressPhoto
 * - One-to-Many ke DressSize
 */
@Entity('dresses')
export class Dress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /** Harga sewa per hari dalam Rupiah */
  @Column({ type: 'decimal', precision: 12, scale: 0 })
  pricePerDay: number;

  /** Minimal hari sewa */
  @Column({ default: 1 })
  minRentalDays: number;

  /**
   * Status dress:
   * available   = bisa disewa
   * unavailable = sedang disewa / tidak tersedia
   * archived    = tidak ditampilkan di website
   */
  @Column({ default: 'available' })
  status: 'available' | 'unavailable' | 'archived';

  /** Kondisi dress: new, good, fair */
  @Column({ default: 'good' })
  condition: 'new' | 'good' | 'fair';

  /** Warna dress */
  @Column({ nullable: true })
  color: string;

  /** Bahan/material dress */
  @Column({ nullable: true })
  material: string;

  /** Apakah dress aktif ditampilkan */
  @Column({ default: true })
  isActive: boolean;

  // ── Relasi ke Category ──
  @ManyToOne(() => Category, { eager: true, nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  // ── Relasi ke foto ──
  @OneToMany(() => DressPhoto, (photo) => photo.dress, {
    cascade: true,
    eager: true,
  })
  photos: DressPhoto[];

  // ── Relasi ke ukuran ──
  @OneToMany(() => DressSize, (size) => size.dress, {
    cascade: true,
    eager: true,
  })
  sizes: DressSize[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
