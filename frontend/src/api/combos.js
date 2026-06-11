import { api } from './client';

/** @returns {Promise<import('../types/entities.js').Combo[]>} */
export function fetchCombos() {
  return api.get('/combos');
}

export function fetchCombo(id) {
  return api.get(`/combos/${id}`);
}

export function createCombo(data) {
  return api.post('/combos', data);
}

export function updateCombo(id, data) {
  return api.patch(`/combos/${id}`, data);
}

export function deleteCombo(id) {
  return api.delete(`/combos/${id}`);
}

export function checkDishReferenced(dishId) {
  return api.get(`/combos/dish-references/${dishId}`);
}
