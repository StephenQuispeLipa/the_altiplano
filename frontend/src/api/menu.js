import { api } from './client';

/** @returns {Promise<import('../types/entities.js').MenuEntry[]>} */
export function fetchMenu(date) {
  return api.get(`/menu?date=${encodeURIComponent(date)}`);
}

export function addMenuEntry(date, data) {
  return api.post(`/menu/${date}/entries`, data);
}

export function updateMenuEntry(date, entryId, data) {
  return api.patch(`/menu/${date}/entries/${entryId}`, data);
}

export function removeMenuEntry(date, entryId) {
  return api.delete(`/menu/${date}/entries/${entryId}`);
}
