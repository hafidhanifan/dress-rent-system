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
