import { api } from './client';

/** @returns {Promise<{ captchaId: string, text: string }>} */
export function fetchCaptcha() {
  return api.get('/auth/captcha');
}

/** @returns {Promise<{ accessToken: string, user: import('../types/entities.js').AuthUser }>} */
export function login(email, password, role, captchaId, captchaAnswer) {
  return api.post('/auth/login', { email, password, role, captchaId, captchaAnswer });
}

/** @returns {Promise<{ message: string, passwordStrength: string }>} */
export function register(payload) {
  return api.post('/auth/register', payload);
}

/** @returns {Promise<import('../types/entities.js').AuthUser>} */
export function fetchMe() {
  return api.get('/auth/me');
}

export function logout() {
  return api.post('/auth/logout', {});
}
