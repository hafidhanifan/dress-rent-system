// src/order/dto/update-status.dto.ts

import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsIn(['pending', 'paid', 'confirmed', 'active', 'returned', 'cancelled'])
  status:
    | 'pending'
    | 'paid'
    | 'confirmed'
    | 'active'
    | 'returned'
    | 'cancelled';
}
