import { isPasswordAcceptable } from './passwordStrength';

export const required = (msg = 'Campo obligatorio') => (v) => !!v?.toString().trim() || msg;

export const email = (v) =>
  !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Ingresa un correo electrónico válido.';

export const phoneMin7 = (v) =>
  !v || v.trim().length >= 7 || 'El teléfono debe tener al menos 7 dígitos.';

export const minLength = (min, msg) => (v) =>
  !v || v.length >= min || msg || `Mínimo ${min} caracteres.`;

export const passwordStrengthRule = (v) =>
  !v || isPasswordAcceptable(v) || 'La contraseña debe ser al menos intermedia (8+ caracteres con letras y números).';

export const confirmPasswordRule = (passwordRef) => (v) =>
  v === passwordRef.value || 'Las contraseñas no coinciden.';

export const captchaRequired = (captchaAnswerRef) => () =>
  captchaAnswerRef.value !== '' && captchaAnswerRef.value !== null && captchaAnswerRef.value !== undefined
    || 'Resuelve el CAPTCHA.';

export const roleRequired = (v) => !!v || 'Selecciona un rol.';
