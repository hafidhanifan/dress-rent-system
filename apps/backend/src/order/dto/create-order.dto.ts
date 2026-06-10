import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsInt()
  dressId: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsInt()
  sizeId?: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string; // format: YYYY-MM-DD

  @IsNotEmpty()
  @IsDateString()
  endDate: string; // format: YYYY-MM-DD

  @IsOptional()
  @IsString()
  notes?: string;
}
