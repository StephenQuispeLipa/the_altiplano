import { api } from './client';

export function fetchStaffUsers() {
  return api.get('/users/staff');
}

export function createStaffUser(data) {
  return api.post('/users/staff', data);
}

export function updateStaffUser(id, data) {
  return api.patch(`/users/staff/${id}`, data);
}

export function deleteStaffUser(id) {
  return api.delete(`/users/staff/${id}`);
}
