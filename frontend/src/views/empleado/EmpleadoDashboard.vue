<template>
  <v-container fluid class="pa-0 animate-fade-in">
    <div class="mb-10 d-flex align-center justify-space-between flex-wrap gap-4">
      <div>
        <h1 class="font-headline text-h3 font-weight-bold text-primary mb-2">Pedidos en Tiempo Real</h1>
        <p class="text-on-surface-variant font-body text-body-1 opacity-80">Gestiona las órdenes activas y su estado de
          cobro.</p>
      </div>
      <v-chip color="primary-container" class="font-weight-bold px-4 py-6 rounded-lg shadow-sm">
        <v-icon start icon="mdi-refresh" class="mr-2"></v-icon>
        Sincronizado
      </v-chip>
    </div>

    <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-4 pa-md-6 mb-8">
      <v-row align="center">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por nombre o código de pedido"
            placeholder="Ej. Carlos, o3294..."
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="6">
          <div class="text-caption font-weight-bold text-on-surface-variant uppercase tracking-widest mb-2">Tipo</div>
          <div class="d-flex flex-wrap order-filters">
            <v-chip
              v-for="filter in typeFilters"
              :key="filter.value"
              :variant="activeTypeFilter === filter.value ? 'flat' : 'tonal'"
              :color="activeTypeFilter === filter.value ? 'primary' : 'on-surface-variant'"
              class="font-weight-bold flex-shrink-0"
              :prepend-icon="filter.icon"
              @click="activeTypeFilter = filter.value"
            >
              {{ filter.label }}
              <span class="filter-count">{{ getTypeCount(filter.value) }}</span>
            </v-chip>
          </div>
        </v-col>
        <v-col cols="12">
          <div class="text-caption font-weight-bold text-on-surface-variant uppercase tracking-widest mb-2">Estado</div>
          <div class="d-flex flex-wrap order-filters order-filters--scroll">
            <v-chip
              :variant="activeStatusFilter === 'all' ? 'flat' : 'tonal'"
              :color="activeStatusFilter === 'all' ? 'primary' : 'on-surface-variant'"
              class="font-weight-bold flex-shrink-0"
              prepend-icon="mdi-filter-variant"
              @click="activeStatusFilter = 'all'"
            >
              Todos
              <span class="filter-count">{{ getStatusCount('all') }}</span>
            </v-chip>
            <v-chip
              v-for="status in statusFilters"
              :key="status.value"
              :variant="activeStatusFilter === status.value ? 'flat' : 'tonal'"
              :color="activeStatusFilter === status.value ? 'primary' : 'on-surface-variant'"
              class="font-weight-bold flex-shrink-0"
              :prepend-icon="status.icon"
              @click="activeStatusFilter = status.value"
            >
              {{ status.value }}
              <span class="filter-count">{{ getStatusCount(status.value) }}</span>
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Action Feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top" class="custom-snackbar">
      <div class="d-flex align-center gap-3">
        <v-icon>{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
        <span class="font-weight-bold">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>

    <div v-if="filteredOrders.length > 0">
      <v-row>
        <v-col cols="12" sm="6" lg="4" v-for="order in filteredOrders" :key="order.id">
          <OrderCard :order="order" @error="showError" @deleted="showSuccess('Pedido eliminado')">
            <template #actions="{ order }">
              <div class="d-flex align-center gap-2 flex-grow-1">
                <v-menu v-if="order.status !== 'Entregado' && order.status !== 'Cancelado'">
                  <template v-slot:activator="{ props }">
                    <v-btn variant="tonal" color="primary" v-bind="props"
                      class="flex-grow-1 rounded-lg font-weight-bold" append-icon="mdi-chevron-down">
                      Estado
                    </v-btn>
                  </template>
                  <v-list class="surface-container-low border-none">
                    <v-list-item v-for="status in availableStatuses" :key="status"
                      @click="confirmStatusChange(order, status)"
                      :class="{ 'bg-surface-container-high': order.status === status }">
                      <template v-slot:prepend>
                        <v-icon size="18" :color="getStatusColor(status)" class="mr-2">
                          {{ getStatusIcon(status) }}
                        </v-icon>
                      </template>
                      <v-list-item-title class="font-weight-medium">{{ status }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <v-btn v-if="!order.isPaid" color="secondary" variant="flat"
                  class="flex-grow-1 rounded-lg font-weight-bold shadow-sm" @click="confirmPayment(order)"
                  prepend-icon="mdi-cash">
                  Cobrar
                </v-btn>
              </div>
            </template>
          </OrderCard>
        </v-col>
      </v-row>
    </div>

    <v-card v-else variant="flat" color="surface-container-low" class="rounded-xl pa-16 text-center mt-10">
      <v-avatar color="surface-container-highest" size="80" class="mb-6">
        <v-icon size="40" color="on-surface-variant">
          {{ hasActiveFilters ? 'mdi-filter-off-outline' : 'mdi-food-off-outline' }}
        </v-icon>
      </v-avatar>
      <h3 class="font-headline text-h5 font-weight-bold text-on-surface">
        {{ hasActiveFilters ? 'No se encontraron pedidos' : 'No hay pedidos activos' }}
      </h3>
      <p class="text-on-surface-variant mt-2">
        {{ hasActiveFilters
          ? 'Prueba con otro nombre, código, tipo o estado de pedido.'
          : 'Los nuevos pedidos aparecerán aquí automáticamente.' }}
      </p>
    </v-card>

    <!-- Status Change Dialog -->
    <v-dialog v-model="statusDialog.show" max-width="440" persistent>
      <v-card class="rounded-xl overflow-hidden glass-panel">
        <div class="bg-primary pa-6 text-center text-white">
          <v-icon size="48" class="mb-2">mdi-update</v-icon>
          <h3 class="font-headline text-h5 font-weight-bold">Actualizar Estado</h3>
        </div>
        <v-card-text class="pa-8">
          <p class="text-body-1 text-center mb-0">
            ¿Deseas cambiar el estado a <br>
            <span class="font-weight-bold text-primary text-h6">{{ statusDialog.newStatus }}</span>?
          </p>
        </v-card-text>
        <v-divider class="opacity-10"></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" color="stone-500" class="rounded-xl font-weight-bold px-6"
            @click="statusDialog.show = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" class="rounded-xl font-weight-bold px-8"
            @click="changeStatus">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Payment Dialog -->
    <v-dialog v-model="paymentDialog.show" max-width="440" persistent>
      <v-card class="rounded-xl overflow-hidden glass-panel shadow-24">
        <div class="bg-secondary pa-6 text-center text-white">
          <v-icon size="48" class="mb-2">mdi-cash-register</v-icon>
          <h3 class="font-headline text-h5 font-weight-bold">Confirmar Cobro</h3>
        </div>
        <v-card-text class="pa-8">
          <p class="text-body-1 text-center">¿Confirmas que el cliente ha pagado por este pedido?</p>
        </v-card-text>
        <v-divider class="opacity-10"></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" color="stone-500" class="rounded-xl font-weight-bold px-6"
            @click="paymentDialog.show = false">Descartar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="flat" class="rounded-xl font-weight-bold px-8" @click="markAsPaid">Confirmar
            Pago</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrdersStore } from '../../stores/useOrdersStore';
import { useClientsStore } from '../../stores/useClientsStore';
import OrderCard from '../../components/OrderCard.vue';
import { ORDER_STATUSES, getOrderStatusColor, getOrderStatusIcon } from '../../constants/orderStatus';

const ordersStore = useOrdersStore();
const clientsStore = useClientsStore();

const searchQuery = ref('');
const activeTypeFilter = ref('all');
const activeStatusFilter = ref('all');

const statusFilters = ORDER_STATUSES;

const typeFilters = [
  { label: 'Todos', value: 'all', icon: 'mdi-filter-variant' },
  { label: 'Para mesa', value: 'mesa', icon: 'mdi-table-furniture' },
  { label: 'Para llevar', value: 'takeaway', icon: 'mdi-door-open' },
];

const activeOrders = computed(() => {
  return [...ordersStore.orders].sort((a, b) => b.createdAt - a.createdAt);
});

function getOrderDisplayName(order) {
  if (order.clientId) {
    const client = clientsStore.getClientById(order.clientId);
    if (client) return client.name;
  }

  if (order.createdBy && order.createdBy !== 'Auto') {
    return order.createdBy;
  }

  return 'Cliente';
}

function matchesSearch(order, query) {
  if (!query) return true;

  const name = getOrderDisplayName(order).toLowerCase();
  const orderId = order.id.toLowerCase();
  const orderIdWithoutHash = orderId.replace(/^#/, '');

  return (
    name.includes(query)
    || orderId.includes(query)
    || orderIdWithoutHash.includes(query)
  );
}

const ordersForTypeCounts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return activeOrders.value.filter((order) => {
    if (activeStatusFilter.value !== 'all' && order.status !== activeStatusFilter.value) return false;
    return matchesSearch(order, query);
  });
});

