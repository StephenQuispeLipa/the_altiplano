import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(7)
  phone: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateClientDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(7)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;
}

export class ClientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  photo: string;

  @ApiProperty({ name: 'total_orders_history' })
  total_orders_history: number;

  @ApiProperty()
  email: string;
}
