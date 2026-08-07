import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DressModule } from '../dress/dress.module';
import { DressSize } from 'src/dress/dress-size.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, DressSize]),
    DressModule, // butuh DressService untuk cek ketersediaan
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
