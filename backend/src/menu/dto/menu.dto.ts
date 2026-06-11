import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMenuEntryDto {
  @ApiProperty()
  @IsString()
  dishId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stock: number;
}

export class UpdateMenuEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class MenuEntryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dishId: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  soldToday: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  type: string;
}
