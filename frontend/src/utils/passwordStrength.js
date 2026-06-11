export function evaluatePasswordStrength(password) {
  if (!password || password.length < 8) return 'débil';

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasLetter = /[A-Za-z]/.test(password);

  if (hasLower && hasUpper && hasNumber && hasSymbol) return 'fuerte';
  if (hasLetter && hasNumber) return 'intermedia';
  return 'débil';
}

export function strengthColor(strength) {
  if (strength === 'fuerte') return 'success';
  if (strength === 'intermedia') return 'warning';
  return 'error';
}

export function strengthProgress(strength) {
  if (strength === 'fuerte') return 100;
  if (strength === 'intermedia') return 66;
  return 33;
}

export function strengthLabel(strength) {
  if (strength === 'fuerte') return 'Fuerte';
  if (strength === 'intermedia') return 'Intermedia';
  return 'Débil';
}

export function isPasswordAcceptable(password) {
  const strength = evaluatePasswordStrength(password);
  return strength === 'intermedia' || strength === 'fuerte';
}
