<template>
  <v-navigation-drawer
    :model-value="modelValue"
    :permanent="mdAndUp"
    class="app-sidebar surface-container-low border-none"
    elevation="0"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="app-sidebar__inner">
      <div class="app-sidebar__brand pa-6">
        <div class="font-headline text-h6 text-primary leading-none">The Altiplano</div>
        <div class="text-caption font-weight-bold text-on-surface-variant uppercase tracking-wider mt-1">
          Gestión de Restaurante
        </div>
      </div>

      <v-list nav class="app-sidebar__nav pa-4 flex-grow-1">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          class="mb-1 rounded-lg"
          color="primary"
          :active="route.path === item.to"
        />
      </v-list>

      <div class="app-sidebar__footer pa-4">
        <v-list nav>
          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Ajustes"
            value="settings"
            class="rounded-lg"
            :to="settingsRoute"
            :active="settingsRoute && route.path === settingsRoute"
          />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar Sesión"
            value="logout"
            class="rounded-lg"
            @click="$emit('logout')"
          />
        </v-list>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useAuthStore } from '../../stores/useAuthStore';

defineProps({
  modelValue: { type: Boolean, default: true },
});

defineEmits(['update:modelValue', 'logout']);

const route = useRoute();
const authStore = useAuthStore();
const { mdAndUp } = useDisplay();

const menuItems = computed(() => {
  if (authStore.currentRole === 'Admin') {
    return [
      { title: 'Panel de Control', icon: 'mdi-view-dashboard', to: '/admin' },
      { title: 'Pedidos', icon: 'mdi-receipt-text-outline', to: '/admin/orders' },
      { title: 'Platillos', icon: 'mdi-food', to: '/admin/platillos' },
      { title: 'Menú', icon: 'mdi-silverware-variant', to: '/admin/menu' },
      { title: 'Analíticas', icon: 'mdi-chart-line', to: '/admin/analytics' },
    ];
  }
  if (authStore.currentRole === 'Camarero') {
    return [
      { title: 'Mi Trabajo', icon: 'mdi-clipboard-list-outline', to: '/waiter' },
      { title: 'Hacer Pedido', icon: 'mdi-silverware-fork-knife', to: '/waiter/pedido' },
      { title: 'Mi perfil', icon: 'mdi-account-outline', to: '/waiter/perfil' },
    ];
  }
  return [
    { title: 'Panel de Inicio', icon: 'mdi-home-outline', to: '/client' },
    { title: 'Mi perfil', icon: 'mdi-account-outline', to: '/client/perfil' },
    { title: 'Historial de Pedidos', icon: 'mdi-history', to: '/client/historial' },
  ];
});

const settingsRoute = computed(() => {
  if (authStore.currentRole === 'Admin') return '/admin/perfil';
  if (authStore.currentRole === 'Cliente') return '/client/perfil';
  if (authStore.currentRole === 'Camarero') return '/waiter/perfil';
  return undefined;
});
</script>

<style scoped>
.app-sidebar__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
}

.app-sidebar__nav {
  overflow-y: auto;
}

:deep(.v-navigation-drawer__content) {
  height: 100%;
  scrollbar-width: none;
}

:deep(.v-navigation-drawer__content::-webkit-scrollbar) {
  display: none;
}
</style>
