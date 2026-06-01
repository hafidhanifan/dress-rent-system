// ══════════════════════════════════════
// src/wishlist/wishlist.entity.ts
// ══════════════════════════════════════

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

// ══════════════════════════════════════
// src/wishlist/wishlist.service.ts
// ══════════════════════════════════════

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepo: Repository<Wishlist>,
  ) {}

  /** Ambil semua wishlist milik user */
  async findAll(userId: number): Promise<Wishlist[]> {
    return this.wishlistRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Ambil semua dressId yang di-wishlist user — untuk cek di frontend */
  async findDressIds(userId: number): Promise<number[]> {
    const items = await this.wishlistRepo.find({
      where: { userId },
      select: ['dressId'],
    });
    return items.map((i) => i.dressId);
  }

  /** Tambah dress ke wishlist */
  async add(userId: number, dressId: number): Promise<Wishlist> {
    const existing = await this.wishlistRepo.findOne({
      where: { userId, dressId },
    });
    if (existing) throw new ConflictException('Dress sudah ada di wishlist');

    const item = this.wishlistRepo.create({ userId, dressId });
    return this.wishlistRepo.save(item);
  }

  /** Hapus dress dari wishlist */
  async remove(userId: number, dressId: number): Promise<{ message: string }> {
    const item = await this.wishlistRepo.findOne({
      where: { userId, dressId },
    });
    if (!item) throw new NotFoundException('Dress tidak ada di wishlist');
    await this.wishlistRepo.remove(item);
    return { message: 'Dihapus dari wishlist' };
  }

  /** Toggle — kalau sudah ada hapus, kalau belum ada tambah */
  async toggle(
    userId: number,
    dressId: number,
  ): Promise<{ wishlisted: boolean }> {
    const existing = await this.wishlistRepo.findOne({
      where: { userId, dressId },
    });
    if (existing) {
      await this.wishlistRepo.remove(existing);
      return { wishlisted: false };
    } else {
      await this.wishlistRepo.save(
        this.wishlistRepo.create({ userId, dressId }),
      );
      return { wishlisted: true };
    }
  }
}

// ══════════════════════════════════════
// src/wishlist/wishlist.controller.ts
// ══════════════════════════════════════

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

// ══════════════════════════════════════
// src/wishlist/wishlist.module.ts
// ══════════════════════════════════════

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './wishlist.entity';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist])],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
