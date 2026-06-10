import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DressModule } from '../dress/dress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    DressModule, // butuh DressService untuk cek ketersediaan
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
