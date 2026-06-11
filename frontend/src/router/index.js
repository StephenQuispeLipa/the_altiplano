import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { getToken } from '../api/client'
import {
  initAppData,
  isAppDataInitialized,
  setAppDataInitialized,
  resetAppDataInitialized,
} from '../composables/useAppInit'
import {
  startBootstrap,
  finishBootstrap,
  failBootstrap,
} from '../composables/useAppBootstrap'

import LoginInterface from '../views/LoginInterface.vue'
import RegisterInterface from '../views/RegisterInterface.vue'
import AppLayout from '../views/AppLayout.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AnaliticasInterface from '../views/admin/AnaliticasInterface.vue'
import MenuInterface from '../views/admin/MenuInterface.vue'
import PlatillosInterface from '../views/admin/PlatillosInterface.vue'
import AdminPerfil from '../views/admin/AdminPerfil.vue'
import UsuariosInterface from '../views/admin/UsuariosInterface.vue'
import AccessLogsInterface from '../views/admin/AccessLogsInterface.vue'
import WaiterInterface from '../views/empleado/EmpleadoDashboard.vue'
import WaiterPedido from '../views/empleado/WaiterPedido.vue'
import EmpleadoPerfil from '../views/empleado/EmpleadoPerfil.vue'
import ClientInterface from '../views/cliente/ClienteDashboard.vue'
import ClientePerfil from '../views/cliente/ClientePerfil.vue'
import ClienteHistorial from '../views/cliente/ClienteHistorial.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginInterface
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterInterface
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '',
                    name: 'home',
                    redirect: () => {
                        const authStore = useAuthStore()
                        if (authStore.currentRole === 'Admin') return '/admin'
                        if (authStore.currentRole === 'Camarero') return '/waiter'
                        return '/client'
                    }
                },
                {
                    path: 'admin',
                    name: 'admin',
                    component: AdminDashboard
                },
                {
                    path: 'admin/analytics',
                    name: 'analytics',
                    component: AnaliticasInterface
                },
                {
                    path: 'admin/platillos',
                    name: 'platillos',
                    component: PlatillosInterface
                },
                {
                    path: 'admin/menu',
                    name: 'menu',
                    component: MenuInterface
                },
                {
                    path: 'admin/orders',
                    name: 'orders',
                    component: WaiterInterface
                },
                {
                    path: 'admin/perfil',
                    name: 'admin-perfil',
                    component: AdminPerfil
                },
                {
                    path: 'admin/usuarios',
                    name: 'admin-usuarios',
                    component: UsuariosInterface,
                    meta: { roles: ['Admin'] }
                },
                {
                    path: 'admin/access-logs',
                    name: 'admin-access-logs',
                    component: AccessLogsInterface,
                    meta: { roles: ['Admin'] }
                },
                {
                    path: 'waiter',
                    name: 'waiter',
                    component: WaiterInterface
                },
                {
                    path: 'waiter/pedido',
                    name: 'waiter-pedido',
                    component: WaiterPedido
                },
                {
                    path: 'waiter/perfil',
                    name: 'waiter-perfil',
                    component: EmpleadoPerfil
                },
                {
                    path: 'client',
                    name: 'client',
                    component: ClientInterface
                },
                {
                    path: 'client/perfil',
                    name: 'client-perfil',
                    component: ClientePerfil
                },
                {
                    path: 'client/historial',
                    name: 'client-historial',
                    component: ClienteHistorial
                }
            ]
        }
    ]
})

router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (to.name === 'login' || to.name === 'register') {
        if (getToken() && authStore.currentRole) {
            return { name: 'home' }
        }
        return true
    }

    if (!getToken()) {
        resetAppDataInitialized()
        return { name: 'login' }
    }

    if (!authStore.currentRole) {
        const ok = await authStore.fetchMe()
        if (!ok) {
            resetAppDataInitialized()
            return { name: 'login' }
        }
    }

    if (to.meta.roles && !to.meta.roles.includes(authStore.currentRole)) {
        return { name: 'home' }
    }

    if (!isAppDataInitialized()) {
        startBootstrap()
        try {
            await initAppData()
            setAppDataInitialized(true)
            finishBootstrap()
        } catch (err) {
            setAppDataInitialized(false)
            failBootstrap(err.message)
        }
    }
})

export default router
