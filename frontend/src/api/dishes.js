import { api } from './client';

/** @returns {Promise<import('../types/entities.js').Dish[]>} */
export function fetchDishes() {
  return api.get('/dishes');
}

export function fetchDish(id) {
  return api.get(`/dishes/${id}`);
}

export function createDish(data) {
  return api.post('/dishes', data);
}

export function updateDish(id, data) {
  return api.patch(`/dishes/${id}`, data);
}

export function deleteDish(id) {
  return api.delete(`/dishes/${id}`);
}

export function checkDishReferenced(dishId) {
  return api.get(`/combos/dish-references/${dishId}`);
}
