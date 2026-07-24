import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsEnum,
  Min,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDressSizeDto {
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : undefined,
  )
  @IsInt()
  id?: number;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : null,
  )
  @IsNumber()
  bust?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : null,
  )
  @IsNumber()
  waist?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : null,
  )
  @IsNumber()
  hip?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : null,
  )
  @IsNumber()
  length?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : 1,
  )
  @IsInt()
  @Min(0)
  stock?: number;
}

export class CreateDressDto {
  @IsNotEmpty({ message: 'Nama dress tidak boleh kosong' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: 'Harga sewa tidak boleh kosong' })
  @IsNumber({}, { message: 'Harga harus berupa angka' })
  @IsPositive({ message: 'Harga harus lebih dari 0' })
  pricePerDay: number;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : 1,
  )
  @IsInt()
  @Min(1)
  minRentalDays?: number;

  @IsOptional()
  @IsEnum(['available', 'unavailable', 'archived'])
  status?: 'available' | 'unavailable' | 'archived';

  @IsOptional()
  @IsEnum(['new', 'good', 'fair'])
  condition?: 'new' | 'good' | 'fair';

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  material?: string;

  /**
   * isActive dikirim sebagai string "true"/"false" dari FormData
   * @Transform mengubahnya ke boolean sebelum validasi
   * Tidak pakai @IsBoolean() karena setelah transform
   * kadang NestJS masih menganggapnya string di beberapa versi
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return true; // default aktif
  })
  isActive?: boolean;

  /**
   * Urutan tampil di Spotlight Section — opsional
   * Kosongkan / null kalau tidak mau ditampilkan di spotlight
   */
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : null,
  )
  @IsInt()
  spotlightOrder?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : null,
  )
  @IsInt()
  displayOrder?: number | null;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: 'Kategori tidak boleh kosong' })
  @IsInt({ message: 'Kategori tidak valid' })
  @Min(1, { message: 'Kategori tidak valid' })
  categoryId: number;

  /**
   * sizes dikirim sebagai JSON string dari frontend
   * karena multipart/form-data tidak support nested object
   * Di-parse manual di service: JSON.parse(dto.sizes as string)
   * Tipe union supaya tidak pakai any
   */
  @IsOptional()
  sizes?: CreateDressSizeDto[] | string;
}
