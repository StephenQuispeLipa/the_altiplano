<template>
  <v-container fluid class="pa-0 animate-fade-in">
    <div class="d-flex flex-column flex-md-row align-md-end justify-space-between gap-4 mb-8">
      <div>
        <h3 class="font-headline text-h3 font-weight-bold text-on-surface">Analíticas</h3>
        <p class="font-body text-on-surface-variant mt-2 text-h6">Métricas operativas basadas en pedidos y menú del día.</p>
      </div>
      <div class="d-flex flex-wrap gap-3 align-center">
        <v-select
          v-model="periodDays"
          :items="periodOptions"
          item-title="label"
          item-value="value"
          label="Período"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          hide-details
          class="period-select"
          prepend-inner-icon="mdi-calendar-range"
        />
        <v-btn
          variant="flat"
          color="primary"
          class="bg-primary-gradient rounded-xl font-weight-bold elevation-4"
          prepend-icon="mdi-file-pdf-box"
          @click="handleExport"
        >
          Exportar Reporte
        </v-btn>
      </div>
    </div>

    <!-- KPIs del período -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-6 h-100">
          <span class="font-label text-caption font-weight-bold uppercase tracking-widest text-on-surface-variant opacity-70">Ingresos del período</span>
          <h4 class="font-headline text-h4 font-weight-bold text-primary mt-3">Bs {{ summary.revenue.toLocaleString('es-BO') }}</h4>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-6 h-100">
          <span class="font-label text-caption font-weight-bold uppercase tracking-widest text-on-surface-variant opacity-70">Pedidos</span>
          <h4 class="font-headline text-h4 font-weight-bold text-on-surface mt-3">{{ summary.orderCount }}</h4>
          <span class="text-caption text-on-surface-variant">Ticket prom. Bs {{ summary.avgTicket }}</span>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-6 h-100">
          <span class="font-label text-caption font-weight-bold uppercase tracking-widest text-on-surface-variant opacity-70">Cobrado / Pendiente</span>
          <h4 class="font-headline text-h4 font-weight-bold text-secondary mt-3">{{ summary.paidPercent }}%</h4>
          <span class="text-caption text-on-surface-variant">Pendiente: Bs {{ summary.unpaidRevenue.toLocaleString('es-BO') }}</span>
        </v-card>
      </v-col>
    </v-row>

    <!-- Alertas -->
    <v-row v-if="hasAlerts" class="mb-6">
      <v-col cols="12">
        <v-card variant="flat" color="surface-container-high" class="rounded-xl pa-5">
          <div class="d-flex flex-wrap gap-2">
            <v-chip v-for="item in menuAlerts.soldOut" :key="'out-' + item.id" color="error" variant="tonal" size="small">
              AGOTADO: {{ item.name }}
            </v-chip>
            <v-chip v-for="item in menuAlerts.lowStock" :key="'low-' + item.id" color="warning" variant="tonal" size="small">
              Stock bajo ({{ item.stock }}): {{ item.name }}
            </v-chip>
            <v-chip v-if="unpaidPeriodOrders.length" color="info" variant="tonal" size="small">
              {{ unpaidPeriodOrders.length }} pedidos sin cobrar en el período
            </v-chip>
            <v-chip v-if="activeOrders.length" color="primary" variant="tonal" size="small">
              {{ activeOrders.length }} pedidos activos ahora
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Ingresos por día + Plato estrella -->
    <v-row class="mb-8">
      <v-col cols="12" lg="8">
        <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-8 h-100">
          <h5 class="font-headline text-h5 font-weight-bold mb-6">Ingresos por día</h5>
          <div class="chart-scroll-wrapper">
            <v-btn
              v-if="dailyCanScrollLeft"
              class="chart-scroll-nav chart-scroll-nav--left"
              icon="mdi-chevron-left"
              size="small"
              variant="flat"
              color="surface-container-highest"
              aria-label="Desplazar ingresos hacia la izquierda"
              @click="scrollDailyLeft"
            />
            <div ref="dailyScrollRef" class="chart-scroll custom-scrollbar">
            <div class="chart-scroll__track daily-chart">
              <div
                v-for="day in dailyBreakdownChart"
                :key="day.date"
                class="chart-scroll__item daily-chart__column"
              >
                <v-tooltip location="top">
                  <template #activator="{ props: tipProps }">
                    <div
                      v-bind="tipProps"
                      :style="{ height: Math.max(day.percent, 4) + '%' }"
                      class="daily-chart__bar rounded-t-sm"
                      :class="{ 'daily-chart__bar--peak': day.isPeak }"
                    />
                  </template>
                  <span>{{ day.label }}: Bs {{ day.revenue }} ({{ day.orders }} pedidos)</span>
                </v-tooltip>
                <span class="daily-chart__label">{{ day.shortLabel }}</span>
              </div>
            </div>
            </div>
            <v-btn
              v-if="dailyCanScrollRight"
              class="chart-scroll-nav chart-scroll-nav--right"
              icon="mdi-chevron-right"
              size="small"
              variant="flat"
              color="surface-container-highest"
              aria-label="Desplazar ingresos hacia la derecha"
              @click="scrollDailyRight"
            />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card variant="flat" color="primary" class="rounded-xl pa-0 h-100 overflow-hidden d-flex flex-column text-white">
          <div v-if="starDish" class="star-dish-image-wrap">
            <CroppedImage :src="starDish.image" ratio="16/9">
              <div class="star-dish-overlay" />
              <div class="star-dish-chip-wrap">
                <v-chip color="tertiary" size="x-small" variant="flat" class="font-weight-bold text-uppercase">Plato estrella</v-chip>
              </div>
            </CroppedImage>
          </div>
          <div class="pa-6 flex-grow-1">
            <h6 class="font-headline text-h5 font-weight-bold">{{ starDish?.name ?? 'Sin datos' }}</h6>
            <p class="text-body-2 opacity-90 mt-2">
              {{ starDish?.units ?? 0 }} unidades vendidas en los últimos {{ periodDays }} días.
              Ingresos: Bs {{ (starDish?.revenue ?? 0).toLocaleString('es-BO') }}.
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Horas pico + categorías -->
    <v-row class="mb-8">
      <v-col cols="12" lg="8">
        <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-8 h-100">
          <div class="d-flex justify-space-between align-center mb-8">
            <h5 class="font-headline text-h5 font-weight-bold">Horas pico</h5>
            <div class="d-flex gap-3">
              <v-chip color="primary" size="x-small" variant="flat" class="font-weight-bold text-uppercase">Mesa</v-chip>
              <v-chip color="secondary" size="x-small" variant="flat" class="font-weight-bold text-uppercase">Para llevar</v-chip>
            </div>
          </div>
          <div class="chart-scroll-wrapper">
            <v-btn
              v-if="peakCanScrollLeft"
              class="chart-scroll-nav chart-scroll-nav--left"
              icon="mdi-chevron-left"
              size="small"
              variant="flat"
              color="surface-container-highest"
              aria-label="Desplazar horas pico hacia la izquierda"
              @click="scrollPeakLeft"
            />
            <div ref="peakScrollRef" class="chart-scroll custom-scrollbar">
            <div class="chart-scroll__track peak-hours-chart">
              <div
                v-for="hour in peakHours"
                :key="hour.hour"
                class="chart-scroll__item peak-hours-chart__column"
              >
                <div class="peak-hours-chart__bars">
                  <div
                    :style="{ height: Math.max(hour.diningPct, 2) + '%' }"
                    class="peak-hours-chart__bar peak-hours-chart__bar--dining"
                  />
                  <div
                    :style="{ height: Math.max(hour.deliveryPct, 2) + '%' }"
                    class="peak-hours-chart__bar peak-hours-chart__bar--delivery"
                  />
                </div>
                <span class="peak-hours-chart__label">{{ hour.label }}</span>
              </div>
            </div>
            </div>
            <v-btn
              v-if="peakCanScrollRight"
              class="chart-scroll-nav chart-scroll-nav--right"
              icon="mdi-chevron-right"
              size="small"
              variant="flat"
              color="surface-container-highest"
              aria-label="Desplazar horas pico hacia la derecha"
              @click="scrollPeakRight"
            />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-6 h-100">
          <h5 class="font-headline text-h6 font-weight-bold mb-4">Ventas por categoría</h5>
          <div v-for="cat in salesByCategory" :key="cat.type" class="mb-4">
            <div class="d-flex justify-space-between text-caption font-weight-bold mb-1">
              <span>{{ cat.type === 'Combo' ? 'Combos' : getCategoryLabel(cat.type) }}</span>
              <span>{{ cat.units }} u. — Bs {{ cat.revenue }}</span>
            </div>
            <v-progress-linear
              :model-value="categoryPercent(cat.revenue)"
              color="primary"
              rounded
              height="6"
            />
          </div>
          <p v-if="!salesByCategory.length" class="text-caption text-on-surface-variant">Sin ventas en el período.</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tablas -->
    <v-row class="mb-8">
      <v-col cols="12" md="6">
        <v-card variant="flat" color="surface-container-lowest" class="rounded-xl pa-6 h-100">
          <h5 class="font-headline text-h6 font-weight-bold mb-4">Top platillos</h5>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Platillo</th>
                <th class="text-right">Uds.</th>
                <th class="text-right">Bs</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dish in topDishes" :key="dish.id">
                <td>{{ dish.name }} <span class="text-caption opacity-60">({{ getCategoryLabel(dish.type) }})</span></td>
                <td class="text-right">{{ dish.units }}</td>
                <td class="text-right">{{ dish.revenue }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="flat" color="surface-container-lowest" class="rounded-xl pa-6 h-100">
          <h5 class="font-headline text-h6 font-weight-bold mb-4">Top combos</h5>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Combo</th>
                <th class="text-right">Ventas</th>
                <th class="text-right">Bs</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="combo in topCombos" :key="combo.id">
                <td>{{ combo.name }}</td>
                <td class="text-right">{{ combo.units }}</td>
                <td class="text-right">{{ combo.revenue }}</td>
              </tr>
              <tr v-if="!topCombos.length">
                <td colspan="3" class="text-caption text-on-surface-variant">Sin ventas de combos en el período.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" md="6">
        <v-card variant="flat" color="surface-container-lowest" class="rounded-xl pa-6 h-100">
          <h5 class="font-headline text-h6 font-weight-bold mb-4">Mejores clientes</h5>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Cliente</th>
                <th class="text-right">Pedidos</th>
                <th class="text-right">Bs</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in topClients" :key="client.id">
                <td>{{ client.name }}</td>
                <td class="text-right">{{ client.orders }}</td>
                <td class="text-right">{{ client.revenue }}</td>
              </tr>
              <tr v-if="!topClients.length">
                <td colspan="3" class="text-caption text-on-surface-variant">Sin clientes registrados en el período.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="flat" color="surface-container-lowest" class="rounded-xl pa-6 h-100">
          <h5 class="font-headline text-h6 font-weight-bold mb-4">Pedidos por estado</h5>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Estado</th>
                <th class="text-right">Cant.</th>
                <th class="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in ordersByStatus" :key="row.status">
                <td>{{ row.status }}</td>
                <td class="text-right">{{ row.count }}</td>
                <td class="text-right">{{ row.percent }}%</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Menú de hoy -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-6">
          <h5 class="font-headline text-h6 font-weight-bold mb-4">Menú de hoy</h5>
          <div class="d-flex flex-wrap gap-4 mb-4">
            <div>
              <span class="text-caption uppercase opacity-60 d-block">Vendidos hoy</span>
              <span class="font-weight-bold">{{ todayMenuStats.totalSold }} unidades</span>
            </div>
            <div>
              <span class="text-caption uppercase opacity-60 d-block">Ingresos estimados menú</span>
              <span class="font-weight-bold">Bs {{ todayMenuStats.estimatedRevenue.toLocaleString('es-BO') }}</span>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <v-chip v-for="item in todayMenuStats.topSold" :key="item.id" color="primary" variant="tonal" size="small">
              {{ item.name }} ({{ item.soldToday }})
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAnalyticsMetrics } from '../../composables/useAnalyticsMetrics';
import { useHorizontalScroll } from '../../composables/useHorizontalScroll';
import { getCategoryLabel } from '../../constants/dishCategories';
import { exportReportPdf } from '../../utils/exportReportPdf';
import CroppedImage from '../../components/common/CroppedImage.vue';

