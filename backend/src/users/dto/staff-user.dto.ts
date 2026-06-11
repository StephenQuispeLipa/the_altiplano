import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { StaffRole } from '../../common/enums/staff-role.enum';
import { MinPasswordStrength } from '../../common/validators/min-password-strength.validator';

export class CreateStaffUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(7)
  phone: string;

  @ApiProperty({ enum: StaffRole })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiProperty()
  @IsString()
  @MinPasswordStrength('intermedia')
  password: string;
}

export class UpdateStaffUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(7)
  phone?: string;

  @ApiPropertyOptional({ enum: StaffRole })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinPasswordStrength('intermedia')
  password?: string;
}

export class StaffUserResponseDto {
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
