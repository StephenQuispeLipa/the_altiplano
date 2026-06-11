<template>
  <v-container fluid class="pa-0 order-creation animate-fade-in">
    <!-- Welcome state (client only) -->
    <div v-if="!skipWelcome && !showOrdering" class="text-center welcome-section">
      <h1 class="font-headline text-h3 font-weight-bold text-primary mb-3">
        Bienvenido a Pension Familiar
      </h1>
      <p class="text-on-surface-variant font-body text-body-1 opacity-80 mb-10">
        Haz tu pedido rápidamente desde aquí
      </p>
      <v-btn
        color="primary"
        size="large"
        class="rounded-xl font-weight-bold px-12 py-6 text-h6"
        prepend-icon="mdi-silverware-fork-knife"
        @click="showOrdering = true"
      >
        Hacer Pedido
      </v-btn>
    </div>

    <!-- Ordering state -->
    <div v-else>
      <div v-if="isWaiter" class="mb-6">
        <h1 class="font-headline text-h4 font-weight-bold text-primary mb-1">Hacer Pedido</h1>
        <p class="text-on-surface-variant text-body-2 opacity-80">
          Selecciona los platillos y confirma al final con los datos del cliente.
        </p>
      </div>

      <!-- Mobile: Ver Pedido button -->
      <div v-if="!mdAndUp && cartStore.totalItems > 0" class="mb-4">
        <v-btn
          color="primary"
          block
          class="rounded-xl font-weight-bold"
          @click="mobileOrderOpen = true"
        >
          Ver Pedido ({{ cartStore.totalItems }})
        </v-btn>
      </div>

      <v-row>
        <!-- Menu area -->
        <v-col cols="12" :md="cartStore.totalItems > 0 && mdAndUp ? 8 : 12">
          <div class="d-flex gap-2 mb-8 overflow-x-auto no-scrollbar">
            <v-btn
              v-for="section in sectionOptions"
              :key="section.key"
              :variant="activeSection === section.key ? 'flat' : 'text'"
              :color="activeSection === section.key ? 'primary' : 'on-surface-variant'"
              :class="['rounded-pill font-weight-bold px-6', activeSection !== section.key ? 'bg-surface-container-low' : '']"
              @click="activeSection = section.key"
            >
              {{ section.label }}
            </v-btn>
          </div>

          <!-- Combos -->
          <div v-if="activeSection === 'combos'" class="mb-8">
            <h3 class="font-headline text-h4 font-weight-bold text-primary mb-6">Combos</h3>
            <v-row>
              <v-col
                v-for="combo in comboStore.combos"
                :key="combo.id"
                cols="6"
                md="3"
              >
                <MenuItemCard
                  :image="combo.image"
                  :name="combo.name"
                  :price="combo.basePrice"
                  :quantity="cartStore.getComboQuantity(combo.id)"
                  @increment="handleComboIncrement(combo)"
                  @decrement="handleComboDecrement(combo)"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Categorías del menú -->
          <div v-else-if="activeCategoryLabel">
            <h3 class="font-headline text-h4 font-weight-bold text-primary mb-6">{{ activeCategoryLabel }}</h3>
            <v-row>
              <v-col
                v-for="item in activeCategoryItems"
                :key="item.dishId"
                cols="6"
                md="3"
              >
                <MenuItemCard
                  :image="item.image"
                  :name="item.name"
                  :price="item.price"
                  :quantity="cartStore.getDishQuantity(item.dishId)"
                  :disabled="item.stock === 0"
                  @increment="cartStore.addDish(item.dishId)"
                  @decrement="cartStore.removeDish(item.dishId)"
                />
              </v-col>
            </v-row>
          </div>
        </v-col>

        <!-- Desktop order panel -->
        <v-col v-if="cartStore.totalItems > 0 && mdAndUp" cols="12" md="4">
          <div class="order-panel-sticky">
            <OrderSummaryPanel
              :items="cartStore.cartItems"
              :total="cartStore.totalPrice"
              @increment="cartStore.incrementLine"
              @decrement="cartStore.decrementLine"
              @submit="openConfirmDialog"
            />
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- Mobile order dialog -->
    <v-dialog v-model="mobileOrderOpen" fullscreen transition="dialog-bottom-transition">
      <v-card color="surface" class="d-flex flex-column">
        <v-toolbar color="surface-container-low" elevation="0">
          <v-btn icon="mdi-close" @click="mobileOrderOpen = false" />
          <v-toolbar-title class="font-headline font-weight-bold text-primary">
            Tu Pedido ({{ cartStore.totalItems }})
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-4 flex-grow-1">
          <OrderSummaryPanel
            :items="cartStore.cartItems"
            :total="cartStore.totalPrice"
            @increment="cartStore.incrementLine"
            @decrement="cartStore.decrementLine"
            @submit="openConfirmDialog(); mobileOrderOpen = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Combo configurator -->
    <ComboConfiguratorDialog
      v-model="comboDialogOpen"
      :combo="selectedCombo"
      @confirm="handleComboConfirm"
    />

    <!-- Confirm order dialog -->
    <v-dialog v-model="confirmOrderDialog" max-width="480" persistent>
      <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
        <div class="bg-primary pa-6 text-center">
          <v-icon size="48" color="white" class="mb-2">
            {{ confirmStep === 2 ? 'mdi-map-marker-check' : 'mdi-cart-check' }}
          </v-icon>
          <h3 class="font-headline text-h5 text-white font-weight-bold">
            {{ confirmDialogTitle }}
          </h3>
          <div v-if="isWaiter" class="text-caption text-white opacity-80 mt-1">
            Paso {{ confirmStep }} de 2
          </div>
        </div>
        <v-card-text class="pa-8">
          <template v-if="confirmStep === 1">
            <p class="text-body-1 mb-6 text-center">
              {{ isWaiter ? 'Revisa el pedido y selecciona el cliente.' : '¿Deseas enviar este pedido?' }}
            </p>

            <!-- Waiter: client selection -->
            <div v-if="isWaiter" class="mb-6">
              <div class="text-caption font-weight-bold uppercase tracking-widest mb-3 opacity-70">Cliente</div>
              <v-radio-group v-model="clientMode" hide-details class="mb-4">
                <v-radio label="Cliente con cuenta" value="registered" color="primary" />
                <v-radio label="Cliente sin cuenta" value="guest" color="primary" />
              </v-radio-group>

              <v-autocomplete
                v-if="clientMode === 'registered'"
                v-model="selectedClientId"
                :items="clientsStore.clients"
                item-title="name"
                item-value="id"
                label="Seleccionar cliente"
                prepend-inner-icon="mdi-account-search"
                variant="outlined"
                rounded="lg"
                :error-messages="clientError"
                class="mb-2"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="item.raw.phone" />
                </template>
              </v-autocomplete>

              <v-alert
                v-else
                type="info"
                variant="tonal"
                density="compact"
                class="rounded-lg"
                icon="mdi-account-tie"
              >
                La reserva quedará a nombre de <strong>{{ waiterName }}</strong>.
              </v-alert>
            </div>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
              class="rounded-lg mb-6"
              icon="mdi-door-open"
            >
              Los pedidos desde cuenta de cliente son <strong>para llevar</strong>.
            </v-alert>
          </template>

          <template v-else>
            <p class="text-body-1 mb-6 text-center">
              Selecciona si el pedido es para mesa o para llevar.
            </p>

            <div class="text-caption font-weight-bold uppercase tracking-widest mb-3 opacity-70">Tipo de pedido</div>
            <div class="d-flex order-type-options mb-6">
              <v-btn
                :variant="orderType === 'mesa' ? 'flat' : 'tonal'"
                :color="orderType === 'mesa' ? 'primary' : 'on-surface-variant'"
                class="flex-grow-1 rounded-xl font-weight-bold py-6"
                @click="orderType = 'mesa'"
              >
                <div class="d-flex flex-column align-center">
                  <v-icon size="28" class="mb-2">mdi-table-furniture</v-icon>
                  Para mesa
                </div>
              </v-btn>
              <v-btn
                :variant="orderType === 'takeaway' ? 'flat' : 'tonal'"
                :color="orderType === 'takeaway' ? 'primary' : 'on-surface-variant'"
                class="flex-grow-1 rounded-xl font-weight-bold py-6"
                @click="orderType = 'takeaway'"
              >
                <div class="d-flex flex-column align-center">
                  <v-icon size="28" class="mb-2">mdi-door-open</v-icon>
                  Para llevar
                </div>
              </v-btn>
            </div>

            <v-text-field
              v-if="orderType === 'mesa'"
              v-model.number="mesaNumber"
              type="number"
              min="1"
              label="Número de mesa"
              variant="filled"
              bg-color="surface-container-high"
              class="rounded-lg mb-6"
              hide-details
            />
          </template>

          <div class="bg-surface-container-high pa-5 rounded-xl mb-6">
            <div class="text-caption font-weight-bold uppercase tracking-widest mb-4 opacity-70">Resumen</div>
            <div v-for="item in cartStore.cartItems" :key="item.type === 'dish' ? item.dishId : item.lineKey" class="mb-2">
              <span class="font-weight-medium">{{ item.quantity }}× {{ item.name }}</span>
              <span class="float-right text-primary font-weight-bold">Bs {{ item.lineTotal }}</span>
            </div>
          </div>
          <div class="d-flex justify-space-between align-center bg-primary-fixed pa-4 rounded-lg">
            <span class="font-weight-bold text-primary">Total:</span>
            <span class="font-headline text-h5 font-weight-bold text-primary">Bs {{ cartStore.totalPrice }}</span>
          </div>
        </v-card-text>
        <v-divider class="opacity-10" />
        <v-card-actions class="pa-6">
          <v-btn
            variant="text"
            class="rounded-xl font-weight-bold"
            @click="confirmStep === 2 ? (confirmStep = 1) : (confirmOrderDialog = false)"
          >
            {{ confirmStep === 2 ? 'Atrás' : 'Cancelar' }}
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="isWaiter && confirmStep === 1"
            color="primary"
            variant="flat"
            class="rounded-xl font-weight-bold px-8"
            :disabled="!canSubmitWaiterOrder"
            @click="goToOrderTypeStep"
          >
            Siguiente
          </v-btn>
          <v-btn
            v-else
            color="primary"
            variant="flat"
            class="rounded-xl font-weight-bold px-8"
            :disabled="isWaiter && confirmStep === 1 && !canSubmitWaiterOrder"
            @click="submitOrder"
          >
            Hacer pedido
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top">
      <div class="d-flex align-center gap-3">
        <v-icon>{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
        <span class="font-weight-bold">{{ snackbar.text }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useMenuStore } from '../../stores/useMenuStore';
import { useComboStore } from '../../stores/useComboStore';
import { useCartStore } from '../../stores/useCartStore';
import { useOrdersStore } from '../../stores/useOrdersStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useClientsStore } from '../../stores/useClientsStore';
import { useStaffStore } from '../../stores/useStaffStore';
import { DISH_CATEGORIES } from '../../constants/dishCategories';
import { todayISO } from '../../utils/menuDate';
import MenuItemCard from '../cliente/MenuItemCard.vue';
import OrderSummaryPanel from '../cliente/OrderSummaryPanel.vue';
import ComboConfiguratorDialog from '../cliente/ComboConfiguratorDialog.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'client',
    validator: (v) => ['client', 'waiter'].includes(v),
  },
  skipWelcome: {
    type: Boolean,
    default: false,
  },
});

