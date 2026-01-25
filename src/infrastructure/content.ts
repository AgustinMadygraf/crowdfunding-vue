/*
Path: src/infrastructure/content.ts
*/

import type { Content } from '@/domain/content';

export const content: Content = {
  app: {
    header: {
      navAriaLabel: 'Principal',
      logoAlt: 'Madygraf logo',
    },
    currencyLabel: 'ARS',
    navigation: {
      ariaLabel: 'Principal',
      logoAlt: 'Madygraf logo',
      links: [
        { label: 'Inicio', href: '/' },
        { label: 'Etapas', href: '/etapas' },
        { label: 'Actualizaciones', href: '/actualizaciones' },
        { label: 'Documentos', href: '/documentos' },
        { label: 'Suscribir', href: '/suscribir' },
      ],
      authLink: { label: 'Mi Dashboard', href: '/account' },
    },
    footer: {
      logo: {
        src: 'src/assets/logo.svg',
        alt: 'Madygraf logo',
        width: 80,
        text: 'Cooperativa de Trabajo Madygraf',
      },
      links: {
        title: 'Documentos',
        items: [
          { label: 'Términos y Condiciones', href: '#' },
          { label: 'Política de Privacidad', href: '#' },
          { label: 'Contacto', href: '#' },
        ],
      },
      contact: {
        title: 'Contacto',
        emailLabel: 'Email:',
        email: 'info@madypack.com.ar',
        social: [
          { label: 'Instagram', short: 'IG', href: '#', aria: 'Instagram' },
          { label: 'LinkedIn', short: 'LI', href: '#', aria: 'LinkedIn' },
        ],
      },
      copyright: '© 2025 Cooperativa de Trabajo Madygraf. Todos los derechos reservados.',
    },
  },
  auth: {
    google: {
      logoutLabel: 'Cerrar sesión',
      errors: {
        missingToken: 'No se recibió token de Google',
        unknownAuth: 'Error de autenticación desconocido',
        logoutFailed: 'Error al cerrar sesión',
        oauthConfig: 'Error al verificar configuración de Google OAuth',
        oauthMissing: 'Google OAuth no está configurado',
        oauthMissingDetails:
          'Google OAuth no está configurado. Por favor, configura VITE_GOOGLE_CLIENT_ID en el archivo .env',
        initFailed: 'Error al inicializar Google Sign-In. Ver consola para detalles.',
        initTimeout:
          'No se pudo cargar Google Sign-In. Verifica tu conexión a internet.',
        initUnexpected: 'Error inesperado al inicializar Google Sign-In',
        mountUnexpected: 'Error al inicializar el componente de autenticación',
      },
    },
  },
  home: {
    hero: {
      title: 'Financiemos juntxs la nueva capacidad productiva de Madygraf',
      subtitle: 'Tu aporte acelera la RKHA190. Seguís cada hito, ves el avance, recibís tu beneficio.',
      primaryLabel: 'Quiero aportar',
      secondaryLabel: 'Ver avance',
      secondaryHref: '#milestones',
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Qué es un bono con beneficio en especie?',
          answer:
            'Es un instrumento que permite apoyar el proyecto recibiendo a cambio un crédito de compra aplicable a productos y servicios de Madygraf.',
        },
        {
          question: '¿Cuál es la vigencia del beneficio?',
          answer: 'El crédito de compra tiene una vigencia de 12 meses desde la confirmación del aporte.',
        },
        {
          question: '¿Puedo transferir mi beneficio?',
          answer: 'Sí, el crédito de compra es transferible a terceros.',
        },
      ],
    },
    contribution: {
      title: 'Seleccioná tu nivel de aporte',
      subtitle: 'Bono fijo con beneficio en especie, transferible y con validez de 12 meses.',
      benefitLabel: '+{benefit}% crédito de compra',
      selectionTitle: 'Tu selección',
      selectionAmountLabel: 'Aporte:',
      selectionBenefitLabel: 'Beneficio:',
      continueLabel: 'Continuar',
      disclaimer:
        'Este programa constituye un crowdfunding productivo con beneficio en especie. No representa oferta pública de valores ni asesoramiento financiero. El beneficio es un crédito de compra con vigencia y condiciones publicadas.',
    },
    milestonesSection: {
      title: 'Avance por hitos',
      subtitle: 'Seguimiento transparente del proyecto en tiempo real.',
      summaryLabels: {
        progress: 'Progreso total:',
        raised: 'Recaudado:',
        target: 'Meta total:',
      },
    },
    milestoneCard: {
      labels: {
        target: 'Meta',
        raised: 'Recaudado',
        targetDate: 'Fecha objetivo',
      },
      viewDetailsLabel: 'Ver detalles →',
    },
    milestoneModal: {
      ariaLabelPrefix: 'Detalles:',
      closeLabel: 'Cerrar',
      progressTitle: 'Progreso de recaudación',
      timelineTitle: 'Hitos de progreso',
      evidencesTitle: 'Documentos y evidencias',
      responsibleTitle: 'Responsable',
      dependenciesTitle: 'Etapas previas',
      dependenciesPrefix: 'Esta etapa depende de:',
      statusLabels: {
        active: 'En progreso',
        pending: 'Pendiente',
        completed: 'Completada',
      },
      statsLabels: {
        target: 'Meta',
        raised: 'Recaudado',
        targetDate: 'Fecha objetivo',
        status: 'Estado',
      },
      footerLabels: {
        details: 'Ver detalles completos',
        close: 'Cerrar',
      },
    },
    updatesSection: {
      title: 'Actualizaciones quincenales',
      nextUpdateLabel: 'Próxima actualización:',
      nextUpdateDate: '21 de septiembre de 2025',
      placeholder: 'Aquí se mostrarán las actualizaciones quincenales del proyecto.',
    },
    updateCard: {
      categoryLabels: {
        comercial: 'Comercial',
        tecnico: 'Técnico',
        logistica: 'Logística',
        legal: 'Legal',
      },
      readMoreLabel: 'Leer más →',
    },
  },
  milestonesView: {
    heroTitle: 'Etapas del Proyecto',
    heroSubtitle:
      'Seguí el progreso de cada hito del proyecto RKHA190. Total recaudado:',
    heroAmountSeparator: 'de',
    evidencesTitle: 'Evidencias y Documentos',
    evidencesSubtitle:
      'Próximamente: acceso a evidencias públicas por etapa con versionado y checksums',
  },
  milestoneDetailView: {
    backLabel: '← Volver',
    infoTitle: 'Información general',
    detailsTitle: 'Descripción detallada',
    statusTitle: 'Estado del proyecto',
    statsLabels: {
      target: 'Meta de recaudación',
      raised: 'Recaudado hasta ahora',
      progress: 'Progreso',
      targetDate: 'Fecha objetivo',
      status: 'Estado actual',
    },
    timelineTitle: 'Línea de tiempo',
    evidencesTitle: 'Documentos y evidencias',
    responsibleTitle: 'Responsable',
    dependenciesTitle: 'Etapas previas requeridas',
    dependentsTitle: 'Etapas que dependen de esta',
    ctaTitle: '¿Quieres apoyar esta etapa?',
    ctaSubtitle: 'Ingresá con Google y elegí tu nivel de contribución.',
    ctaButton: 'Comenzar a contribuir',
    notFoundTitle: 'Etapa no encontrada',
    notFoundSubtitle: 'No pudimos encontrar la información de esta etapa.',
    notFoundCta: 'Volver al panel de etapas',
    statusLabels: {
      active: 'En progreso',
      pending: 'Pendiente',
      completed: 'Completada',
    },
  },
  updatesView: {
    heroTitle: 'Actualizaciones del Proyecto',
    heroSubtitle: 'Seguimiento transparente del progreso de la RKHA190',
    statsLabel: 'actualizaciones publicadas',
    categoryFilters: {
      all: 'Todas',
      comercial: 'Comercial',
      tecnico: 'Técnico',
      logistica: 'Logística',
      legal: 'Legal',
    },
    emptyState: 'No hay actualizaciones en esta categoría aún.',
    modalCloseLabel: 'Cerrar',
  },
  documentsView: {
    heroTitle: 'Repositorio de Documentos',
    heroSubtitle: 'Acceso público a toda la documentación del proyecto',
    loadingLabel: 'Cargando documentos...',
    retryLabel: 'Reintentar',
    errorFallback: 'Error al cargar documentos',
    emptyTitle: 'No hay documentos disponibles aún',
    emptySubtitle: 'Los documentos del proyecto aparecerán aquí una vez se publiquen.',
    downloadLabel: '↓ Descargar',
    uncategorizedLabel: 'Sin categoría',
    categoryOrder: ['Legal', 'Técnico', 'Comercial', 'Logística'],
  },
  subscribeView: {
    heroTitle: 'Iniciar Contribución',
    heroSubtitle: 'Apoya nuestro proyecto colaborando con nosotros',
    authModalTitle: 'Ingresá a tu cuenta',
    authModalSubtitle: 'Para continuar necesitás autenticarte con Google',
    authModalClose: '×',
    greetingLabel: 'Hola,',
    dashboardLink: 'Mi Dashboard',
    levelSelectedTitle: 'Nivel seleccionado',
    levelBenefitLabel: 'Beneficio:',
    changeLevelLabel: 'Cambiar nivel',
    levelSelectorTitle: 'Seleccioná tu nivel de aporte',
    authConfirmTitle: 'Autenticación y confirmación',
    authPrompt: 'Necesitás autenticarte para continuar',
    authPromptButton: 'Continuar con Google',
    submitLabel: 'Continuar al pago',
    submitLoadingLabel: 'Procesando...',
    successTitle: '✓ Contribución registrada',
    successSubtitle: '¡Excelente! Tu contribución ha sido registrada. Ahora procede con el pago.',
    summaryTitle: 'Resumen de tu contribución',
    summaryNameLabel: 'Nombre:',
    summaryEmailLabel: 'Email:',
    summaryLevelLabel: 'Nivel:',
    summaryAmountLabel: 'Monto:',
    payLabel: 'Ir a Pagar',
    payLoadingLabel: 'Redirigiendo...',
    payNote:
      'Serás redirigido a tu página de pago personalizada donde podrás completar la transacción.',
    errors: {
      loadPayment: 'Error al cargar Mercado Pago. Por favor, recarga la página.',
      missingLevel: 'Seleccioná un nivel de contribución para continuar',
      missingUser: 'Error: usuario no disponible',
      validationFailed: 'Validación fallida:',
      expiredSession: 'Sesión expirada. Por favor, cerrá sesión y volvé a ingresar.',
      forbidden: 'No tenés permisos para realizar esta acción.',
      serverError: 'Error del servidor. Por favor, intentá de nuevo más tarde.',
      createContribution: 'Error al crear contribución',
      unknownContribution: 'Error desconocido al procesar tu contribución',
      missingToken: 'Token de contribución no disponible',
      missingLevelPayment: 'Nivel no disponible',
      paymentInit: 'No se pudo iniciar el proceso de pago',
    },
  },
  subscribePaymentView: {
    headerTitle: 'Tu Página de Contribución',
    greetingLabel: 'Hola,',
    loadingLabel: 'Cargando información de tu contribución...',
    retryLabel: 'Reintentar',
    detailsTitle: 'Detalles de tu Contribución',
    statusLabels: {
      pendiente: 'Pendiente',
      procesando: 'Procesando',
      completado: 'Completado',
      fallido: 'Fallido',
      cancelado: 'Cancelado',
    },
    detailLabels: {
      level: 'Nivel:',
      amount: 'Monto:',
      created: 'Fecha de Creación:',
      completed: 'Pago Completado:',
      token: 'Token:',
    },
    payment: {
      pendingTitle: 'Completar Pago',
      pendingSubtitle: 'Tu pago aún está pendiente. Haz clic en el botón de abajo para continuar.',
      pendingButton: 'Ir a MercadoPago',
      processingTitle: 'Pago en Proceso',
      processingSubtitle: 'Tu pago se está procesando. Por favor espera.',
      processingButton: 'Actualizar Estado',
      completedTitle: '✓ Pago Completado',
      completedSubtitle: '¡Gracias por tu contribución! Tu pago se ha procesado correctamente.',
      completedNote: 'Recibirás un email de confirmación en breve.',
      failedTitle: '✖ Pago Fallido',
      failedSubtitle: 'Hubo un problema procesando tu pago. Por favor intenta de nuevo.',
      failedButton: 'Reintentar Pago',
      cancelledTitle: 'Pago Cancelado',
      cancelledSubtitle: 'Tu pago fue cancelado. Puedes reintentarlo si lo deseas.',
      cancelledButton: 'Reintenta tu Pago',
    },
    infoHelpTitle: '¿Necesitas ayuda?',
    infoHelpSubtitle:
      'Si tienes problemas completando tu pago, contáctanos a través del chat en la esquina inferior derecha.',
    notFoundLabel: 'No se encontró la contribución solicitada.',
    notFoundCta: '← Volver a suscripción',
    authInfoPrefix: 'Si eres el usuario registrado, puedes',
    authInfoLink: 'ir a tu dashboard',
    authInfoSuffix: 'para ver todas tus contribuciones.',
    errors: {
      emptyToken: 'Token de contribución inválido o vacío',
      loadContribution: 'No se pudo cargar la contribución',
      paymentInfo: 'No se pudo cargar la información de pago',
      paymentInit: 'Error al iniciar pago',
    },
  },
  subscriptionStatusView: {
    heroTitle: 'Estado de Contribución',
    idLabel: 'ID:',
    loadingLabel: 'Cargando información de tu contribución...',
    errorTitle: 'Error',
    retryLabel: 'Reintentar',
    backHomeLabel: 'Volver al inicio',
    statusTitle: 'Estado actual',
    detailLabels: {
      level: 'Nivel:',
      amount: 'Monto:',
      created: 'Fecha de creación:',
      completed: 'Completado:',
      token: 'Token:',
    },
    statusLabels: {
      pendiente: 'Pendiente',
      procesando: 'Procesando',
      completado: 'Completado',
      fallido: 'Fallido',
      cancelado: 'Cancelado',
    },
    explanationTitle: '¿Qué significa esto?',
    explanations: {
      pendiente:
        'Tu contribución está pendiente de pago. Por favor completa el proceso de pago para confirmar tu participación.',
      procesando:
        'Tu pago está siendo procesado. Este proceso puede tardar algunos minutos. Te notificaremos cuando se complete.',
      completado:
        '¡Felicitaciones! Tu contribución ha sido confirmada. Recibirás un email con los próximos pasos y detalles de tu participación en el proyecto.',
      fallido:
        'Lamentablemente tu pago no pudo ser procesado. Por favor intenta nuevamente o contacta a soporte para más información.',
      cancelado:
        'Tu contribución fue cancelada. Si deseas participar en el proyecto, puedes iniciar un nuevo proceso de contribución.',
    },
    actions: {
      completePayment: 'Completar Pago',
      refreshStatus: 'Actualizar Estado',
      contactSupport: 'Contactar soporte',
    },
    errors: { emptyId: 'ID de contribución inválido o vacío' },
  },
  userDashboardView: {
    title: 'Mi Dashboard',
    greetingLabel: 'Hola,',
    logoutLabel: 'Cerrar sesión',
    loadingLabel: 'Cargando tus contribuciones...',
    retryLabel: 'Reintentar',
    contributionsTitle: 'Mis Contribuciones',
    contributionsPrefix: 'Tienes',
    contributionsSingle: 'contribución',
    contributionsPlural: 'contribuciones',
    statusLabel: 'Estado del Pago:',
    completedAtLabel: 'Pago completado:',
    viewDetailsLabel: 'Ver Detalles',
    payLabel: 'Completar Pago',
    totalContributedLabel: 'Total Aportado:',
    completedPaymentsLabel: 'Pagos Completados:',
    pendingPaymentsLabel: 'Pagos Pendientes:',
    emptyTitle: 'Aún no tienes contribuciones',
    emptySubtitle: '¡Comienza tu primer aporte hoy!',
    emptyCta: 'Hacer una Contribución',
    newContributionLabel: '+ Nueva Contribución',
    statusLabels: {
      pendiente: '⏳ Pendiente',
      procesando: '🔄 Procesando',
      completado: '✔ Completado',
      fallido: '❌ Fallido',
      cancelado: '🛑 Cancelado',
    },
    errors: { userLoad: 'Error al obtener datos del usuario' },
  },
  adminView: {
    title: 'Panel de Administración',
    logoutLabel: 'Cerrar sesión',
    authRequired: 'Debes estar autenticado para acceder al panel administrativo.',
    authCta: 'Iniciar sesión',
    loadingLabel: 'Cargando datos...',
    retryLabel: 'Reintentar',
    tabDashboard: 'Dashboard',
    tabMilestones: 'Etapas',
    tabUpdates: 'Actualizaciones',
    statsTitles: {
      totalMilestones: 'Etapas totales',
      activeMilestones: 'Etapas activas',
      completedMilestones: 'Etapas completadas',
      totalUpdates: 'Actualizaciones',
      status: 'Estado',
    },
    statsLabels: {
      activeMilestones: 'activas',
      publishedUpdates: 'publicadas',
      statusOk: '✔ Online',
    },
    shortcutsTitle: 'Atajos rápidos',
    shortcuts: {
      milestones: 'Gestionar etapas',
      updates: 'Crear actualización',
      support: 'Contactar soporte',
    },
    milestonesTitle: 'Gestión de Etapas',
    milestonesEmpty: 'No hay etapas registradas',
    updatesTitle: 'Gestión de Actualizaciones',
    updatesEmpty: 'No hay actualizaciones registradas',
    milestoneLabels: {
      target: '🎯 Meta:',
      raised: '💰 Recaudado:',
    },
    updateLabels: {
      published: '✔ Publicado:',
    },
    errors: {
      loadData: 'Error al cargar datos administrativos',
      fetchAdmin: 'Error al obtener datos administrativos',
    },
  },
  notFoundView: {
    title: 'Página no encontrada',
    subtitle: 'La página que buscás no existe o fue movida.',
    cta: 'Volver al inicio',
  },
  data: {
    milestones: [
      {
        id: 1,
        name: 'Fortalecimiento comercial + línea base operativa',
        description:
          'Cerrar demanda y preparar el modelo operativo que libera horas de pegado manual y las convierte en más tiempo de máquina en producción.',
        details: `Propósito industrial
- El cuello de botella NO es confección de manijas (la máquina de manijas responde si se le exige).
- El cuello de botella ES el pegado MANUAL de manijas GRANDES.
- La nueva máquina automatiza el pegado de manijas GRANDES (manijas medianas/pequeñas seguirán con pegado manual).

KPI que queremos mover (base material del repago)
- Máquina confeccionadora de bolsas: ~44 bolsas/min cuando está en producción (máx anecdótico: 100 bolsas/min).
- Utilización/producción actual: ~2,5% del tiempo calendario (dato clave).
- Objetivo del proyecto: aumentar el tiempo operativo efectivo (más turnos / más horas productivas) al liberar horas de pegado manual de manija grande.

Modelo de cálculo (dejar armado para completar)
1) Relevar horas mensuales actuales:
   - H_bolsas_mes = horas/mes dedicadas a confección de bolsas
   - H_manijas_mes = horas/mes dedicadas a confección de manijas
   - H_pegado_grande_manual_mes = horas/mes dedicadas a pegado manual de manijas GRANDES
   - H_pegado_mediana_peq_manual_mes = horas/mes dedicadas a pegado manual manijas medianas/pequeñas (se mantiene)

2) Cambio con la nueva máquina:
   - H_pegado_grande_manual_mes se reduce y se reasigna a:
     a) más confección de bolsas
     b) más confección de manijas (si hiciera falta)
     c) operación de pegado automático (nueva máquina ~30–40 bolsas/min)

3) Resultado esperado:
   - ← disponibilidad/tiempo productivo real de la línea
   - ← producción y ventas de bolsas con manijas GRANDES
   - Base para devolver el préstamo (flujo incremental)

Entregables de esta etapa (evidencias públicas):
- Relevamiento de horas (planilla resumen)
- Proyección comercial (cartera/turnos/volúmenes) en versión pública
- Documento "criterios de avance" por etapa y qué evidencia se publica`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-02-05',
        status: 'active',
        responsible: 'Comercial + Producción',
        published: true,
        evidences: [
          {
            id: 101,
            title: 'Planilla de relevamiento de horas (versión pública)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-1/relevamiento-horas-v1.pdf',
            version: '1.0',
            publishedAt: '2026-01-10',
          },
          {
            id: 102,
            title:
              'Modelo operativo: reasignación de horas y KPI 2,5% (versión pública)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-1/modelo-operativo-kpi-v1.pdf',
            version: '1.0',
            publishedAt: '2026-01-10',
          },
          {
            id: 103,
            title: 'Criterios de avance por etapa + polí  tica de evidencias',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-1/criterios-avance-evidencias-v1.pdf',
            version: '1.0',
            publishedAt: '2026-01-10',
          },
        ],
        timeline: [
          {
            date: '2026-01-10',
            title: 'Definición del cuello de botella',
            description:
              'Se documenta que la restricción principal es el pegado manual de manijas GRANDES.',
            status: 'completed',
          },
          {
            date: '2026-01-20',
            title: 'Relevamiento de horas (baseline)',
            description:
              'Planilla de horas/mes por proceso: bolsas, manijas, pegado manual grande, pegado manual med/peq.',
            status: 'in-progress',
          },
          {
            date: '2026-02-05',
            title: 'Cierre de estrategia comercial + plan por turnos',
            description:
              'Se publican supuestos de demanda, plan de turnos y objetivos de disponibilidad para sostener el repago.',
            status: 'pending',
          },
        ],
      },
      {
        id: 2,
        name: 'Anticipo 30% máquina de pegado automático (manija grande)',
        description:
          'Pago de anticipo para iniciar fabricación/reserva de unidad de la máquina de pegado automático de manijas GRANDES.',
        details: `Qué se compra (describir con precisión técnica)
- Máquina: pegado automático de manijas GRANDES para bolsas de papel.
- Velocidad objetivo de operación: ~30–40 bolsas/min (según set-up / formato).
- Alcance: automatiza manija grande (mediana/pequeña sigue manual).

Criterio objetivo de etapa completada
- Orden de compra/contrato firmado (con datos sensibles omitidos en versión pública)
- Proforma Invoice / Invoice del proveedor
- Comprobante de pago del 30% (con datos sensibles ocultos)

Riesgos típicos y mitigación
- Riesgo: plazos del proveedor → Mitigación: contrato con hitos y penalidades/condiciones claras
- Riesgo: cambios de especificación → Mitigación: anexo técnico cerrado + aprobación interna`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-02-20',
        status: 'pending',
        dependencies: [1],
        responsible: 'Compras + Finanzas',
        published: true,
        evidences: [
          {
            id: 201,
            title: 'Anexo técnico máquina pegado manija grande (versión pública)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-2/anexo-tecnico-v1.pdf',
            version: '1.0',
            publishedAt: '2026-01-25',
          },
          {
            id: 202,
            title: 'Proforma Invoice (datos sensibles omitidos)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-2/proforma-v1.pdf',
            version: '1.0',
            publishedAt: '2026-02-01',
          },
          {
            id: 203,
            title: 'Comprobante anticipo 30% (datos sensibles omitidos)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-2/pago-anticipo-30-v1.pdf',
            version: '1.0',
            publishedAt: '2026-02-20',
          },
        ],
        timeline: [
          {
            date: '2026-02-01',
            title: 'Contrato y proforma listos',
            description: 'Contrato con hitos + proforma emitida por proveedor.',
            status: 'pending',
          },
          {
            date: '2026-02-20',
            title: 'Pago anticipo 30%',
            description: 'Transferencia ejecutada y evidencia publicada (redactada).',
            status: 'pending',
          },
        ],
      },
      {
        id: 3,
        name: 'Saldo 70% máquina + inspección final (FAT)',
        description:
          'Pago del 70% restante antes del embarque y validación técnica final del equipo.',
        details: `Criterio objetivo de etapa completada
- Informe de inspección FAT (Factory Acceptance Test) o evidencia equivalente
- Packing List + documentación de embarque preparada
- Comprobante de pago del saldo 70% (redactado)

Riesgos típicos y mitigación
- Riesgo: diferencias entre especificación y máquina real → Mitigación: checklist FAT + evidencia fotográfica/video
- Riesgo: plazos de fabricación → Mitigación: seguimiento semanal + hitos contractuales`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-03-20',
        status: 'pending',
        dependencies: [2],
        responsible: 'Técnica + Compras',
        published: true,
        evidences: [
          {
            id: 301,
            title: 'Checklist FAT + informe (versión pública)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-3/fat-informe-v1.pdf',
            version: '1.0',
            publishedAt: '2026-03-10',
          },
          {
            id: 302,
            title: 'Packing List / pre-embarque (datos sensibles omitidos)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-3/packing-list-v1.pdf',
            version: '1.0',
            publishedAt: '2026-03-15',
          },
          {
            id: 303,
            title: 'Comprobante pago saldo 70% (datos sensibles omitidos)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-3/pago-saldo-70-v1.pdf',
            version: '1.0',
            publishedAt: '2026-03-20',
          },
        ],
        timeline: [
          {
            date: '2026-03-10',
            title: 'Inspección FAT',
            description: 'Se valida funcionamiento y se documenta evidencia pública.',
            status: 'pending',
          },
          {
            date: '2026-03-20',
            title: 'Pago saldo 70%',
            description: 'Pago contra evidencia técnica y pre-embarque.',
            status: 'pending',
          },
        ],
      },
      {
        id: 4,
        name: 'Flete oceánico + seguro',
        description:
          'Contratación de transporte marítimo y seguro de carga hasta el puerto de destino.',
        details: `Criterio objetivo de etapa completada
- Booking confirmado
- Bill of Lading (BL) / documento de transporte (redactado)
- Póliza de seguro (redactada)

Riesgos y mitigación
- Riesgo: demora en tránsito / conexiones → Mitigación: forwarder con experiencia + buffer de cronograma
- Riesgo: daños de carga → Mitigación: embalaje + seguro cobertura adecuada`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-04-10',
        status: 'pending',
        dependencies: [3],
        responsible: 'Logística',
        published: true,
        evidences: [
          {
            id: 401,
            title: 'Booking / confirmación de embarque (redactado)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-4/booking-v1.pdf',
            version: '1.0',
            publishedAt: '2026-04-01',
          },
          {
            id: 402,
            title: 'Bill of Lading (BL) (datos sensibles omitidos)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-4/bl-v1.pdf',
            version: '1.0',
            publishedAt: '2026-04-10',
          },
          {
            id: 403,
            title: 'Póliza de seguro de carga (datos sensibles omitidos)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-4/seguro-carga-v1.pdf',
            version: '1.0',
            publishedAt: '2026-04-10',
          },
        ],
        timeline: [
          {
            date: '2026-04-01',
            title: 'Booking confirmado',
            description: 'Reserva de espacio y fecha de salida confirmadas.',
            status: 'pending',
          },
          {
            date: '2026-04-10',
            title: 'Documentación de transporte y seguro',
            description: 'BL y póliza publicados (redactados).',
            status: 'pending',
          },
        ],
      },
      {
        id: 5,
        name: 'Aduana + desaduanamiento',
        description:
          'Gestión aduanera, documentación y liberación de la máquina en el país.',
        details: `Criterio objetivo de etapa completada
- Documentación requerida completa (resumen público)
- Estado de despacho / liberación (resumen público)
- Comprobante de gastos/tasas clave (redactado)

Riesgos y mitigación
- Riesgo: demoras aduaneras → Mitigación: despachante con experiencia + documentación completa desde origen
- Riesgo: clasificación / costos inesperados → Mitigación: preclasificación + provisión de contingencia`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-05-05',
        status: 'pending',
        dependencies: [4],
        responsible: 'Comercio Exterior',
        published: true,
        evidences: [
          {
            id: 501,
            title: 'Checklist documentación aduanera (resumen público)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-5/checklist-aduana-v1.pdf',
            version: '1.0',
            publishedAt: '2026-04-20',
          },
          {
            id: 502,
            title: 'Estado de despacho / liberación (resumen público)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-5/estado-despacho-v1.pdf',
            version: '1.0',
            publishedAt: '2026-05-05',
          },
        ],
        timeline: [
          {
            date: '2026-04-20',
            title: 'Documentación lista para despacho',
            description: 'Resumen público de documentación y estado.',
            status: 'pending',
          },
          {
            date: '2026-05-05',
            title: 'Liberación aduanera',
            description: 'Se publica evidencia/resumen del libramiento.',
            status: 'pending',
          },
        ],
      },
      {
        id: 6,
        name: 'Instalación, montaje y puesta en marcha',
        description:
          'Montaje en planta, pruebas operativas, capacitación y arranque productivo del pegado automático de manija grande.',
        details: `Alcance industrial
- Instalación mecánica/eléctrica (y servicios industriales necesarios).
- Puesta en marcha con pruebas y parámetros base.
- Capacitación de operadores/mantenimiento.
- Primeras órdenes reales (cuando aplique).

Criterio objetivo de etapa completada
- Acta de instalación y puesta en marcha (resumen público)
- Evidencia de operación (video/fotos) y parámetros base
- Plan de mantenimiento preventivo + repuestos críticos (resumen público)

Riesgos y mitigación
- Riesgo: servicios industriales insuficientes → Mitigación: checklist de preinstalación y obra previa
- Riesgo: curva de aprendizaje → Mitigación: capacitación + SOP + acompañamiento inicial`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-06-10',
        status: 'pending',
        dependencies: [5],
        responsible: 'Producción + Mantenimiento',
        published: true,
        evidences: [
          {
            id: 601,
            title: 'Checklist de preinstalación (servicios industriales)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-6/preinstalacion-checklist-v1.pdf',
            version: '1.0',
            publishedAt: '2026-05-15',
          },
          {
            id: 602,
            title: 'Acta de puesta en marcha (resumen público)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-6/puesta-en-marcha-v1.pdf',
            version: '1.0',
            publishedAt: '2026-06-10',
          },
          {
            id: 603,
            title: 'SOP de operación + parámetros base (resumen público)',
            type: 'document',
            url: 'https://proyecto.madypack.com.ar/docs/etapa-6/sop-parametros-base-v1.pdf',
            version: '1.0',
            publishedAt: '2026-06-10',
          },
        ],
        timeline: [
          {
            date: '2026-05-15',
            title: 'Preinstalación',
            description: 'Checklist de servicios y preparación de área.',
            status: 'pending',
          },
          {
            date: '2026-06-10',
            title: 'Puesta en marcha',
            description: 'Pruebas, capacitación y arranque inicial.',
            status: 'pending',
          },
        ],
      },
    ],
    contributionLevels: [
      { amount: 50_000, benefit: 0, name: 'Aporte 50k' },
      { amount: 100_000, benefit: 0, name: 'Aporte 100k' },
      { amount: 250_000, benefit: 0, name: 'Aporte 250k' },
      { amount: 500_000, benefit: 0, name: 'Aporte 500k' },
      { amount: 1_000_000, benefit: 0, name: 'Aporte 1M' },
    ],
    updates: [
      {
        id: 1,
        category: 'comercial',
        title: 'Inicio del proyecto: automatizar el pegado de manijas GRANDES',
        excerpt:
          'El foco del proyecto es eliminar el cuello de botella del pegado manual de manijas grandes y aumentar el tiempo real de máquina en producción.',
        content: `Este proyecto incorpora una máquina de pegado automático de manijas GRANDES para bolsas de papel.

Hoy la restricción productiva no está en la confección de manijas (la máquina responde), sino en el pegado manual de manijas GRANDES, que consume horas críticas del proceso.

KPI base:
- Cuando la máquina de bolsas está produciendo, trabaja aprox. a 44 bolsas/min (máx anecdótico: 100 bolsas/min).
- Pero el dato clave es la utilización: sólo ~2,5% del tiempo calendario está en producción.

Con el pegado automático (30–40 bolsas/min), liberamos horas de pegado manual de manija grande y las reasignamos a más tiempo productivo de la línea, sosteniendo el flujo de ventas necesario para devolver el préstamo.
Publicaremos evidencias por etapa: documentos redactados (sin datos sensibles), checklist técnicos y avances verificables.`,
        status: 'published',
        publishedAt: '2026-01-10T12:00:00Z',
      },
      {
        id: 2,
        category: 'tecnico',
        title:
          'KPI y modelo de cálculo: cómo convertir horas liberadas en más producción',
        excerpt:
          'Publicamos el modelo de relevamiento de horas y el mecanismo de reasignación que explica el aumento de disponibilidad.',
        content: `Publicamos el modelo base para entender el impacto real de la automatización.

Variables a relevar (mensuales):
- Horas dedicadas a confección de bolsas
- Horas dedicadas a confección de manijas
- Horas dedicadas a pegado manual de manija GRANDE
- Horas dedicadas a pegado manual de manija mediana/pequeña (se mantiene)

La nueva máquina reduce el tiempo de pegado manual de manija grande y permite reasignar esas horas a más producción, elevando el porcentaje de tiempo real en producción (hoy ~2,5% del tiempo calendario).`,
        status: 'published',
        publishedAt: '2026-01-12T12:00:00Z',
      },
      {
        id: 3,
        category: 'logistica',
        title: 'Plan de importación por etapas: pagos, flete, aduana y montaje',
        excerpt:
          'El proyecto se ejecuta en etapas para que los desembolsos se alineen a hitos verificables y a evidencias públicas.',
        content: `Estructuramos el plan en 6 etapas:
1) Fortalecimiento comercial + línea base operativa
2) Anticipo 30% máquina
3) Saldo 70% + inspección final (FAT)
4) Flete oceánico + seguro
5) Aduana + desaduanamiento
6) Instalación y puesta en marcha

Cada etapa tendrá criterio de avance y evidencias públicas (documentos redactados sin datos sensibles).`,
        status: 'published',
        publishedAt: '2026-01-15T12:00:00Z',
      },
      {
        id: 4,
        category: 'legal',
        title:
          'Política de evidencias públicas: qué publicamos y qué datos se ocultan',
        excerpt:
          'Publicaremos comprobantes y documentación técnica redactada para transparencia sin exponer información sensible.',
        content: `Publicaremos evidencias por etapa (redactadas):
- Proformas, anexos técnicos, checklists FAT
- Documentos logísticos (BL/seguro) con datos sensibles omitidos
- Resúmenes de estado aduanero
- Actas de puesta en marcha y SOP de operación

No publicaremos datos sensibles (cuentas, datos personales, números completos de operación), pero sí evidencia suficiente para que el avance sea verificable.`,
        status: 'published',
        publishedAt: '2026-01-18T12:00:00Z',
      },
    ],
  },
};
