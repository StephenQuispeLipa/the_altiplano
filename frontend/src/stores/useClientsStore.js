import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as clientsApi from '../api/clients';

export const useClientsStore = defineStore('clients', () => {
  const clients = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchClients() {
    loading.value = true;
    error.value = null;
    try {
      clients.value = await clientsApi.fetchClients();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getClientById(id) {
    return clients.value.find((c) => c.id === id);
  }

  async function addClient(clientData) {
    const created = await clientsApi.createClient({
      name: clientData.name,
      phone: clientData.phone,
      address: clientData.address,
      photo: clientData.photo,
      email: clientData.email,
      password: clientData.password || 'password123',
    });
    clients.value.push(created);
    return created;
  }

  async function updateClient(id, data) {
    try {
      const updated = await clientsApi.updateClient(id, data);
      const idx = clients.value.findIndex((c) => c.id === id);
      if (idx !== -1) clients.value[idx] = updated;
      return { success: true, message: 'Perfil actualizado correctamente.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  function incrementOrders(clientId, quantity = 1) {
    const client = clients.value.find((c) => c.id === clientId);
    if (client) client.total_orders_history += quantity;
  }

  async function fetchClient(id) {
    const client = await clientsApi.fetchClient(id);
    const idx = clients.value.findIndex((c) => c.id === id);
    if (idx !== -1) clients.value[idx] = client;
    else clients.value.push(client);
    return client;
  }

  return {
    clients,
    loading,
    error,
    fetchClients,
    fetchClient,
    getClientById,
    addClient,
    updateClient,
    incrementOrders,
  };
});
