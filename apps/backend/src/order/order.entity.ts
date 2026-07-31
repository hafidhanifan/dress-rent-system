import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Dress } from '../dress/dress.entity';
import { DressSize } from '../dress/dress-size.entity';

/**
 * Status pesanan:
 * pending    = menunggu pembayaran
 * paid       = sudah dibayar, menunggu konfirmasi
 * confirmed  = dikonfirmasi, dress siap dikirim
 * active     = dress sedang disewa
 * returned   = dress sudah dikembalikan
 * cancelled  = dibatalkan
 */
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  dressId: number;

  @Column({ nullable: true })
  sizeId: number;

  /** Tanggal mulai sewa */
  @Column({ type: 'date' })
  startDate: string;

  /** Tanggal selesai sewa */
  @Column({ type: 'date' })
  endDate: string;

  /** Jumlah hari sewa */
  @Column()
  totalDays: number;

  /** Total harga = pricePerDay × totalDays */
  @Column({ type: 'decimal', precision: 14, scale: 0 })
  totalPrice: number;

  /** Catatan dari penyewa (opsional) */
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'pending' })
  status:
    | 'pending'
    | 'paid'
    | 'confirmed'
    | 'active'
    | 'returned'
    | 'cancelled';

  /** Token Midtrans — diisi saat payment dibuat */
  @Column({ nullable: true })
  snapToken: string;

  /** ID transaksi Midtrans */
  @Column({ nullable: true })
  transactionId: string;

  // Batas waktu pembayaran kalo lewat dan masih pending, otomatis cancel
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  /** Tanggal aktual dress dikembalikan — diisi manual oleh admin */
  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date | null;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Dress, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dressId' })
  dress: Dress;

  @ManyToOne(() => DressSize, { eager: true, nullable: true })
  @JoinColumn({ name: 'sizeId' })
  size: DressSize;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
