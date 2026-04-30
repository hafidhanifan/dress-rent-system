import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register — buat akun baru
   * Cukup panggil userService.create() yang sudah handle enkripsi dll
   */
  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    /**
     * Setelah register, langsung generate token supaya user
     * tidak perlu login lagi setelah daftar
     */
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      message: 'Registrasi berhasil!',
      user,
      ...token,
    };
  }

  /**
   * Login — cek email & password, lalu beri token
   */
  async login(email: string, password: string) {
    // 1. Cari user berdasarkan email
    const user = await this.userService.findByEmail(email);

    if (!user) {
      // Gunakan pesan generik — jangan beri tahu apakah email atau password yang salah
      throw new UnauthorizedException('Email atau password salah');
    }

    // 2. Bandingkan password input dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // 3. Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Login berhasil!',
      user: userWithoutPassword,
      ...token,
    };
  }

  /**
   * Generate JWT token
   *
   * "Payload" = data yang disimpan di dalam token
   * Siapapun yang punya token bisa kita kenali lewat payload ini
   * TANPA harus query ke database setiap request
   */
  private generateToken(id: number, email: string, role: string) {
    const payload = { sub: id, email, role };

    return {
      /**
       * access_token = token yang dikirim frontend di setiap request
       * Format: "Bearer <token>" di header Authorization
       */
      access_token: this.jwtService.sign(payload),
    };
  }
}
