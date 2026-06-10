import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';
import * as Midtrans from 'midtrans-client';

@Injectable()
export class PaymentService {
  private snap: Midtrans.Snap;
  private core: Midtrans.CoreApi;

  constructor(
    private config: ConfigService,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {
    const serverKey = this.config.getOrThrow<string>('MIDTRANS_SERVER_KEY');
    const clientKey = this.config.getOrThrow<string>('MIDTRANS_CLIENT_KEY');
    const isProduction = this.config.get('MIDTRANS_IS_PRODUCTION') === 'true';

    /**
     * Snap = tampilan popup pembayaran dari Midtrans
     * User akan melihat halaman ini saat memilih metode pembayaran
     */
    this.snap = new Midtrans.Snap({
      isProduction,
      serverKey,
      clientKey,
    });

    /**
     * CoreApi = untuk cek status transaksi secara manual
     */
    this.core = new Midtrans.CoreApi({
      isProduction,
      serverKey,
      clientKey,
    });
  }

  /**
   * Minta Snap Token ke Midtrans
   * Token ini dipakai frontend untuk tampilkan popup pembayaran
   */
  async createSnapToken(
    orderId: number,
    userId: number,
  ): Promise<{
    snapToken: string;
    redirectUrl: string;
  }> {
    // Ambil data order beserta relasi dress dan user
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
      relations: ['dress', 'user', 'size'],
    });

    if (!order) throw new BadRequestException('Pesanan tidak ditemukan');
    if (order.status !== 'pending') {
      throw new BadRequestException('Pesanan sudah diproses');
    }

    // Buat parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        // ID transaksi harus unik — pakai ORDER-{id}-{timestamp}
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: Number(order.totalPrice),
      },
      item_details: [
        {
          id: String(order.dressId),
          price: Number(order.dress.pricePerDay),
          quantity: order.totalDays,
          name: order.dress.name,
          category: 'Dress Rental',
        },
      ],
      customer_details: {
        first_name: order.user?.fullName ?? 'Customer',
        email: order.user?.email ?? '',
      },
      // Midtrans akan redirect ke sini setelah bayar
      callbacks: {
        finish: `${this.config.get('FRONTEND_URL') ?? 'http://localhost:3000'}/orders/${order.id}?payment=finish`,
        error: `${this.config.get('FRONTEND_URL') ?? 'http://localhost:3000'}/orders/${order.id}?payment=error`,
        pending: `${this.config.get('FRONTEND_URL') ?? 'http://localhost:3000'}/orders/${order.id}?payment=pending`,
      },
    };

    // Minta token ke Midtrans
    const transaction = await this.snap.createTransaction(parameter);

    // Simpan snap token ke database
    await this.orderRepo.update(order.id, {
      snapToken: transaction.token,
      transactionId: `ORDER-${order.id}-${Date.now()}`,
    });

    return {
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  }

  /**
   * Handle webhook dari Midtrans
   * Midtrans akan POST ke endpoint ini setiap ada perubahan status pembayaran
   */
  async handleWebhook(notification: Record<string, string>): Promise<void> {
    // Verifikasi notifikasi dari Midtrans (pastikan bukan palsu)
    const statusResponse = await (this.core as any).transaction.notification(
      notification,
    );

    const orderId = this.extractOrderId(statusResponse.order_id);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    /**
     * Mapping status Midtrans ke status order kita:
     *
     * capture + accept = bayar dengan kartu kredit, berhasil
     * settlement       = bayar dengan transfer/e-wallet, berhasil
     * pending          = menunggu pembayaran
     * deny             = ditolak
     * cancel/expire    = dibatalkan/kadaluarsa
     */
    let newStatus: Order['status'] | null = null;

    if (transactionStatus === 'capture') {
      newStatus = fraudStatus === 'accept' ? 'paid' : 'cancelled';
    } else if (transactionStatus === 'settlement') {
      newStatus = 'paid';
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending';
    } else if (['cancel', 'expire', 'deny'].includes(transactionStatus)) {
      newStatus = 'cancelled';
    }

    if (newStatus && orderId) {
      await this.orderRepo.update(orderId, { status: newStatus });
    }
  }

  /** Ambil orderId dari string "ORDER-{id}-{timestamp}" */
  private extractOrderId(orderIdStr: string): number | null {
    const parts = orderIdStr.split('-');
    if (parts.length >= 2) {
      const id = parseInt(parts[1]);
      return isNaN(id) ? null : id;
    }
    return null;
  }
}
