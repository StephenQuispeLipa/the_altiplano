const TOKEN_KEY = 'altiplano_token';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' ? data : 'Error en la solicitud');
    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status);
  }

  return data;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
};
