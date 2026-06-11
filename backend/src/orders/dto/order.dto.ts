import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class OrderLineDto {
  @ApiProperty({ enum: ['dish', 'combo'] })
  @IsString()
  type: 'dish' | 'combo';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dishId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comboId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  selections?: Record<string, string>;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  clientId?: string | null;

  @ApiProperty()
  @IsBoolean()
  isTakeaway: boolean;

  @ApiProperty({ example: 'Mesa 4' })
  @IsString()
  location: string;

  @ApiProperty({ type: [OrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  lines: OrderLineDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdateOrderPaidDto {
  @ApiProperty()
  @IsBoolean()
  isPaid: boolean;
}

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  type: string;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  clientId: string | null;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  detalle_platos: OrderItemResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  isTakeaway: boolean;

  @ApiProperty()
  location: string;

  @ApiProperty()
  createdAt: number;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  status?: OrderStatus;

  @ApiPropertyOptional()
  clientId?: string;

  @ApiPropertyOptional()
  from?: string;

  @ApiPropertyOptional()
  to?: string;
}
