import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as usersApi from '../api/users';

export const useUsersStore = defineStore('users', () => {
  const staffUsers = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchStaffUsers() {
    loading.value = true;
    error.value = null;
    try {
      staffUsers.value = await usersApi.fetchStaffUsers();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createStaffUser(data) {
    const created = await usersApi.createStaffUser(data);
    staffUsers.value.push(created);
    return created;
  }

  async function updateStaffUser(id, data) {
    const updated = await usersApi.updateStaffUser(id, data);
    const idx = staffUsers.value.findIndex((u) => u.id === id);
    if (idx !== -1) staffUsers.value[idx] = updated;
    return updated;
  }

  async function deleteStaffUser(id) {
    await usersApi.deleteStaffUser(id);
    const idx = staffUsers.value.findIndex((u) => u.id === id);
    if (idx !== -1) staffUsers.value.splice(idx, 1);
  }

  return {
    staffUsers,
    loading,
    error,
    fetchStaffUsers,
    createStaffUser,
    updateStaffUser,
    deleteStaffUser,
  };
});
