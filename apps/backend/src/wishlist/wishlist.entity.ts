import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Dress } from '../dress/dress.entity';

/**
 * Tabel wishlist — menyimpan dress yang di-like user
 * @Unique(['userId', 'dressId']) → satu user tidak bisa like dress yang sama 2x
 */
@Entity('wishlists')
@Unique(['userId', 'dressId'])
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  dressId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Dress, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dressId' })
  dress: Dress;

  @CreateDateColumn()
  createdAt: Date;
}
