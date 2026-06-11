/** @param {string | undefined | null} message */
export function isCaptchaRelatedError(message) {
  return /captcha/i.test(message ?? '');
}

/** @param {string | undefined | null} message */
export function isCredentialsError(message) {
  if (!message) return false;
  return /credenciales|rol no coincide|contraseña|password/i.test(message);
}
