import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  name!: string;

  @IsString()
  @MinLength(10, { message: 'Descrição deve ter no mínimo 10 caracteres' })
  description!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Preço deve ser um número' })
  @Min(0.01, { message: 'Preço deve ser maior que 0' })
  price!: number;

  @IsString()
  category!: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL da imagem inválida' })
  imageUrl?: string;
}