const { mdAndUp } = useDisplay();
const menuStore = useMenuStore();
const comboStore = useComboStore();
const cartStore = useCartStore();
const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const clientsStore = useClientsStore();
const staffStore = useStaffStore();

const isWaiter = computed(() => props.mode === 'waiter');
const showOrdering = ref(props.skipWelcome);
const activeSection = ref('combos');

const sectionOptions = computed(() => {
  const options = [];
  if (comboStore.combos.length > 0) {
    options.push({ key: 'combos', label: 'Combos' });
  }
  const today = todayISO();
  DISH_CATEGORIES.forEach(cat => {
    const count = menuStore.getCountByType(today, cat.type);
    if (count > 0) {
      options.push({ key: cat.type, label: `${cat.label} (${count})` });
    }
  });
  return options;
});

const activeCategoryLabel = computed(() => {
  if (activeSection.value === 'combos') return null;
  return DISH_CATEGORIES.find(c => c.type === activeSection.value)?.label ?? null;
});

const activeCategoryItems = computed(() => {
  if (activeSection.value === 'combos') return [];
  return menuStore.getAvailableByType(todayISO(), activeSection.value);
});

watch(sectionOptions, (options) => {
  if (!options.some(o => o.key === activeSection.value) && options.length > 0) {
    activeSection.value = options[0].key;
  }
}, { immediate: true });
const mobileOrderOpen = ref(false);
const comboDialogOpen = ref(false);
const selectedCombo = ref(null);
const confirmOrderDialog = ref(false);
const confirmStep = ref(1);
const orderType = ref('mesa');
const mesaNumber = ref(1);
const snackbar = ref({ show: false, text: '', color: 'success' });