const periodOptions = [
  { label: 'Últimos 7 días', value: 7 },
  { label: 'Últimos 15 días', value: 15 },
  { label: 'Últimos 30 días', value: 30 },
];

const {
  periodDays,
  summary,
  dailyBreakdownChart,
  salesByCategory,
  topDishes,
  topCombos,
  peakHours,
  ordersByStatus,
  topClients,
  menuAlerts,
  todayMenuStats,
  unpaidPeriodOrders,
  activeOrders,
  starDish,
  reportSnapshot,
} = useAnalyticsMetrics(30);

const {
  containerRef: dailyScrollRef,
  canScrollLeft: dailyCanScrollLeft,
  canScrollRight: dailyCanScrollRight,
  scrollLeft: scrollDailyLeft,
  scrollRight: scrollDailyRight,
} = useHorizontalScroll([dailyBreakdownChart, periodDays]);

const {
  containerRef: peakScrollRef,
  canScrollLeft: peakCanScrollLeft,
  canScrollRight: peakCanScrollRight,
  scrollLeft: scrollPeakLeft,
  scrollRight: scrollPeakRight,
} = useHorizontalScroll([peakHours, periodDays]);

const snackbar = ref({ show: false, text: '', color: 'success' });

const hasAlerts = computed(() =>
  menuAlerts.value.soldOut.length > 0
  || menuAlerts.value.lowStock.length > 0
  || unpaidPeriodOrders.value.length > 0
  || activeOrders.value.length > 0
);

