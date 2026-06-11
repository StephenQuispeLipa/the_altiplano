<template>

  <v-layout class="app-layout">

    <v-app-bar app :elevation="0" class="glass-panel ghost-border-bottom px-4">

      <template #prepend>

        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" />

      </template>



      <v-toolbar-title class="font-headline text-primary font-weight-bold">

        The Altiplano

      </v-toolbar-title>



      <v-spacer />



      <v-menu min-width="200px" rounded>

        <template #activator="{ props }">

          <v-btn icon v-bind="props" class="ml-2">

            <v-avatar color="primary-container" size="32">

              <v-img :src="userAvatar" cover />

            </v-avatar>

          </v-btn>

        </template>

        <v-list class="surface-container-low">

          <v-list-item :title="authStore.currentRole" subtitle="Administrador">

            <template #prepend>

              <v-avatar color="primary" size="32">

                <span class="text-xs">JD</span>

              </v-avatar>

            </template>

          </v-list-item>

          <v-divider class="opacity-10" />

          <v-list-item

            prepend-icon="mdi-account-outline"

            title="Perfil"

            value="profile"

            :to="profileRoute"

          />

          <v-list-item

            prepend-icon="mdi-logout"

            title="Cerrar Sesión"

            value="logout"

            color="error"

            @click="logout"

          />

        </v-list>

      </v-menu>

    </v-app-bar>



    <AppSidebar v-model="drawer" @logout="logout" />



    <v-main class="app-main bg-surface">

      <v-overlay

        :model-value="isBootstrapping"

        class="align-center justify-center"

        persistent

        scrim="surface"

      >

        <v-progress-circular indeterminate color="primary" size="64" />

        <p class="text-center mt-4 font-weight-medium text-on-surface-variant">Cargando datos...</p>

      </v-overlay>



      <div v-if="bootstrapError" class="app-main__inner pa-4 pa-md-8">

        <v-alert type="error" variant="tonal" class="rounded-xl mb-4">

          {{ bootstrapError }}

        </v-alert>

        <v-btn color="primary" variant="flat" class="rounded-xl font-weight-bold" @click="handleRetry">

          Reintentar

        </v-btn>

      </div>



      <div v-else class="app-main__inner pa-4 pa-md-8">

        <router-view v-slot="{ Component }">

          <transition name="fade" mode="out-in">

            <component :is="Component" />

          </transition>

        </router-view>

      </div>

    </v-main>

  </v-layout>

</template>



<script setup>

import { ref, computed } from 'vue';

import { useAuthStore } from '../stores/useAuthStore';

import { useRouter } from 'vue-router';

import userAvatar from '../assets/user_default.webp';

import AppSidebar from '../components/layout/AppSidebar.vue';

import { resetAppData, resetAppDataInitialized, initAppData, setAppDataInitialized } from '../composables/useAppInit';

import { useAppBootstrap, retryBootstrap } from '../composables/useAppBootstrap';



const authStore = useAuthStore();

const router = useRouter();

const drawer = ref(true);

const { isBootstrapping, bootstrapError } = useAppBootstrap();



const profileRoute = computed(() => {

  if (authStore.currentRole === 'Admin') return '/admin/perfil';

  if (authStore.currentRole === 'Cliente') return '/client/perfil';

  if (authStore.currentRole === 'Camarero') return '/waiter/perfil';

  return undefined;

});



async function logout() {

  await authStore.logout();

  resetAppData();

  resetAppDataInitialized();

  router.push('/login');

}



async function handleRetry() {

  const ok = await retryBootstrap(async () => {

    resetAppData();

    await initAppData();

    setAppDataInitialized(true);

  });

  if (!ok) return;

}

</script>



<style scoped>

.app-layout {

  height: 100vh;

  min-height: 100vh;

}



.app-main {

  height: 100%;

  overflow-y: auto;

}



.ghost-border-bottom {

  border-bottom: 1px solid rgba(219, 193, 186, 0.15);

}



.fade-enter-active,

.fade-leave-active {

  transition: opacity 0.2s ease;

}



.fade-enter-from,

.fade-leave-to {

  opacity: 0;

}

</style>


