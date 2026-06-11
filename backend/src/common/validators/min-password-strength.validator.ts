import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import {
  isPasswordStrongEnough,
  MinPasswordStrengthLevel,
} from '../utils/password-strength.util';

export function MinPasswordStrength(
  minimum: MinPasswordStrengthLevel = 'intermedia',
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'minPasswordStrength',
      target: object.constructor,
      propertyName,
      constraints: [minimum],
      options: {
        message:
          minimum === 'fuerte'
            ? 'La contraseña debe ser fuerte (8+ caracteres, mayúscula, minúscula, número y símbolo).'
            : 'La contraseña debe ser al menos intermedia (8+ caracteres con letras y números).',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const min = (args.constraints[0] as MinPasswordStrengthLevel) ?? 'intermedia';
          return isPasswordStrongEnough(value, min);
        },
      },
    });
  };
}
