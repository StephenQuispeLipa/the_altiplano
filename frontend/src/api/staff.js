import { api } from './client';

/** @returns {Promise<import('../types/entities.js').Staff>} */
export function fetchStaff(id) {
  return api.get(`/staff/${id}`);
}

export function updateStaff(id, data) {
  return api.patch(`/staff/${id}`, data);
}
