import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  /** POST /orders — buat pesanan baru */
  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orderService.create(req.user.sub, dto);
  }

  /**
   * GET /orders/pending-check/:dressId
   * Cek apakah user (yang login) punya order pending untuk dress ini
   */
  @Get('pending-check/:dressId')
  findPendingForDress(
    @Req() req: any,
    @Param('dressId', ParseIntPipe) dressId: number,
  ) {
    return this.orderService.findPendingOrderForDress(req.user.sub, dressId);
  }

  /**
   * GET /orders/admin/all — semua pesanan dari semua user, khusus admin
   * @UseGuards(AdminGuard) berjalan SETELAH JwtAuthGuard di atas
   * PENTING: harus di atas @Get(':id') supaya tidak konflik routing
   */
  @Get('admin/all')
  @UseGuards(AdminGuard)
  findAllAdmin() {
    return this.orderService.findAll();
  }

  /**
   * GET /orders/admin/:id — detail pesanan tanpa cek kepemilikan, khusus admin
   */
  @Get('admin/:id')
  @UseGuards(AdminGuard)
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOneById(id);
  }

  /** PATCH /orders/admin/:id/status — update status pesanan, khusus admin */
  @Patch('admin/:id/status')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.status);
  }

  /** GET /orders — semua pesanan user yang login */
  @Get()
  findAll(@Req() req: any) {
    return this.orderService.findByUser(req.user.sub);
  }

  /** GET /orders/:id — detail pesanan milik user yang login */
  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id, req.user.sub);
  }

  /** PATCH /orders/:id/cancel — batalkan pesanan */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.cancel(id, req.user.sub);
  }
}
