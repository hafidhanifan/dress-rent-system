import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Relasi One-to-Many:
 * Satu kategori → bisa punya banyak dress
 *
 * Artinya: "satu Category bisa punya banyak Dress"
 * Ini akan kita tambahkan nanti saat membuat entity Dress
 * Untuk sekarang kita comment dulu supaya tidak error
 */

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nama kategori — harus unik
   * Contoh: "Evening Gown", "Midi Dress", "Cocktail"
   */
  @Column({ unique: true })
  name: string;

  /**
   * Slug untuk URL — dibuat otomatis dari nama
   * Contoh: "evening-gown", "midi-dress"
   */
  @Column({ unique: true })
  slug: string;

  /**
   * Deskripsi singkat kategori
   * nullable: true → boleh kosong
   */
  @Column({ nullable: true })
  description: string;

  /**
   * Urutan tampil di website
   * Angka kecil = tampil lebih dulu
   */
  @Column({ default: 0 })
  order: number;

  /**
   * Aktif atau tidak — kategori yang tidak aktif
   * tidak akan muncul di website publik
   */
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Virtual field — jumlah dress di kategori ini
   * Tidak disimpan di database, dihitung saat query
   * Akan diisi nanti setelah entity Dress dibuat
   */

  dressCount?: number;
}
