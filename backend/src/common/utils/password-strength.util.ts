import {
  PasswordStrength,
  MinPasswordStrengthLevel,
} from '../enums/password-strength.enum';

export type { MinPasswordStrengthLevel };

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 8) {
    return PasswordStrength.Debil;
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasLetter = /[A-Za-z]/.test(password);

  if (hasLower && hasUpper && hasNumber && hasSymbol) {
    return PasswordStrength.Fuerte;
  }

  if (hasLetter && hasNumber) {
    return PasswordStrength.Intermedia;
  }

  return PasswordStrength.Debil;
}

export function isPasswordStrongEnough(
  password: string,
  minimum: MinPasswordStrengthLevel = 'intermedia',
): boolean {
  const strength = evaluatePasswordStrength(password);
  if (minimum === 'fuerte') {
    return strength === PasswordStrength.Fuerte;
  }
  return (
    strength === PasswordStrength.Intermedia ||
    strength === PasswordStrength.Fuerte
  );
}
