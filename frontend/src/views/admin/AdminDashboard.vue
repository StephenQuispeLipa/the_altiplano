<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Hero Header -->
    <div class="d-flex flex-column flex-md-row align-md-end justify-space-between gap-4">
      <div>
        <span
          class="font-label text-caption font-weight-bold text-uppercase tracking-widest text-primary">Resumen</span>
        <h1 class="font-headline text-h3 font-weight-bold text-on-surface mt-1">Panel Sabor Boliviano</h1>
      </div>

      <!-- <div class="d-flex gap-3">
        <v-btn variant="flat" color="surface-container-high" class="rounded-xl font-weight-bold">
          Export Report
        </v-btn>
        <v-btn variant="flat" color="primary" class="bg-primary-gradient rounded-xl font-weight-bold elevation-4">
          <v-icon left class="mr-2">mdi-plus</v-icon>
          New Order
        </v-btn>
      </div> -->
    </div>

    <!-- Bento Grid Metrics -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" color="surface-container-low"
          class="rounded-xl pa-6 h-100 d-flex flex-column justify-space-between">
          <div class="d-flex justify-space-between align-start">
            <v-avatar color="primary" variant="tonal" rounded="lg" size="40">
              <v-icon color="primary">mdi-cash-multiple</v-icon>
            </v-avatar>
            <span class="text-caption font-weight-bold text-secondary d-flex align-center gap-1">
              <v-icon size="14">mdi-trending-up</v-icon> +12%
            </span>
          </div>
          <div class="mt-4">
            <p class="font-label text-caption text-on-surface-variant text-uppercase tracking-widest font-weight-bold">
              Ventas de Hoy</p>
            <h3 class="font-headline text-h4 font-weight-bold text-on-surface">Bs. {{
              todayRevenue.toLocaleString('es-BO') }}</h3>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" color="surface-container-low"
          class="rounded-xl pa-6 h-100 d-flex flex-column justify-space-between">
          <div class="d-flex justify-space-between align-start">
            <v-avatar color="secondary" variant="tonal" rounded="lg" size="40">
              <v-icon color="secondary">mdi-clipboard-text-clock-outline</v-icon>
            </v-avatar>
          </div>
          <div class="mt-4">
            <p class="font-label text-caption text-on-surface-variant text-uppercase tracking-widest font-weight-bold">
              Pedidos Activos</p>
            <h3 class="font-headline text-h4 font-weight-bold text-on-surface">{{ordersStore.orders.filter(o =>
              o.status !== 'Entregado').length}}</h3>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="flat" color="surface-container-lowest" class="rounded-xl ghost-border h-100 pa-0">
          <v-row no-gutters class="h-100">
            <v-col cols="8" class="pa-6 d-flex flex-column justify-center">
              <v-chip color="tertiary" size="x-small" variant="flat"
                class="font-weight-bold text-uppercase tracking-widest mb-2 align-self-start">Top Seller</v-chip>
              <h4 class="font-headline text-h5 font-weight-bold text-on-surface">{{ starDish?.name ?? 'Sin datos' }}</h4>
              <p class="text-body-2 text-on-surface-variant font-body">{{ starDish?.units ?? 0 }} unidades esta
                semana</p>
              <div class="mt-4">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-[10px] font-weight-bold text-tertiary">{{ starDishPopularity }}%
                    de popularidad</span>
                </div>
                <v-progress-linear color="tertiary" :model-value="starDishPopularity" rounded
                  height="6"></v-progress-linear>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Analytics Section -->
    <v-row align="start">
      <v-col cols="12" lg="8">
        <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-8">
          <div class="d-flex justify-space-between align-center mb-8">
            <div>
              <h3 class="font-headline text-h5 font-weight-bold mb-1">Rendimiento Semanal</h3>
              <p class="text-body-2 text-on-surface-variant font-body">Ingresos por ventas de los últimos 7 días</p>
            </div>
            <div class="text-right">
              <p class="text-caption font-weight-bold text-on-surface-variant text-uppercase tracking-widest mb-1">Total
                semanal</p>
              <p class="font-headline text-h6 font-weight-bold text-primary">Bs. {{ weeklyTotal.toLocaleString() }}</p>
            </div>
          </div>

          <div v-if="weeklyHasData" class="chart-container d-flex align-end justify-space-around px-4">
            <div
              v-for="day in weeklyData"
              :key="day.date"
              class="chart-column-group"
              @mouseenter="hoveredDay = day.date"
              @mouseleave="hoveredDay = null"
            >
              <div class="chart-bar-area">
                <div
                  :class="[
                    'chart-bar-column',
                    {
                      'chart-bar-column--peak': day.isPeak,
                      'chart-bar-column--active': isDayHighlighted(day.date),
                    },
                  ]"
                  role="button"
                  tabindex="0"
                  :aria-label="`${day.label}: Bs. ${day.amount.toLocaleString('es-BO')}`"
                  @click="toggleSelectedDay(day.date)"
                  @keydown.enter="toggleSelectedDay(day.date)"
                  @keydown.space.prevent="toggleSelectedDay(day.date)"
                >
                  <div v-if="isDayHighlighted(day.date)" class="chart-tooltip">
                    Bs. {{ day.amount.toLocaleString('es-BO') }}
                  </div>
                  <div
                    class="chart-bar rounded-t-pill"
                    :style="barStyle(day)"
                  ></div>
                </div>
              </div>
              <span class="text-[10px] text-uppercase font-weight-bold text-on-surface-variant mt-2">{{ day.label }}</span>
              <span class="text-[9px] text-on-surface-variant opacity-70">{{ day.orders }} ped.</span>
            </div>
          </div>
          <div v-else class="chart-empty text-center py-12">
            <v-icon icon="mdi-chart-bar" size="40" color="on-surface-variant" class="mb-3 opacity-50" />
            <p class="text-body-2 text-on-surface-variant">Sin ventas en los últimos 7 días</p>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card variant="flat" color="surface-container-low"
          class="rounded-xl pa-6 overflow-hidden d-flex flex-column recent-orders-card">
          <div class="d-flex align-center justify-space-between mb-6 recent-orders-card__header">
            <h3 class="font-headline text-h5 font-weight-bold">Pedidos Recientes</h3>
            <v-btn variant="text" size="small" color="primary" class="font-weight-bold" :to="{ name: 'orders' }">
              Ver Todos
            </v-btn>
          </div>

          <div class="recent-orders-list custom-scrollbar">
            <v-card
              v-for="order in recentOrders"
              :key="order.id"
              variant="flat"
              color="surface-container-lowest"
              class="rounded-xl pa-4 border-none recent-order-card"
            >
              <div class="recent-order-card__header">
                <div class="recent-order-card__identity">
                  <span class="text-[10px] font-weight-bold text-on-surface-variant uppercase tracking-widest">Pedido</span>
                  <span class="font-headline text-subtitle-1 font-weight-bold text-primary">#{{ order.id }}</span>
                  <span class="recent-order-card__time text-[10px] text-on-surface-variant font-body">
                    <v-icon size="12" class="mr-1 opacity-70">mdi-clock-outline</v-icon>
                    {{ order.time }}
                  </span>
                </div>
                <div class="recent-order-card__chips">
                  <v-chip :color="order.statusColor" size="x-small" variant="flat"
                    class="font-weight-bold text-uppercase tracking-tighter flex-shrink-0">
                    {{ order.status }}
                  </v-chip>
                  <v-chip v-if="order.isPaid" color="success-container" size="x-small" variant="flat"
                    class="font-weight-bold uppercase tracking-tighter flex-shrink-0" prepend-icon="mdi-check-decagram">
                    Pagado
                  </v-chip>
                </div>
              </div>

              <div class="recent-order-card__client">
                <div class="d-flex align-center min-w-0">
                  <v-avatar color="primary" size="28" class="flex-shrink-0">
                    <span class="text-[10px] font-weight-bold text-white">{{ order.initials }}</span>
                  </v-avatar>
                  <div class="ms-2 min-w-0">
                    <div class="text-[9px] font-weight-bold text-on-surface-variant uppercase opacity-70">A nombre de</div>
                    <div class="text-caption font-weight-bold text-on-surface text-truncate">{{ order.clientName }}</div>
                  </div>
                </div>
                <div class="recent-order-card__type text-right flex-shrink-0">
                  <div class="text-[9px] font-weight-bold text-on-surface-variant uppercase opacity-70">Tipo</div>
                  <v-icon size="16" :color="order.isTakeaway ? 'primary' : 'stone-400'">
                    {{ order.isTakeaway ? 'mdi-door-open' : 'mdi-table-furniture' }}
                  </v-icon>
                </div>
              </div>

              <div class="recent-order-card__total">
                <span class="text-caption font-weight-bold text-on-surface-variant">Total</span>
                <span class="font-headline text-subtitle-1 font-weight-bold text-primary">Bs {{ order.total }}</span>
              </div>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- FAB for quick action -->
    <v-btn icon="mdi-plus" color="primary" size="x-large" class="fixed-fab elevation-8 bg-primary-gradient"
      position="fixed"></v-btn>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore } from '../../stores/useOrdersStore'
