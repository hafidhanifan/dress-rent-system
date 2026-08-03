import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

/**
 * Service berisi semua logika bisnis yang berhubungan dengan User.
 * Controller hanya menerima request dan meneruskan ke service.
 * Service yang "bekerja" — ambil data, simpan ke DB, dll.
 */
@Injectable()
export class UserService {
  constructor(
    /**
     * @InjectRepository(User) → minta TypeORM berikan "alat"
     * untuk query tabel users. Namanya Repository.
     * Dengan ini kita bisa: findOne, save, delete, dll.
     */
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Buat user baru — dipanggil saat register
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // 1. Cek apakah email sudah dipakai
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // ConflictException → otomatis kirim HTTP 409 ke frontend
      throw new ConflictException('Email sudah terdaftar');
    }

    // 2. Enkripsi password sebelum disimpan
    // bcrypt.hash(password, saltRounds)
    // saltRounds: 10 → standar yang aman, makin besar makin lambat tapi makin aman
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 3. Buat objek user baru
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: 'user', // semua register baru = user biasa
    });

    // 4. Simpan ke database
    const savedUser = await this.userRepository.save(user);

    // 5. Hapus password dari response — jangan kirim ke frontend!
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  /**
   * Cari user berdasarkan email — dipakai saat login
   * addSelect('user.password') → khusus di sini password ikut diambil
   * untuk dicocokkan dengan input login
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // override select: false di entity
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Cari user berdasarkan ID — dipakai oleh JWT strategy
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Update profil user (nama, email, nomor HP)
   */
  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // Kalau email diubah, cek dulu tidak dipakai user lain
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) throw new ConflictException('Email sudah digunakan');
    }

    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = saved;
    return userWithoutPassword;
  }

  /**
   * Ganti password — wajib verifikasi password lama dulu
   */
  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Ambil user BESERTA password (karena default select: false)
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new NotFoundException('User tidak ditemukan');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Password lama tidak sesuai');

    const hashedNew = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashedNew });

    return { message: 'Password berhasil diubah' };
  }
}
