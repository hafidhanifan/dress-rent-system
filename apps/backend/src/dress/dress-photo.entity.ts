import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Dress } from './dress.entity';

@Entity('dress_photos')
export class DressPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ default: false })
  isThumbnail: boolean;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Dress, (dress) => dress.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dressId' })
  dress: Dress;

  @Column()
  dressId: number;
}