import { useClientsStore } from '../../stores/useClientsStore'
import { useAnalyticsMetrics } from '../../composables/useAnalyticsMetrics'
import { getOrderStatusColor } from '../../constants/orderStatus'

const ordersStore = useOrdersStore()
const clientsStore = useClientsStore()

const {
  todayRevenue,
  dailyBreakdownChart,
  starDish,
  summary: weekSummary,
} = useAnalyticsMetrics(7)

function formatWeekdayLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const weekday = new Date(y, m - 1, d).toLocaleDateString('es-BO', { weekday: 'short' })
  return weekday.replace('.', '').charAt(0).toUpperCase() + weekday.replace('.', '').slice(1)
}

const weeklyData = computed(() =>
  dailyBreakdownChart.value.map(d => ({
    date: d.date,
    label: formatWeekdayLabel(d.date),
    amount: d.revenue,
    orders: d.orders,
    percent: d.percent,
    isPeak: d.isPeak,
  }))
)

const weeklyTotal = computed(() => weekSummary.value.revenue)
const weeklyHasData = computed(() => weeklyData.value.some(d => d.amount > 0 || d.orders > 0))

function barStyle(day) {
  if (!day.percent) return { height: '0' }
  return { height: `${Math.max(day.percent, 8)}%` }
}

