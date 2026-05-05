import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  @IsString()
  @MaxLength(100, { message: 'Nama kategori maksimal 100 karakter' })
  name: string;

  /**
   * Slug opsional — kalau tidak diisi, otomatis dibuat dari nama
   * Contoh: "Evening Gown" → "evening-gown"
   */
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Deskripsi maksimal 500 karakter' })
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
