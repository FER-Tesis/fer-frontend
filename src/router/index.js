// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 🔹 Vistas existentes
import AgenteHome from '@/pages/AgenteHome.vue'
import SupervisorDashboard from '@/pages/SupervisorDashboard.vue'
import Login from '@/pages/Login.vue'

// 🔹 Vistas Admin
import AdminLayout from '@/pages/Admin/AdminLayout.vue'
import AdminLanding from '@/pages/Admin/AdminLanding.vue'
import AdminUsers from '@/pages/Admin/AdminUsers.vue'
import AdminCameras from '@/pages/Admin/AdminCameras.vue'

const routes = [
  // 🔸 Login (solo invitados)
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guestOnly: true }
  },

  // 🔸 Agente
  {
    path: '/',
    name: 'agent',
    component: AgenteHome,
    meta: { requiresAuth: true, role: 'agent' }
  },

  // 🔸 Supervisor
  {
    path: '/supervisor',
    name: 'supervisor',
    component: SupervisorDashboard,
    meta: { requiresAuth: true, role: 'supervisor' }
  },

  // 🔸 ADMIN – Solo la vista general usa el layout
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        name: 'admin.home',
        component: AdminLanding   // Aquí salen las 3 tarjetas del mockup
      }
    ]
  },

  // 🔸 ADMIN – Gestión de Usuarios (página completa, SIN layout)
  {
    path: '/admin/usuarios',
    name: 'admin.users',
    component: AdminUsers,
    meta: { requiresAuth: true, role: 'admin' }
  },

  // 🔸 ADMIN – Gestión de Cámaras (página completa, SIN layout)
  {
    path: '/admin/camaras',
    name: 'admin.cameras',
    component: AdminCameras,
    meta: { requiresAuth: true, role: 'admin' }
  },

  // 🔸 Cerrar sesión
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: async () => {
      const { useAuthStore } = await import('@/stores/auth.js')
      const auth = useAuthStore()
      auth.logout()
      return { name: 'login' }
    }
  },

  // 🔸 Cualquier otra ruta -> login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

// Crear router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔹 Guard Global (auth + rol + guestOnly)
router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/auth.js')
  const auth = useAuthStore()

  const isPrivate = !!to.meta?.requiresAuth
  const guestOnly = !!to.meta?.guestOnly
  const requiredRole = to.meta?.role

  // 1) Requiere login y no autenticado
  if (isPrivate && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 2) Intento de ir a /login estando autenticado → redirige por rol
  if (guestOnly && auth.isAuthenticated) {
    if (auth.role === 'admin') return { name: 'admin.home' }
    if (auth.role === 'supervisor') return { name: 'supervisor' }
    return { name: 'agent' }
  }

  // 3) Rol incorrecto para la ruta
  if (requiredRole && auth.isAuthenticated && auth.role !== requiredRole) {
    if (auth.role === 'admin') return { name: 'admin.home' }
    if (auth.role === 'supervisor') return { name: 'supervisor' }
    return { name: 'agent' }
  }

  return true
})

export default router