const starDishPopularity = computed(() => {
  const dish = starDish.value
  if (!dish) return 0
  const totalUnits = weeklyData.value.reduce((s, d) => s + d.orders, 0) || 1
  return Math.min(100, Math.round((dish.units / totalUnits) * 100))
})

const hoveredDay = ref(null)
const selectedDay = ref(null)

const isDayHighlighted = (label) =>
  hoveredDay.value === label || selectedDay.value === label

const toggleSelectedDay = (label) => {
  selectedDay.value = selectedDay.value === label ? null : label
}
function getClientName(order) {
  if (order.clientId) {
    const client = clientsStore.getClientById(order.clientId)
    if (client) return client.name
  }
  if (order.createdBy && order.createdBy !== 'Auto') return order.createdBy
  return 'Cliente'
}

function getInitials(name) {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function formatOrderTime(ts) {
  return new Date(ts).toLocaleString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const recentOrders = computed(() =>
  [...ordersStore.orders]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4)
    .map(o => {
      const clientName = getClientName(o)
      return {
        id: o.id,
        status: o.status,
        statusColor: getOrderStatusColor(o.status),
        isPaid: o.isPaid,
        isTakeaway: o.isTakeaway,
        clientName,
        initials: getInitials(clientName),
        total: o.total,
        time: formatOrderTime(o.createdAt),
      }
    })
)
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

.bg-primary-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-container));
}

.chart-container {
  height: 240px;
  position: relative;
  background-image: linear-gradient(to bottom, rgba(28, 28, 25, 0.05) 1px, transparent 1px);
  background-size: 100% 40px;
}

.chart-column-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 72px;
  height: 100%;
}

.chart-bar-area {
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar-column {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 40px;
  height: 100%;
  cursor: pointer;
  outline: none;
}

.chart-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background-color: var(--surface-container-highest);
  color: var(--on-surface);
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  z-index: 2;
  animation: tooltipIn 0.15s ease-out;
}

.chart-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--surface-container-highest);
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.chart-bar {
  width: 16px;
  min-height: 0;
  background-color: var(--primary-container);
  opacity: 0.45;
  transition: all 0.25s ease;
}

.chart-empty {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-bar-column--peak .chart-bar {
  opacity: 1;
  background-color: var(--primary);
}

.chart-bar-column--active .chart-bar,
.chart-bar-column:hover .chart-bar {
  opacity: 1;
  background-color: var(--primary);
  transform: scaleX(1.2);
}

.chart-bar-column:focus-visible .chart-bar {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.recent-orders-card__header {
  flex-shrink: 0;
}

.recent-orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  min-height: 0;
}

.recent-order-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  width: 100%;
}

.recent-order-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.recent-order-card__identity {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}

.recent-order-card__chips {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  max-width: 55%;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.recent-order-card__time {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.recent-order-card__client {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
  border-radius: 10px;
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(219, 193, 186, 0.15);
}

.recent-order-card__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 10px;
  background-color: rgba(var(--v-theme-on-surface-variant), 0.05);
  margin-top: 4px;
}

.bg-gradient-to-r-highlight-secondary {
  background: linear-gradient(to right, rgba(59, 105, 52, 0.05), transparent);
}

.border-l-4-secondary {
  border-left: 4px solid var(--secondary);
}

.bg-gradient-to-r-highlight-tertiary {
  background: linear-gradient(to right, rgba(105, 71, 0, 0.05), transparent);
}

.border-l-4-tertiary {
  border-left: 4px solid var(--tertiary);
}

.fixed-fab {
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--surface-container-high);
  border-radius: 10px;
}

.-space-x-2>*+* {
  margin-left: -0.5rem;
}
</style>
