import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Semua endpoint di sini butuh login (JwtAuthGuard)
 * @Req() req → ambil user dari JWT payload
 */
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  /** GET /wishlist → semua wishlist user yang login */
  @Get()
  findAll(@Req() req: any) {
    return this.wishlistService.findAll(req.user.sub);
  }

  /** GET /wishlist/ids → array dressId saja, untuk cek icon love */
  @Get('ids')
  findIds(@Req() req: any) {
    return this.wishlistService.findDressIds(req.user.sub);
  }

  /** POST /wishlist/:dressId → toggle wishlist */
  @Post(':dressId')
  toggle(@Req() req: any, @Param('dressId', ParseIntPipe) dressId: number) {
    return this.wishlistService.toggle(req.user.sub, dressId);
  }

  /** DELETE /wishlist/:dressId → hapus dari wishlist */
  @Delete(':dressId')
  remove(@Req() req: any, @Param('dressId', ParseIntPipe) dressId: number) {
    return this.wishlistService.remove(req.user.sub, dressId);
  }
}
