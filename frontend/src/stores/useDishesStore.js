import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as dishesApi from '../api/dishes';

export const useDishesStore = defineStore('dishes', () => {
  const dishes = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchDishes() {
    loading.value = true;
    error.value = null;
    try {
      dishes.value = await dishesApi.fetchDishes();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getByType(type) {
    return dishes.value.filter((d) => d.type === type);
  }

  function getById(dishId) {
    return dishes.value.find((d) => d.id === dishId);
  }

  async function addDish({ name, type, image }) {
    const created = await dishesApi.createDish({ name, type, image });
    dishes.value.push(created);
    return created.id;
  }

  async function updateDish(dishId, { name, type, image }) {
    const updated = await dishesApi.updateDish(dishId, { name, type, image });
    const idx = dishes.value.findIndex((d) => d.id === dishId);
    if (idx !== -1) dishes.value[idx] = updated;
    return true;
  }

  async function deleteDish(dishId) {
    await dishesApi.deleteDish(dishId);
    const idx = dishes.value.findIndex((d) => d.id === dishId);
    if (idx !== -1) dishes.value.splice(idx, 1);
    return true;
  }

  async function incrementSalesHistory(dishId, quantity = 1) {
    const dish = dishes.value.find((d) => d.id === dishId);
    if (dish) dish.total_orders_history += quantity;
  }

  return {
    dishes,
    loading,
    error,
    fetchDishes,
    getByType,
    getById,
    addDish,
    updateDish,
    deleteDish,
    incrementSalesHistory,
  };
});
