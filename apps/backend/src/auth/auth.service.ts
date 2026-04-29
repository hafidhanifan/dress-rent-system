import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // 2. Hash password sebelum disimpan (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Buat user baru
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.name,
      password: hashedPassword, // simpan hash, bukan password asli
    });

    // 4. Simpan ke dalam database
    const savedUser = await this.userRepository.save(user);

    // 5. Kembalikan response tanpa password
    const { password, ...result } = savedUser;
    return {
      message: 'Registrasi berhasil',
      user: result,
    };
  }
}
