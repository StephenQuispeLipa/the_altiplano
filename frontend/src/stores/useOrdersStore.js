import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as ordersApi from '../api/orders';
import * as clientsApi from '../api/clients';
import { useAuthStore } from './useAuthStore';
import { useCartStore } from './useCartStore';
import { useMenuStore } from './useMenuStore';
import { todayISO } from '../utils/menuDate';

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchOrders(filters = {}) {
    loading.value = true;
    error.value = null;
    try {
      orders.value = await ordersApi.fetchOrders(filters);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMyOrders() {
    loading.value = true;
    error.value = null;
    try {
      orders.value = await clientsApi.fetchMyOrders();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getOrders() {
    return orders.value;
  }

  async function addOrder(orderData) {
    const created = await ordersApi.createOrder(orderData);
    orders.value.unshift(created);
    return created;
  }

  async function createFromCart({ clientId, isTakeaway, location, lines }) {
    const cartStore = useCartStore();
    const menuStore = useMenuStore();
    const payload = {
      clientId: clientId ?? null,
      isTakeaway,
      location,
      lines: lines ?? cartStore.lines.map((line) => ({
        type: line.type,
        dishId: line.dishId,
        comboId: line.comboId,
        selections: line.selections,
        quantity: line.quantity,
      })),
    };

    const created = await addOrder(payload);
    cartStore.clearCart();

    const today = todayISO();
    await menuStore.fetchMenu(today).catch(() => {});

    return created;
  }

  async function updateOrderStatus(orderId, newStatus) {
    const updated = await ordersApi.updateOrderStatus(orderId, newStatus);
    const idx = orders.value.findIndex((o) => o.id === orderId);
    if (idx !== -1) orders.value[idx] = updated;
  }

  async function updateOrderPaid(orderId, isPaid) {
    const updated = await ordersApi.updateOrderPaid(orderId, isPaid);
    const idx = orders.value.findIndex((o) => o.id === orderId);
    if (idx !== -1) orders.value[idx] = updated;
  }

  async function deleteOrder(orderId) {
    const auth = useAuthStore();
    if (auth.currentRole !== 'Admin') {
      throw new Error('Solo el administrador puede eliminar pedidos.');
    }
    await ordersApi.deleteOrder(orderId);
    const idx = orders.value.findIndex((o) => o.id === orderId);
    if (idx !== -1) orders.value.splice(idx, 1);
  }

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchMyOrders,
    getOrders,
    addOrder,
    createFromCart,
    updateOrderStatus,
    updateOrderPaid,
    deleteOrder,
  };
});
