import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getAuthService } from '@/presentation/providers/authServiceProvider'


const getSiteOrigin = () => {
  const env = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim()
  if (env) {
    return env.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }
  return 'https://madypack.com.ar'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        title: 'Madypack - Portal Proyecto RKHA190',
        description: 'Crowdfunding para la adquisición de la rotativa RKHA190 por la Cooperativa Madygraf'
      }
    },
    {
      path: '/etapas',
      name: 'milestones',
      component: () => import('../views/MilestonesView.vue'),
      meta: {
        title: 'Etapas del Proyecto - Madypack',
        description: 'Panel completo de etapas del proyecto RKHA190 con evidencias y progreso'
      }
    },
    {
      path: '/etapas/:id',
      name: 'milestone-detail',
      component: () => import('../views/MilestoneDetailView.vue'),
      props: true,
      meta: {
        title: 'Etapa - Madypack',
        description: 'Detalle de la etapa del proyecto RKHA190'
      }
    },
    {
      path: '/actualizaciones',
      name: 'updates',
      component: () => import('../views/UpdatesView.vue'),
      meta: {
        title: 'Actualizaciones - Madypack',
        description: 'Últimas noticias y actualizaciones del proyecto RKHA190'
      }
    },
    {
      path: '/documentos',
      name: 'documents',
      component: () => import('../views/DocumentsView.vue'),
      meta: {
        title: 'Documentos - Madypack',
        description: 'Repositorio público de documentos del proyecto'
      }
    },
    {
      path: '/suscribir',
      alias: ['/subscribe'],
      name: 'subscribe',
      component: () => import('../views/SubscribeView.vue'),
      meta: {
        title: 'Suscribirse - Madypack',
        description: 'Inicia tu suscripción al proyecto RKHA190'
      }
    },
    {
      path: '/subscribe/:token',
      alias: ['/suscribir/:token', '/suscribir/pago/:token'],
      name: 'subscribe-payment',
      component: () => import('../views/SubscribePaymentView.vue'),
      meta: {
        title: 'Pagar Contribución - Madypack',
        description: 'Completa tu pago de contribución'
      }
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/UserDashboardView.vue'),
      meta: {
        title: 'Mi Cuenta - Madypack',
        description: 'Panel de usuario con tu historial de contribuciones',
        requiresAuth: true
      }
    },
    {
      path: '/suscribir/estado/:id',
      alias: ['/subscribe/status/:id'],
      name: 'subscription-status',
      component: () => import('../views/SubscriptionStatusView.vue'),
      meta: {
        title: 'Estado de Suscripción - Madypack',
        description: 'Consulta el estado de tu suscripción'
      }
    },
    // Ejemplo de ruta protegida por rol admin:
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: {
        title: 'Administración - Madypack',
        description: 'Panel de administración (acceso restringido)',
        requiresAuth: true,
        roles: ['admin'] // Solo usuarios con rol 'admin' pueden acceder
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: '404 - Página no encontrada',
        description: 'La página que buscas no existe'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard para meta tags y OpenGraph
router.beforeEach((to, _from, next) => {
  const siteOrigin = getSiteOrigin()
  // Update document title
  const title = (to.meta.title as string) || 'Madypack'
  document.title = title
  
  // Update meta description
  const description = (to.meta.description as string) || 'Portal de crowdfunding para la adquisición de la rotativa RKHA190'
  const descriptionMeta = document.querySelector('meta[name="description"]')
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', description)
  }
  
  // Update OpenGraph tags
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) {
    ogTitle.setAttribute('content', title)
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]')
  if (ogDescription) {
    ogDescription.setAttribute('content', description)
  }
  
  const ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) {
    ogUrl.setAttribute('content', `${siteOrigin}${to.path}`)
  }
  
  // Update Twitter tags
  const twitterTitle = document.querySelector('meta[property="twitter:title"]')
  if (twitterTitle) {
    twitterTitle.setAttribute('content', title)
  }
  
  const twitterDescription = document.querySelector('meta[property="twitter:description"]')
  if (twitterDescription) {
    twitterDescription.setAttribute('content', description)
  }
  
  const twitterUrl = document.querySelector('meta[property="twitter:url"]')
  if (twitterUrl) {
    twitterUrl.setAttribute('content', `${siteOrigin}${to.path}`)
  }
  
  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', `${siteOrigin}${to.path}`)
  

  // Auth guard centralizado: protege rutas con requiresAuth y roles
  const authStore = useAuthStore()
  const authService = getAuthService()
  const user = authStore.user
  // 1. Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    console.warn(`[Router] Acceso denegado a ${to.fullPath}: usuario no autenticado`)
    next('/suscribir')
    return
  }
  // 2. Rutas que requieren roles específicos (meta.roles: string[])
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const requiredRoles = to.meta.roles as import('@/domain/user').UserRole[];
    if (!user || !user.roles || !requiredRoles.some((role) => user.roles!.includes(role))) {
      console.warn(`[Router] Acceso denegado a ${to.fullPath}: requiere roles [${requiredRoles.join(', ')}]`)
      next('/') // o a una página de acceso denegado
      return
    }
  }

  next()
})

router.onError((error) => {
  console.error('Router error', error)
})

export default router
