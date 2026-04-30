import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * @Entity('users') → TypeORM akan buat tabel bernama "users" di PostgreSQL
 *
 * Setiap property dengan @Column() akan jadi kolom di tabel
 * TypeORM otomatis buat/update tabel saat app dijalankan
 * (karena synchronize: true di app.module.ts — hanya untuk development!)
 */
@Entity('users')
export class User {
  /**
   * ID otomatis — angka yang naik sendiri (1, 2, 3, ...)
   * Ini primary key tabel
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  /**
   * unique: true → tidak boleh ada 2 user dengan email sama
   */
  @Column({ unique: true })
  email: string;

  /**
   * select: false → password TIDAK ikut terkirim saat query user
   * Ini penting untuk keamanan — password tidak sengaja terekspos ke frontend
   */
  @Column({ select: false })
  password: string;

  @Column()
  phone: string;

  /**
   * Role menentukan akses user:
   * - 'user'  → pelanggan biasa
   * - 'admin' → pengelola toko
   *
   * default: 'user' → semua register baru otomatis jadi user biasa
   */
  @Column({ default: 'user' })
  role: 'user' | 'admin';

  /**
   * Timestamp otomatis — TypeORM yang isi, kita tidak perlu input manual
   */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
