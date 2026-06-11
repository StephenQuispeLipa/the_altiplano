<template>
  <div class="pa-4">
    <!-- Resumen Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" class="text-white" elevation="2">
          <v-card-text class="d-flex align-center justify-space-between">
            <div>
              <div class="text-subtitle-1 opacity-80">Ingresos Totales</div>
              <div class="text-h4 font-weight-bold">{{ totalRevenue }} Bs</div>
            </div>
            <v-icon size="48" class="opacity-60">mdi-cash-multiple</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="info" class="text-white" elevation="2">
          <v-card-text class="d-flex align-center justify-space-between">
            <div>
              <div class="text-subtitle-1 opacity-80">Pedidos Hoy</div>
              <div class="text-h4 font-weight-bold">{{ totalOrdersLength }}</div>
            </div>
            <v-icon size="48" class="opacity-60">mdi-room-service</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Ranking de Platos -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="bg-surface pb-0">
            Platillos Más Pedidos
          </v-card-title>
          <v-card-text class="pt-4">
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold text-primary">Platillo</th>
                  <th class="text-right font-weight-bold text-primary">Veces Pedido</th>
                  <th class="text-right font-weight-bold text-primary">Preparados (Hist.)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dish in topDishes" :key="dish.id">
                  <td>{{ dish.name }} <span class="text-caption text-grey">({{dish.type}})</span></td>
                  <td class="text-right">{{ dish.total_orders_history }}</td>
                  <td class="text-right">{{ dish.total_prepared_history }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Ranking de Clientes -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="bg-surface pb-0">
            Mejores Clientes
          </v-card-title>
          <v-card-text class="pt-4">
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold text-primary">Cliente</th>
                  <th class="text-left font-weight-bold text-primary">Ref/Tel</th>
                  <th class="text-right font-weight-bold text-primary">Total Pedidos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="client in topClients" :key="client.id">
                  <td>{{ client.name }}</td>
                  <td class="text-caption">{{ client.phone_reference }}</td>
                  <td class="text-right font-weight-bold">
                    <v-chip color="secondary" size="small" variant="flat">{{ client.total_orders_history }}</v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDishesStore } from '../stores/useDishesStore';
import { useClientsStore } from '../stores/useClientsStore';
import { useOrdersStore } from '../stores/useOrdersStore';

const dishesStore = useDishesStore();
const clientsStore = useClientsStore();
const ordersStore = useOrdersStore();

const topDishes = computed(() => {
  return [...dishesStore.dishes].sort((a, b) => b.total_orders_history - a.total_orders_history).slice(0, 5);
});

const topClients = computed(() => {
  return [...clientsStore.clients].sort((a, b) => b.total_orders_history - a.total_orders_history).slice(0, 5);
});

const totalRevenue = computed(() => {
  return ordersStore.orders.filter(o => o.isPaid).reduce((acc, current) => acc + current.total, 0);
});

const totalOrdersLength = computed(() => {
  return ordersStore.orders.length;
});
</script>
