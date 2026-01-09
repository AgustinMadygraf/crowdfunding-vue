import { createRouter, createWebHistory } from 'vue-router'

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
      name: 'subscribe',
      component: () => import('../views/SubscribeView.vue'),
      meta: {
        title: 'Suscribirse - Madypack',
        description: 'Inicia tu suscripción al proyecto RKHA190'
      }
    },
    {
      path: '/suscribir/estado/:id',
      name: 'subscription-status',
      component: () => import('../views/SubscriptionStatusView.vue'),
      meta: {
        title: 'Estado de Suscripción - Madypack',
        description: 'Consulta el estado de tu suscripción'
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: {
        title: 'Administración - Madypack',
        description: 'Panel de administración (acceso restringido)',
        requiresAuth: true
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

// Navigation guard para meta tags
router.beforeEach((to, _from, next) => {
  // Update document title
  document.title = (to.meta.title as string) || 'Madypack'
  
  // Update meta description
  const descriptionMeta = document.querySelector('meta[name="description"]')
  if (descriptionMeta && to.meta.description) {
    descriptionMeta.setAttribute('content', to.meta.description as string)
  }
  
  // TODO: Implement auth check for requiresAuth routes
  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next({ name: 'home' })
  // } else {
  //   next()
  // }
  
  next()
})

export default router