const maxCategoryRevenue = computed(() =>
  Math.max(...salesByCategory.value.map(c => c.revenue), 1)
);

function categoryPercent(revenue) {
  return Math.round((revenue / maxCategoryRevenue.value) * 100);
}

function handleExport() {
  try {
    exportReportPdf(reportSnapshot.value);
    snackbar.value = { show: true, text: 'Reporte PDF descargado.', color: 'success' };
  } catch {
    snackbar.value = { show: true, text: 'Error al generar el reporte.', color: 'error' };
  }
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

.bg-primary-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-container));
}

.bg-gradient-to-t-overlay {
  background: linear-gradient(to top, var(--primary), transparent);
}

.period-select {
  min-width: 200px;
  max-width: 220px;
}

.chart-scroll-wrapper {
  position: relative;
}

.chart-scroll-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.chart-scroll-nav--left {
  left: -4px;
}

.chart-scroll-nav--right {
  right: -4px;
}

.chart-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  scroll-behavior: smooth;
}

.chart-scroll__track {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  min-width: min-content;
  height: 12rem;
  padding: 0 8px;
}

.chart-scroll__item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.daily-chart__column {
  width: 40px;
}

.daily-chart__bar {
  width: 24px;
  background-color: rgb(var(--v-theme-primary));
  opacity: 0.75;
  transition: opacity 0.2s;
}

.daily-chart__bar--peak {
  opacity: 1;
}

.daily-chart__bar:hover {
  opacity: 1;
}

.daily-chart__label {
  margin-top: 12px;
  font-size: 11px;
  font-weight: 700;
  opacity: 0.6;
  line-height: 1;
}

.peak-hours-chart__column {
  width: 36px;
}

.peak-hours-chart__bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.peak-hours-chart__bar {
  width: 12px;
  border-radius: 4px 4px 0 0;
  opacity: 0.8;
}

.peak-hours-chart__bar--dining {
  background-color: rgb(var(--v-theme-primary));
}

.peak-hours-chart__bar--delivery {
  background-color: rgb(var(--v-theme-secondary));
}

.peak-hours-chart__label {
  margin-top: 12px;
  font-size: 10px;
  font-weight: 700;
  opacity: 0.5;
  line-height: 1;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--surface-container-high);
  border-radius: 10px;
}

.star-dish-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent 60%);
  pointer-events: none;
}

.star-dish-chip-wrap {
  position: absolute;
  bottom: 16px;
  left: 24px;
}
</style>
