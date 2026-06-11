import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DishType } from '../../common/enums/dish-type.enum';

export class CreateDishDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: DishType })
  @IsEnum(DishType)
  type: DishType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateDishDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: DishType })
  @IsOptional()
  @IsEnum(DishType)
  type?: DishType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;
}

export class DishResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: DishType })
  type: DishType;

  @ApiProperty({ name: 'total_orders_history' })
  total_orders_history: number;

  @ApiProperty()
  image: string;
}
