import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { DressService } from '../dress/dress.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private dressService: DressService,
  ) {}

  /** Buat pesanan baru */
  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    // Cek dress ada dan available
    const dress = await this.dressService.findOne(dto.dressId);
    if (dress.status !== 'available') {
      throw new BadRequestException('Dress tidak tersedia untuk disewa');
    }

    // Hitung total hari
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) {
      throw new BadRequestException(
        'Tanggal selesai harus setelah tanggal mulai',
      );
    }

    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (totalDays < dress.minRentalDays) {
      throw new BadRequestException(`Minimal sewa ${dress.minRentalDays} hari`);
    }

    const totalPrice = Number(dress.pricePerDay) * totalDays;

    const order = this.orderRepo.create({
      userId,
      dressId: dto.dressId,
      sizeId: dto.sizeId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalDays,
      totalPrice,
      notes: dto.notes,
      status: 'pending',
    });

    return this.orderRepo.save(order);
  }

  /** Ambil semua pesanan milik user */
  async findByUser(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Ambil detail satu pesanan */
  async findOne(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    return order;
  }

  /** Batalkan pesanan */
  async cancel(id: number, userId: number): Promise<Order> {
    const order = await this.findOne(id, userId);
    if (!['pending'].includes(order.status)) {
      throw new BadRequestException('Pesanan tidak dapat dibatalkan');
    }
    order.status = 'cancelled';
    return this.orderRepo.save(order);
  }
}