const ordersForStatusCounts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return activeOrders.value.filter((order) => {
    if (activeTypeFilter.value === 'mesa' && order.isTakeaway) return false;
    if (activeTypeFilter.value === 'takeaway' && !order.isTakeaway) return false;
    return matchesSearch(order, query);
  });
});

function getTypeCount(typeValue) {
  const orders = ordersForTypeCounts.value;
  if (typeValue === 'all') return orders.length;
  if (typeValue === 'mesa') return orders.filter((o) => !o.isTakeaway).length;
  if (typeValue === 'takeaway') return orders.filter((o) => o.isTakeaway).length;
  return 0;
}

function getStatusCount(statusValue) {
  const orders = ordersForStatusCounts.value;
  if (statusValue === 'all') return orders.length;
  return orders.filter((o) => o.status === statusValue).length;
}

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return activeOrders.value.filter((order) => {
    if (activeTypeFilter.value === 'mesa' && order.isTakeaway) return false;
    if (activeTypeFilter.value === 'takeaway' && !order.isTakeaway) return false;
    if (activeStatusFilter.value !== 'all' && order.status !== activeStatusFilter.value) return false;

    return matchesSearch(order, query);
  });
});

const hasActiveFilters = computed(() => {
  return !!searchQuery.value.trim()
    || activeTypeFilter.value !== 'all'
    || activeStatusFilter.value !== 'all';
});

