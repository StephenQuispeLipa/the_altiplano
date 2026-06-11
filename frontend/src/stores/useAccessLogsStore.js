import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as accessLogsApi from '../api/accessLogs';

export const useAccessLogsStore = defineStore('accessLogs', () => {
  const logs = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref(null);

  async function fetchLogs(filters = {}) {
    loading.value = true;
    error.value = null;
    try {
      const result = await accessLogsApi.fetchAccessLogs(filters);
      logs.value = result.items;
      total.value = result.total;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    logs,
    total,
    loading,
    error,
    fetchLogs,
  };
});
