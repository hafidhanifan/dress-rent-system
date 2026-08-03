import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
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

  @IsNotEmpty({ message: 'Nomor WhatsApp wajib diisi' })
  @Matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, {
    message: 'Format nomor WhatsApp tidak valid',
  })
  contactPhone: string;
}
