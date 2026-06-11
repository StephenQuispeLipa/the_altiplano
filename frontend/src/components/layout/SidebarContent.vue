<template>
  <div class="sidebar-content">
    <div class="sidebar-content__brand pa-6">
      <div class="font-headline text-h6 text-primary leading-none">The Altiplano</div>
      <div class="text-caption font-weight-bold text-on-surface-variant uppercase tracking-wider mt-1">
        Gestión de Restaurante
      </div>
    </div>

    <v-list nav class="sidebar-content__nav pa-4 flex-grow-1">
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

    <div class="sidebar-content__footer pa-4">
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
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore';

defineEmits(['logout']);

const route = useRoute();
const authStore = useAuthStore();

const menuItems = computed(() => {
  if (authStore.currentRole === 'Admin') {
    return [
      { title: 'Panel de Control', icon: 'mdi-view-dashboard', to: '/admin' },
      { title: 'Pedidos', icon: 'mdi-receipt-text-outline', to: '/admin/orders' },
      { title: 'Menú', icon: 'mdi-silverware-variant', to: '/admin/menu' },
      { title: 'Analíticas', icon: 'mdi-chart-line', to: '/admin/analytics' },
      { title: 'Usuarios', icon: 'mdi-account-group', to: '/admin/usuarios' },
      { title: 'Log de acceso', icon: 'mdi-shield-key', to: '/admin/access-logs' },
    ];
  }
  if (authStore.currentRole === 'Camarero') {
    return [
      { title: 'Mi Trabajo', icon: 'mdi-clipboard-list-outline', to: '/waiter' },
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
.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
}

.sidebar-content__nav {
  overflow-y: auto;
  scrollbar-width: none;
}

.sidebar-content__nav::-webkit-scrollbar {
  display: none;
}
</style>
