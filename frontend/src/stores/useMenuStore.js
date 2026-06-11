import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as menuApi from '../api/menu';
import { useDishesStore } from './useDishesStore';
import { todayISO, isToday } from '../utils/menuDate';

export const useMenuStore = defineStore('menu', () => {
  const menus = ref({});
  const loading = ref(false);
  const error = ref(null);

  async function fetchMenu(date) {
    loading.value = true;
    error.value = null;
    try {
      const entries = await menuApi.fetchMenu(date);
      menus.value[date] = entries.map((e) => ({
        id: e.id,
        dishId: e.dishId,
        price: e.price,
        stock: e.stock,
        soldToday: e.soldToday,
      }));
      return entries;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getEntriesForDate(date) {
    return menus.value[date] ?? [];
  }

  function getEnrichedMenu(date) {
    const dishesStore = useDishesStore();
    return getEntriesForDate(date)
      .map((entry) => {
        const dish = dishesStore.getById(entry.dishId);
        if (!dish) return null;
        return {
          ...entry,
          name: dish.name,
          image: dish.image,
          type: dish.type,
        };
      })
      .filter(Boolean);
  }

  function getMenuItem(date, dishId) {
    const entry = getEntriesForDate(date).find((e) => e.dishId === dishId);
    if (!entry) return null;
    const dishesStore = useDishesStore();
    const dish = dishesStore.getById(dishId);
    if (!dish) return null;
    return {
      ...entry,
      name: dish.name,
      image: dish.image,
      type: dish.type,
    };
  }

  function isDishOnMenu(date, dishId) {
    return getEntriesForDate(date).some((e) => e.dishId === dishId);
  }

  async function addEntry(date, { dishId, price, stock }) {
    if (!isToday(date)) return { ok: false, error: 'Solo se puede modificar el menú del día actual.' };
    try {
      const entry = await menuApi.addMenuEntry(date, { dishId, price, stock });
      if (!menus.value[date]) menus.value[date] = [];
      menus.value[date].push({
        id: entry.id,
        dishId: entry.dishId,
        price: entry.price,
        stock: entry.stock,
        soldToday: entry.soldToday,
      });
      return { ok: true, entry };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function updateEntry(date, entryId, { price, stock }) {
    if (!isToday(date)) return { ok: false, error: 'Solo se puede modificar el menú del día actual.' };
    try {
      const entry = await menuApi.updateMenuEntry(date, entryId, { price, stock });
      const entries = menus.value[date] ?? [];
      const idx = entries.findIndex((e) => e.id === entryId);
      if (idx !== -1) {
        entries[idx] = {
          id: entry.id,
          dishId: entry.dishId,
          price: entry.price,
          stock: entry.stock,
          soldToday: entry.soldToday,
        };
      }
      return { ok: true, entry };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function removeEntry(date, entryId) {
    if (!isToday(date)) return { ok: false, error: 'Solo se puede modificar el menú del día actual.' };
    try {
      await menuApi.removeMenuEntry(date, entryId);
      const entries = menus.value[date] ?? [];
      const idx = entries.findIndex((e) => e.id === entryId);
      if (idx !== -1) entries.splice(idx, 1);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  function decreaseStock(date, dishId, quantity = 1) {
    const entry = getEntriesForDate(date).find((e) => e.dishId === dishId);
    if (entry && entry.stock >= quantity) {
      entry.stock -= quantity;
      return true;
    }
    return false;
  }

  function recordSale(date, dishId, quantity = 1) {
    const entry = getEntriesForDate(date).find((e) => e.dishId === dishId);
    if (entry) entry.soldToday += quantity;
  }

  function getCountByType(date, type) {
    return getEnrichedMenu(date).filter((e) => e.type === type && e.stock > 0).length;
  }

  function getAvailableByType(date, type) {
    return getEnrichedMenu(date).filter((e) => e.type === type);
  }

  async function ensureTodayMenu() {
    const today = todayISO();
    if (!menus.value[today]) {
      await fetchMenu(today);
    }
  }

  return {
    menus,
    loading,
    error,
    fetchMenu,
    ensureTodayMenu,
    getEntriesForDate,
    getEnrichedMenu,
    getMenuItem,
    isDishOnMenu,
    addEntry,
    updateEntry,
    removeEntry,
    decreaseStock,
    recordSale,
    getCountByType,
    getAvailableByType,
  };
});
