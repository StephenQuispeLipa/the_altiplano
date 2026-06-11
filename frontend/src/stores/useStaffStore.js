import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as staffApi from '../api/staff';

export const useStaffStore = defineStore('staff', () => {
  const staffCache = ref({});
  const loading = ref(false);
  const error = ref(null);

  async function fetchStaff(id) {
    loading.value = true;
    error.value = null;
    try {
      const member = await staffApi.fetchStaff(id);
      staffCache.value[id] = member;
      return member;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getStaffById(id) {
    return staffCache.value[id] ?? null;
  }

  async function updateStaff(id, data) {
    try {
      const updated = await staffApi.updateStaff(id, data);
      staffCache.value[id] = updated;
      return { success: true, message: 'Perfil actualizado correctamente.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  return {
    staffCache,
    loading,
    error,
    fetchStaff,
    getStaffById,
    updateStaff,
  };
});
