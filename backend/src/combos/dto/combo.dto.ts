import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComboSlotDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  allowedDishIds: string[];
}

export class CreateComboDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  basePrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ type: [ComboSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboSlotDto)
  slots: ComboSlotDto[];
}

export class UpdateComboDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ type: [ComboSlotDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboSlotDto)
  slots?: ComboSlotDto[];
}

export class ComboSlotResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ type: [String] })
  allowedDishIds: string[];
}

export class ComboResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  image: string;

  @ApiProperty({ type: [ComboSlotResponseDto] })
  slots: ComboSlotResponseDto[];
}

export class DishReferenceResponseDto {
  @ApiProperty()
  referenced: boolean;
}
