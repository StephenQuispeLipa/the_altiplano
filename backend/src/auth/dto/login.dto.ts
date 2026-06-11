import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AppRole } from '../../common/enums/app-role.enum';
import { MinPasswordStrength } from '../../common/validators/min-password-strength.validator';

@ValidatorConstraint({ name: 'MatchPassword', async: false })
export class MatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const obj = args.object as { password?: string };
    return confirmPassword === obj.password;
  }

  defaultMessage() {
    return 'Las contraseñas no coinciden.';
  }
}

export class CaptchaFieldsDto {
  @ApiProperty()
  @IsString()
  captchaId: string;

  @ApiProperty()
  @IsString()
  captchaAnswer: string;
}

export class LoginDto extends CaptchaFieldsDto {
  @ApiProperty({ example: 'admin@altiplanofamiliar.com' })
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido.' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @ApiProperty({ enum: AppRole, example: AppRole.Admin })
  @IsEnum(AppRole)
  role: AppRole;
}

export class RegisterDto extends CaptchaFieldsDto {
  @ApiProperty()
  @IsString()
  @MinLength(2, { message: 'El nombre es obligatorio.' })
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 dígitos.' })
  phone: string;

  @ApiProperty()
  @IsString()
  @MinLength(5, { message: 'La dirección es obligatoria.' })
  address: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido.' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinPasswordStrength('intermedia')
  password: string;

  @ApiProperty()
  @IsString()
  @Validate(MatchPasswordConstraint)
  confirmPassword: string;
}

export class CaptchaResponseDto {
  @ApiProperty()
  captchaId: string;

  @ApiProperty({ description: 'Texto a reconocer e ingresar' })
  text: string;
}

export class RegisterResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  passwordStrength: string;
}

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty({ enum: AppRole })
  role: AppRole;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
