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
import { DressPhoto } from './dress-photo.entity';
import { DressSize } from './dress-size.entity';

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

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  pricePerDay: number;

  @Column({ default: 1 })
  minRentalDays: number;

  @Column({ default: 'available' })
  status: 'available' | 'unavailable' | 'archived';

  @Column({ default: 'good' })
  condition: 'new' | 'good' | 'fair';

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  material: string;

  @Column({ default: true })
  isActive: boolean;

  /**
   * Urutan tampil di Spotlight Section homepage
   * null = tidak ditampilkan di spotlight
   * 1, 2, 3, dst = urutan tampil (semakin kecil semakin awal)
   */
  @Column({ type: 'int', nullable: true })
  spotlightOrder: number | null;

  /**
   * Urutan tampil di halaman /dresses
   * null = fallback ke createdAt DESC (terbaru duluan)
   * 1, 2, 3, dst = urutan custom (angka kecil tampil duluan)
   */
  @Column({ type: 'int', nullable: true })
  displayOrder: number | null;

  @ManyToOne(() => Category, { eager: true, nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @OneToMany(() => DressPhoto, (photo) => photo.dress, {
    cascade: true,
    eager: true,
  })
  photos: DressPhoto[];

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
