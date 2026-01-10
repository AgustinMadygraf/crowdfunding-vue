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
      name: 'subscribe',
      component: () => import('../views/SubscribeView.vue'),
      meta: {
        title: 'Suscribirse - Madypack',
        description: 'Inicia tu suscripción al proyecto RKHA190'
      }
    },
    {
      path: '/subscribe/:token',
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
        description: 'Panel de usuario con tu historial de contribuciones'
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
    // {
    //   path: '/admin',
    //   name: 'admin',
    //   component: () => import('../views/AdminView.vue'),
    //   meta: {
    //     title: 'Administración - Madypack',
    //     description: 'Panel de administración (acceso restringido)',
    //     requiresAuth: true
    //   }
    // },
    // NOTE: v1.0 Sin backoffice admin. Para editar contenido, modificá src/infrastructure/mockData.ts y git push.
    // v2.0+ Implementar backoffice cuando sea necesario (20+ cambios/mes o contratar admin).
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
    ogUrl.setAttribute('content', `https://madypack.com.ar${to.path}`)
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
    twitterUrl.setAttribute('content', `https://madypack.com.ar${to.path}`)
  }
  
  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', `https://madypack.com.ar${to.path}`)
  
  // TODO: Implement auth check for requiresAuth routes
  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next({ name: 'home' })
  // } else {
  //   next()
  // }
  
  next()
})

export default router