const availableStatuses = ORDER_STATUSES.map((s) => s.value);

const snackbar = ref({ show: false, text: '', color: 'success' });
const statusDialog = ref({ show: false, orderId: null, newStatus: '' });
const paymentDialog = ref({ show: false, orderId: null });

function showError(msg) {
  snackbar.value = { show: true, text: msg, color: 'error' };
}

function showSuccess(msg) {
  snackbar.value = { show: true, text: msg, color: 'success' };
}

function confirmStatusChange(order, newStatus) {
  if (order.status === newStatus) return;
  statusDialog.value = { show: true, orderId: order.id, newStatus };
}

async function changeStatus() {
  await ordersStore.updateOrderStatus(statusDialog.value.orderId, statusDialog.value.newStatus);
  statusDialog.value.show = false;
  showSuccess('Estado actualizado correctamente');
}

function confirmPayment(order) {
  paymentDialog.value = { show: true, orderId: order.id };
}

async function markAsPaid() {
  await ordersStore.updateOrderPaid(paymentDialog.value.orderId, true);
  paymentDialog.value.show = false;
  showSuccess('Pedido cobrado con éxito');
}

const getStatusColor = getOrderStatusColor;
const getStatusIcon = getOrderStatusIcon;
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glass-panel {
  background-color: rgba(var(--v-theme-surface), 0.9) !important;
  backdrop-filter: blur(12px);
}

.custom-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 12px !important;
}

.order-filters {
  gap: 8px;
}

.order-filters--scroll {
  overflow-x: auto;
  flex-wrap: nowrap;
  padding-bottom: 4px;
  scrollbar-width: auto;
}

.filter-count {
  margin-left: 6px;
  font-weight: 800;
  opacity: 0.85;
}
</style>