const clientMode = ref('registered');
const selectedClientId = ref(null);
const clientError = ref('');

const confirmDialogTitle = computed(() => {
  if (isWaiter.value && confirmStep.value === 2) return 'Tipo de Pedido';
  return 'Confirmar Pedido';
});

const waiterName = computed(() => {
  const staff = staffStore.getStaffById(authStore.currentStaffId);
  return staff?.name ?? 'Camarero';
});

const canSubmitWaiterOrder = computed(() => {
  if (clientMode.value === 'registered') return !!selectedClientId.value;
  return true;
});

function handleComboIncrement(combo) {
  selectedCombo.value = combo;
  comboDialogOpen.value = true;
}

function handleComboDecrement(combo) {
  const comboLines = cartStore.lines.filter(l => l.type === 'combo' && l.comboId === combo.id);
  if (comboLines.length > 0) {
    cartStore.removeComboLine(comboLines[comboLines.length - 1].lineKey);
  }
}

function handleComboConfirm(selections) {
  if (selectedCombo.value) {
    cartStore.addCombo(selectedCombo.value.id, selections);
  }
}

function openConfirmDialog() {
  confirmStep.value = 1;
  orderType.value = 'mesa';
  mesaNumber.value = 1;
  if (isWaiter.value) {
    clientMode.value = 'registered';
    selectedClientId.value = null;
    clientError.value = '';
  }
  confirmOrderDialog.value = true;
}

