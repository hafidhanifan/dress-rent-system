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

  /**
   * Cek apakah size tertentu masih tersedia di rentang tanggal yang diminta
   * Logic overlap tanggal: dua rentang tanggal bentrok kalau
   * startA < endB DAN endA > startB
   */
  private async checkAvailability(
    dressId: number,
    sizeId: number | null,
    startDate: string,
    endDate: string,
    totalStock: number,
  ): Promise<boolean> {
    const overlappingOrders = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.dressId = :dressId', { dressId })
      .andWhere(sizeId ? 'order.sizeId = :sizeId' : 'order.sizeId IS NULL', {
        sizeId,
      })
      .andWhere('order.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('order.startDate < :endDate', { endDate })
      .andWhere('order.endDate > :startDate', { startDate })
      .getCount();

    return overlappingOrders < totalStock;
  }

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

    // Cari data stock untuk size yang dipilih
    let stockForSize = 1; // default kalau dress tidak punya size sama sekali
    if (dto.sizeId) {
      const selectedSize = dress.sizes?.find((s) => s.id === dto.sizeId);
      if (!selectedSize) {
        throw new BadRequestException('Ukuran tidak ditemukan');
      }
      stockForSize = selectedSize.stock;
    }

    // Cek ketersediaan berdasarkan tanggal + stock
    const isAvailable = await this.checkAvailability(
      dto.dressId,
      dto.sizeId ?? null,
      dto.startDate,
      dto.endDate,
      stockForSize,
    );

    if (!isAvailable) {
      throw new BadRequestException(
        'Maaf, dress dengan ukuran ini sudah tidak tersedia di rentang tanggal yang dipilih',
      );
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

  /**
   * Update status pesanan — khusus admin
   * Tidak ada pengecekan userId karena admin bisa update pesanan siapa saja
   */
  async updateStatus(id: number, status: Order['status']): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    order.status = status;

    // Kalau admin set status jadi "returned", otomatis catat waktu sekarang
    if (status === 'returned' && !order.returnedAt) {
      order.returnedAt = new Date();
    }

    return this.orderRepo.save(order);
  }

  /**
   * Ambil semua pesanan — khusus admin (tidak difilter userId)
   */
  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Ambil satu pesanan berdasarkan ID saja — khusus admin
   */
  async findOneById(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    return order;
  }
}
