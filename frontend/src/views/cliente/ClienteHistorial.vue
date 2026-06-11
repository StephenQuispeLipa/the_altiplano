<template>
  <v-container fluid class="pa-0 animate-fade-in">
    <div class="mb-10">
      <h1 class="font-headline text-h3 font-weight-bold text-primary mb-2">Historial de Pedidos</h1>
      <p class="text-on-surface-variant font-body text-body-1 opacity-80">
        Tus pedidos anteriores
      </p>
    </div>

    <div v-if="myOrders.length === 0" class="text-center py-16">
      <v-icon size="64" color="on-surface-variant" class="opacity-40 mb-4">mdi-receipt-text-outline</v-icon>
      <p class="text-on-surface-variant opacity-70">Aún no tienes pedidos registrados</p>
    </div>

    <div v-else class="history-list">
      <v-card
        v-for="order in myOrders"
        :key="order.id"
        variant="flat"
        color="surface-container-low"
        class="history-order rounded-xl overflow-hidden mb-6"
      >
        <div class="history-order__header pa-6 pb-4">
          <div class="d-flex justify-space-between align-start flex-wrap gap-3">
            <div>
              <div class="text-caption font-weight-bold uppercase tracking-widest text-on-surface-variant opacity-70 mb-1">
                Pedido
              </div>
              <h3 class="font-headline text-h5 font-weight-bold text-primary">#{{ order.id }}</h3>
              <div class="text-caption text-on-surface-variant mt-2 opacity-80">
                {{ formatDate(order.createdAt) }}
              </div>
            </div>
            <v-chip :color="statusColor(order.status)" size="small" variant="flat" class="font-weight-bold">
              {{ order.status }}
            </v-chip>
          </div>
        </div>

        <div class="history-order__items px-6 pb-4">
          <v-row>
            <v-col
              v-for="item in groupOrderItems(order.detalle_platos)"
              :key="`${order.id}-${item.id}-${item.name}`"
              cols="6"
              sm="4"
              md="3"
            >
              <v-card variant="flat" color="surface-container-high" class="history-item rounded-xl overflow-hidden h-100">
                <div class="history-item__image-wrap">
                  <v-img :src="dishImage" cover class="history-item__image" />
                  <v-chip
                    v-if="item.quantity > 1"
                    color="primary"
                    size="x-small"
                    variant="flat"
                    class="history-item__qty font-weight-bold"
                  >
                    x{{ item.quantity }}
                  </v-chip>
                </div>
                <v-card-text class="pa-3">
                  <div class="font-weight-bold text-body-2 line-clamp-2 mb-1">{{ item.name }}</div>
                  <v-chip
                    v-if="item.type"
                    size="x-small"
                    variant="flat"
                    color="secondary"
                    class="font-weight-bold text-uppercase mb-2"
                  >
                    {{ item.type }}
                  </v-chip>
                  <div class="font-headline text-subtitle-2 text-primary font-weight-bold">
                    Bs {{ item.price * item.quantity }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <v-divider class="opacity-10" />

        <div class="history-order__footer pa-6 d-flex justify-space-between align-center">
          <span class="font-weight-bold text-on-surface-variant text-body-1">Total del pedido</span>
          <span class="font-headline text-h5 font-weight-bold text-primary">Bs {{ order.total }}</span>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useOrdersStore } from '../../stores/useOrdersStore';
import dishImage from '../../assets/silpancho.jpg';

const ordersStore = useOrdersStore();

onMounted(async () => {
  try {
    await ordersStore.fetchMyOrders();
  } catch {
    // bootstrap or retry handles connection errors
  }
});

const myOrders = computed(() =>
  [...ordersStore.orders].sort((a, b) => b.createdAt - a.createdAt)
);

function groupOrderItems(detalle) {
  const map = new Map();
  for (const dish of detalle) {
    const key = `${dish.id}-${dish.name}`;
    if (map.has(key)) {
      map.get(key).quantity += 1;
    } else {
      map.set(key, { ...dish, quantity: 1 });
    }
  }
  return Array.from(map.values());
}

function statusColor(status) {
  switch (status) {
    case 'En preparación': return 'warning';
    case 'Entregado': return 'success';
    default: return 'primary';
  }
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.history-item__image-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.history-item__image {
  width: 100%;
  height: 100%;
}

.history-item__qty {
  position: absolute;
  top: 8px;
  right: 8px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
