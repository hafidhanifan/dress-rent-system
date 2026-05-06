import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Dress } from './dress.entity';

@Entity('dress_sizes')
export class DressSize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  bust: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  waist: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  hip: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  length: number | null;

  @Column({ default: 1 })
  stock: number;

  @ManyToOne(() => Dress, (dress) => dress.sizes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dressId' })
  dress: Dress;

  @Column()
  dressId: number;
}
