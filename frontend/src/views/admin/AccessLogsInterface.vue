<template>
  <v-container fluid class="pa-0 animate-fade-in">
    <v-row align="center" class="mb-8">
      <v-col cols="12">
        <h2 class="font-headline text-h4 font-weight-bold text-primary">Log de acceso</h2>
        <p class="text-on-surface-variant text-body-2 mt-1 opacity-80">
          Registro de ingresos y salidas del sistema.
        </p>
      </v-col>
    </v-row>

    <v-card variant="flat" color="surface-container-low" class="rounded-xl pa-4 mb-6">
      <v-row dense>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.email"
            label="Buscar por email"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.event"
            :items="eventOptions"
            label="Evento"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.from"
            label="Desde"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.to"
            label="Hasta"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3" class="d-flex align-center gap-2">
          <v-btn color="primary" variant="flat" class="font-weight-bold" @click="loadLogs">
            Filtrar
          </v-btn>
          <v-btn variant="text" @click="clearFilters">Limpiar</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card variant="flat" color="surface-container-low" class="rounded-xl overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="logsStore.logs"
        :loading="logsStore.loading"
        :items-length="logsStore.total"
        class="font-body"
        hover
      >
        <template #item.event="{ item }">
          <v-chip
            size="small"
            :color="item.event === 'ingreso' ? 'success' : 'warning'"
            variant="flat"
          >
            {{ item.event }}
          </v-chip>
        </template>
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useAccessLogsStore } from '../../stores/useAccessLogsStore';

const logsStore = useAccessLogsStore();

const filters = reactive({
  email: '',
  event: null,
  from: '',
  to: '',
});

const eventOptions = [
  { title: 'Ingreso', value: 'ingreso' },
  { title: 'Salida', value: 'salida' },
];

const headers = [
  { title: 'Usuario', key: 'userEmail' },
  { title: 'Rol', key: 'userRole' },
  { title: 'IP', key: 'ipAddress' },
  { title: 'Navegador', key: 'browser' },
  { title: 'Evento', key: 'event' },
  { title: 'Fecha y hora', key: 'createdAt' },
];

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('es-BO');
}

function loadLogs() {
  logsStore.fetchLogs({
    email: filters.email || undefined,
    event: filters.event || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    limit: 100,
  });
}

function clearFilters() {
  filters.email = '';
  filters.event = null;
  filters.from = '';
  filters.to = '';
  loadLogs();
}

onMounted(loadLogs);
</script>
