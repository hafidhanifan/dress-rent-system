import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

/**
 * Controller = "pintu masuk" API
 * @Controller('auth') → semua endpoint di sini diawali /auth
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   * @Body() dto → NestJS otomatis ambil body request dan validasi
   * pakai rules di CreateUserDto
   */
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * HttpCode(200) → default POST adalah 201, kita ubah ke 200 untuk login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
