import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as analyticsApi from '../api/analytics';

export const useAnalyticsStore = defineStore('analytics', () => {
  const satisfactionScore = ref(0);
  const microChartData = ref([]);
  const reviews = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchSummary() {
    loading.value = true;
    error.value = null;
    try {
      const summary = await analyticsApi.fetchSummary();
      satisfactionScore.value = summary.satisfactionScore;
      microChartData.value = summary.microChartData;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchReviews() {
    loading.value = true;
    error.value = null;
    try {
      reviews.value = await analyticsApi.fetchReviews();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAll() {
    await Promise.all([fetchSummary(), fetchReviews()]);
  }

  return {
    satisfactionScore,
    microChartData,
    reviews,
    loading,
    error,
    fetchSummary,
    fetchReviews,
    fetchAll,
  };
});
