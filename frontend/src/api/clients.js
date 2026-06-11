import { api } from './client';

/** @returns {Promise<import('../types/entities.js').Client[]>} */
export function fetchClients() {
  return api.get('/clients');
}

export function fetchClient(id) {
  return api.get(`/clients/${id}`);
}

export function createClient(data) {
  return api.post('/clients', data);
}

export function updateClient(id, data) {
  return api.patch(`/clients/${id}`, data);
}

/** @returns {Promise<import('../types/entities.js').Order[]>} */
export function fetchMyOrders() {
  return api.get('/clients/me/orders');
}