function goToOrderTypeStep() {
  if (isWaiter.value && clientMode.value === 'registered' && !selectedClientId.value) {
    clientError.value = 'Selecciona un cliente con cuenta.';
    return;
  }
  clientError.value = '';
  confirmStep.value = 2;
}

async function submitOrder() {
  if (isWaiter.value && clientMode.value === 'registered' && !selectedClientId.value) {
    clientError.value = 'Selecciona un cliente con cuenta.';
    return;
  }

  if (isWaiter.value && orderType.value === 'mesa' && !mesaNumber.value) {
    snackbar.value = { show: true, text: 'Ingresa el número de mesa.', color: 'error' };
    return;
  }

  const isTakeaway = isWaiter.value ? orderType.value === 'takeaway' : true;
  const location = isTakeaway ? 'Delivery' : `Mesa ${mesaNumber.value}`;

  let clientId = null;
  if (isWaiter.value) {
    clientId = clientMode.value === 'registered' ? selectedClientId.value : null;
  } else {
    clientId = authStore.currentClientId;
  }

  try {
    await ordersStore.createFromCart({ clientId, isTakeaway, location });
    confirmOrderDialog.value = false;
    confirmStep.value = 1;
    mobileOrderOpen.value = false;
    snackbar.value = {
      show: true,
      text: isWaiter.value ? '¡Pedido registrado con éxito!' : '¡Pedido enviado con éxito!',
      color: 'success',
    };
  } catch (err) {
    snackbar.value = {
      show: true,
      text: err.message || 'No se pudo registrar el pedido.',
      color: 'error',
    };
  }
}
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

.welcome-section {
  padding: 4rem 1rem;
}

.order-panel-sticky {
  position: sticky;
  top: 24px;
}

.order-type-options {
  gap: 12px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
