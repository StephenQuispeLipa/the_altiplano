import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as combosApi from '../api/combos';

export const useComboStore = defineStore('combos', () => {
  const combos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchCombos() {
    loading.value = true;
    error.value = null;
    try {
      combos.value = await combosApi.fetchCombos();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getComboById(comboId) {
    return combos.value.find((c) => c.id === comboId);
  }

  async function isDishReferenced(dishId) {
    const result = await combosApi.checkDishReferenced(dishId);
    return result.referenced;
  }

  async function addCombo({ name, basePrice, image, slots }) {
    const created = await combosApi.createCombo({ name, basePrice, image, slots });
    combos.value.push(created);
    return created.id;
  }

  async function updateCombo(comboId, { name, basePrice, image, slots }) {
    const updated = await combosApi.updateCombo(comboId, { name, basePrice, image, slots });
    const idx = combos.value.findIndex((c) => c.id === comboId);
    if (idx !== -1) combos.value[idx] = updated;
    return true;
  }

  async function deleteCombo(comboId) {
    await combosApi.deleteCombo(comboId);
    const idx = combos.value.findIndex((c) => c.id === comboId);
    if (idx !== -1) combos.value.splice(idx, 1);
    return true;
  }

  function updateComboPrice(comboId, newPrice) {
    const combo = combos.value.find((c) => c.id === comboId);
    if (combo) combo.basePrice = newPrice;
  }

  return {
    combos,
    loading,
    error,
    fetchCombos,
    getComboById,
    isDishReferenced,
    addCombo,
    updateCombo,
    deleteCombo,
    updateComboPrice,
  };
});
