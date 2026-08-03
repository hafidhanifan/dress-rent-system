import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  /**
   * POST /payment/snap-token/:orderId
   * User minta token untuk tampilkan popup Midtrans
   * Butuh login (JwtAuthGuard)
   */
  @Post('snap-token/:orderId')
  @UseGuards(JwtAuthGuard)
  async getSnapToken(
    @Req() req: any,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.paymentService.createSnapToken(orderId, req.user.sub);
  }

  /**
   * POST /payment/webhook
   * Endpoint ini dipanggil otomatis oleh Midtrans
   * TIDAK butuh login — Midtrans yang memanggil
   *
   * PENTING: URL ini harus bisa diakses dari internet
   * Saat development pakai ngrok untuk expose localhost
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() notification: Record<string, string>) {
    try {
      await this.paymentService.handleWebhook(notification);
    } catch (err) {
      // Tetap balas 200 OK ke Midtrans meski ada error internal —
      // supaya test ping / retry Midtrans tidak dianggap gagal total.
      // Error tetap dicatat di log server untuk didebug.
      console.error('Webhook error:', err);
    }
    return { status: 'ok' };
  }
}
