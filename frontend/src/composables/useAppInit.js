import { ref } from 'vue';
import { useAuthStore } from '../stores/useAuthStore';
import { useDishesStore } from '../stores/useDishesStore';
import { useMenuStore } from '../stores/useMenuStore';
import { useComboStore } from '../stores/useComboStore';
import { useOrdersStore } from '../stores/useOrdersStore';
import { useClientsStore } from '../stores/useClientsStore';
import { useStaffStore } from '../stores/useStaffStore';
import { useAnalyticsStore } from '../stores/useAnalyticsStore';
import { useCartStore } from '../stores/useCartStore';

const appDataInitialized = ref(false);

export function isAppDataInitialized() {
  return appDataInitialized.value;
}

export function setAppDataInitialized(value) {
  appDataInitialized.value = value;
}

export function resetAppDataInitialized() {
  appDataInitialized.value = false;
}

export function resetAppData() {
  useDishesStore().dishes = [];
  useComboStore().combos = [];
  useOrdersStore().orders = [];
  useClientsStore().clients = [];
  useMenuStore().menus = {};
  useAnalyticsStore().reviews = [];
  useAnalyticsStore().microChartData = [];
  useAnalyticsStore().satisfactionScore = 0;
  useStaffStore().staffCache = {};
  useCartStore().clearCart();
}

export async function initAppData() {
  const authStore = useAuthStore();
  const role = authStore.currentRole;

  const dishesStore = useDishesStore();
  const menuStore = useMenuStore();
  const comboStore = useComboStore();
  const ordersStore = useOrdersStore();

  const tasks = [
    dishesStore.fetchDishes(),
    menuStore.ensureTodayMenu(),
    comboStore.fetchCombos(),
  ];

  if (role === 'Cliente') {
    tasks.push(ordersStore.fetchMyOrders());
  } else {
    tasks.push(ordersStore.fetchOrders());
  }

  if (role === 'Admin' || role === 'Camarero') {
    tasks.push(useClientsStore().fetchClients());
  }

  if (role === 'Cliente' && authStore.currentClientId) {
    tasks.push(useClientsStore().fetchClient(authStore.currentClientId));
  }

  if (role === 'Admin') {
    tasks.push(useAnalyticsStore().fetchAll());
  }

  if (role === 'Admin' || role === 'Camarero') {
    const staffId = authStore.currentStaffId;
    if (staffId) {
      tasks.push(useStaffStore().fetchStaff(staffId));
    }
  }

  await Promise.all(tasks);
}
