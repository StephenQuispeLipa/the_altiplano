import { api } from './client';

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

/** @returns {Promise<import('../types/entities.js').Order[]>} */
export function fetchOrders(filters = {}) {
  return api.get(`/orders${buildQuery(filters)}`);
}

export function fetchOrder(id) {
  return api.get(`/orders/${id}`);
}

export function createOrder(data) {
  return api.post('/orders', data);
}

export function updateOrderStatus(id, status) {
  return api.patch(`/orders/${id}/status`, { status });
}

export function updateOrderPaid(id, isPaid) {
  return api.patch(`/orders/${id}/paid`, { isPaid });
}

export function deleteOrder(id) {
  return api.delete(`/orders/${id}`);
}

export function cancelOrder(id) {
  return api.patch(`/orders/${id}/cancel`, {});
}
