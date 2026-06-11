import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(7)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;
}

export class StaffResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  photo: string;

  @ApiProperty()
  role: string;
}
