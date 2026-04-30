import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * DTO (Data Transfer Object) — "formulir" yang memvalidasi data dari frontend
 *
 * Setiap decorator di sini adalah aturan validasi.
 * Kalau ada yang tidak sesuai, NestJS otomatis kirim error 400 ke frontend
 * tanpa kita perlu tulis if/else manual.
 */
export class CreateUserDto {
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
  @IsString()
  fullName: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  /**
   * MinLength(8) → minimal 8 karakter
   * Matches(regex) → harus ada huruf besar, kecil, dan angka
   */
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
  })
  password: string;

  @IsNotEmpty({ message: 'Nomor HP tidak boleh kosong' })
  @IsString()
  phone: string;
}
