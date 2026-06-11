<template>
  <v-card variant="flat" color="surface-container-low"
    class="mb-4 rounded-xl order-card shadow-sm overflow-hidden animate-fade-in">
    <div class="pa-6">
      <div class="d-flex align-start mb-4 order-card__header">
        <div class="order-card__header-id">
          <div class="text-caption font-weight-bold text-on-surface-variant uppercase tracking-widest mb-1">Orden de
            Pedido</div>
          <h2 class="font-headline text-h5 font-weight-bold text-primary">#{{ order.id }}</h2>
          <div v-if="orderTime" class="order-card__time text-[10px] text-on-surface-variant font-body mt-1">
            <v-icon size="12" class="mr-1 opacity-70">mdi-clock-outline</v-icon>
            {{ orderTime }}
          </div>
        </div>
        <div class="order-card__chips">
          <v-chip variant="flat" :color="statusChipColor" size="small"
            class="font-weight-bold uppercase tracking-tighter flex-shrink-0">
            {{ order.status }}
          </v-chip>
          <v-chip v-if="order.isPaid" variant="flat" color="success-container" size="small"
            class="font-weight-bold uppercase tracking-tighter flex-shrink-0" prepend-icon="mdi-check-decagram">
            Pagado
          </v-chip>
        </div>
      </div>

      <div class="ghost-border pa-4 rounded-lg surface-container-high mb-6 d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-avatar color="primary" size="32" class="elevation-1 flex-shrink-0">
            <span class="text-caption font-weight-bold text-white">{{ onBehalfOfInitials }}</span>
          </v-avatar>
          <div class="ms-4 avatar-text-block">
            <div class="text-[10px] font-weight-bold text-on-surface-variant uppercase opacity-70">A nombre de</div>
            <div class="font-body text-subtitle-2 font-weight-bold">{{ onBehalfOfName }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-[10px] font-weight-bold text-on-surface-variant uppercase opacity-70">Tipo</div>
          <v-icon :color="order.isTakeaway ? 'primary' : 'stone-400'">{{ order.isTakeaway ? 'mdi-door-open' :
            'mdi-table-furniture' }}</v-icon>
        </div>
      </div>

      <div class="mb-6">
        <div class="text-caption font-weight-bold text-on-surface-variant uppercase tracking-widest mb-3 px-1">Detalle
          del Menú</div>
        <v-list density="compact" class="bg-transparent pa-0">
          <v-list-item v-for="dish in order.detalle_platos" :key="dish.id" class="px-1 py-1 min-h-0">
            <template v-slot:prepend>
              <v-icon size="14" color="primary" class="mr-3">mdi-circle-medium</v-icon>
            </template>
            <v-list-item-title
              class="font-body text-body-2 font-weight-medium d-flex justify-space-between align-center">
              <span>{{ dish.name }}</span>
              <span class="text-caption opacity-60 ml-2 font-weight-bold uppercase">{{ dish.type }}</span>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <div
        class="d-flex justify-space-between align-center py-4 px-2 bg-on-surface-variant/5 rounded-lg border-stone-200 border-opacity-10 border-solid border-1">
        <span class="text-subtitle-2 font-weight-bold text-on-surface-variant">Total</span>
        <span class="font-headline text-h5 font-weight-bold text-primary">Bs {{ order.total }}</span>
      </div>
    </div>

    <v-divider class="opacity-5"></v-divider>

    <div class="pa-4 bg-surface-container-high/50 order-card__footer">
      <div class="d-flex align-center gap-2">
        <div class="order-card__actions d-flex align-center gap-2 flex-grow-1 min-w-0">
          <slot name="actions" :order="order"></slot>
        </div>
        <v-btn
          v-if="isAdmin"
          color="stone-400"
          variant="text"
          icon="mdi-delete-outline"
          class="order-card__delete opacity-60 hover:opacity-100 flex-shrink-0"
          @click="showDeleteDialog = true"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <v-dialog v-model="showDeleteDialog" max-width="440" persistent>
      <v-card class="rounded-xl overflow-hidden glass-panel elevation-24">
        <div class="bg-error pa-6 text-center text-white">
          <v-icon size="48" class="mb-2">mdi-delete-alert</v-icon>
          <h3 class="font-headline text-h5 font-weight-bold">¿Eliminar Pedido?</h3>
        </div>
        <v-card-text class="pa-8">
          <p class="text-body-1 text-center">
            Estás a punto de eliminar permanentemente el pedido <span class="font-weight-bold">#{{ order.id }}</span>.
            Esta acción no se puede revertir.
          </p>
        </v-card-text>
        <v-divider class="opacity-10"></v-divider>
        <v-card-actions class="pa-6">
          <v-btn variant="text" color="stone-500" class="rounded-xl font-weight-bold px-6"
            @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="flat" class="rounded-xl font-weight-bold px-8"
            @click="confirmDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrdersStore } from '../stores/useOrdersStore';
import { useClientsStore } from '../stores/useClientsStore';
import { getOrderStatusColor } from '../constants/orderStatus';

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['deleted', 'error']);

const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const clientsStore = useClientsStore();

const showDeleteDialog = ref(false);

const isAdmin = computed(() => authStore.currentRole === 'Admin');

const onBehalfOfName = computed(() => {
  if (props.order.clientId) {
    const client = clientsStore.getClientById(props.order.clientId);
    if (client) return client.name;
  }

  if (props.order.createdBy && props.order.createdBy !== 'Auto') {
    return props.order.createdBy;
  }

  return 'Cliente';
});

const onBehalfOfInitials = computed(() => {
  const name = onBehalfOfName.value;
  if (!name?.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
});

const statusChipColor = computed(() => getOrderStatusColor(props.order.status));

const orderTime = computed(() => {
  if (!props.order.createdAt) return '';
  return new Date(props.order.createdAt).toLocaleString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });
});

async function confirmDelete() {
  try {
    await ordersStore.deleteOrder(props.order.id);
    showDeleteDialog.value = false;
    emit('deleted', props.order.id);
  } catch (err) {
    showDeleteDialog.value = false;
    emit('error', err.message);
  }
}
</script>

<style scoped>
.order-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-card__header {
  gap: 12px;
}

.order-card__header-id {
  flex-shrink: 0;
}

.order-card__chips {
  display: flex;
  gap: 8px;
  min-width: 0;
  margin-left: auto;
  max-width: 55%;
  overflow-x: auto;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: auto;
  scrollbar-color: rgb(var(--v-theme-on-surface-variant)) rgb(var(--v-theme-surface-container-high));
  padding-bottom: 4px;
}

.order-card__chips::-webkit-scrollbar {
  height: 8px;
}

.order-card__chips::-webkit-scrollbar-track {
  background-color: rgb(var(--v-theme-surface-container-high));
  border-radius: 4px;
}

.order-card__chips::-webkit-scrollbar-thumb {
  background-color: rgb(var(--v-theme-on-surface-variant));
  border-radius: 4px;
  border: 1px solid rgb(var(--v-theme-surface-container-high));
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1) !important;
}

.ghost-border {
  border: 1px solid rgba(219, 193, 186, 0.2);
}

.min-h-0 {
  min-height: 28px !important;
}

.font-body {
  font-family: 'Manrope', sans-serif;
}

.glass-panel {
  background-color: rgba(var(--v-theme-surface), 0.9) !important;
  backdrop-filter: blur(12px);
}

.order-card__footer .d-flex {
  align-items: center;
}

.order-card__actions {
  gap: 8px;
}

.order-card__delete {
  align-self: center;
}
</style>
