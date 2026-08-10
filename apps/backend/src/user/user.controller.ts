import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  /** GET /user/me — ambil profil user yang login */
  @Get('me')
  async getMe(@Req() req: any) {
    return this.userService.findById(req.user.sub);
  }

  /** PATCH /user/me — update profil (nama, email, nomor HP) */
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.sub, dto);
  }

  /** PATCH /user/me/password — ganti password */
  @Patch('me/password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.sub, dto);
  }

  /**
   * GET /user/admin/all — semua customer + ringkasan order, khusus admin
   * PENTING: harus di atas @Get('admin/:id') supaya tidak konflik routing
   */
  @Get('admin/all')
  @UseGuards(AdminGuard)
  async findAllCustomers() {
    return this.userService.findAllCustomers();
  }

  /** GET /user/admin/:id — detail 1 customer + semua order, khusus admin */
  @Get('admin/:id')
  @UseGuards(AdminGuard)
  async findCustomerDetail(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findCustomerDetail(id);
  }
}
