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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  /** POST /orders — buat pesanan baru */
  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orderService.create(req.user.sub, dto);
  }

  /** GET /orders — semua pesanan user */
  @Get()
  findAll(@Req() req: any) {
    return this.orderService.findByUser(req.user.sub);
  }

  /** GET /orders/:id — detail pesanan */
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
