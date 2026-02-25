/*
Path: src/infrastructure/content.ts
*/

import type { Content } from '@/domain/content';

// TODO: Confirmar y reemplazar correos/redes oficiales (hoy las fuentes públicas consultadas priorizan teléfono/Facebook).
export const content: Content = {
  app: {
    header: {
      navAriaLabel: 'Principal',
      logoAlt: 'Juegoteca Madygraf',
    },
    currencyLabel: 'ARS',
    navigation: {
      ariaLabel: 'Principal',
      logoAlt: 'Juegoteca Madygraf',
      links: [
        { label: 'Inicio', href: '/' },
        { label: 'Etapas', href: '/etapas' },
        { label: 'Actualizaciones', href: '/actualizaciones' },
        { label: 'Documentos', href: '/documentos' },
        { label: 'Aportar', href: '/suscribir' },
      ],
      authLink: { label: 'Mi Dashboard', href: '/account' },
    },
    footer: {
      logo: {
        src: 'src/assets/logo.svg',
        alt: 'Juegoteca Madygraf',
        width: 80,
        text: 'Juegoteca Multiedad · Cooperativa de Trabajo Madygraf',
      },
      links: {
        title: 'Información',
        items: [
          { label: 'Qué es la Juegoteca', href: '/#faq' },
          { label: 'Transparencia y evidencias', href: '/documentos' },
          { label: 'Etapas del plan', href: '/etapas' },
        ],
      },
      contact: {
        title: 'Contacto',
        emailLabel: 'Email:',
        email: 'juegoteca@madygraf.com',
        social: [
          { label: 'Instagram', short: 'IG', href: '#', aria: 'Instagram' },
          { label: 'Facebook', short: 'FB', href: '#', aria: 'Facebook' },
          { label: 'YouTube', short: 'YT', href: '#', aria: 'YouTube' },
        ],
      },
      copyright: '© 2026 Cooperativa de Trabajo Madygraf. Todos los derechos reservados.',
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
        initTimeout: 'No se pudo cargar Google Sign-In. Verifica tu conexión a internet.',
        initUnexpected: 'Error inesperado al inicializar Google Sign-In',
        mountUnexpected: 'Error al inicializar el componente de autenticación',
      },
    },
  },

  home: {
    hero: {
      title: 'Sostengamos la Juegoteca de Madygraf',
      subtitle:
        'Un espacio de cuidado, juego y aprendizaje dentro de la fábrica recuperada. Tu aporte sostiene horarios extendidos, talleres y mejores condiciones para las infancias.',
      primaryLabel: 'Quiero aportar',
      secondaryLabel: 'Ver etapas',
      secondaryHref: '#milestones',
    },

    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Qué es la Juegoteca de Madygraf?',
          answer:
            'Es un espacio multiedad de cuidado y aprendizaje dentro de la cooperativa Madygraf. Nació para garantizar el derecho al cuidado mientras lxs trabajadorxs sostienen la producción y la organización colectiva.',
        },
        {
          question: '¿A quiénes está destinada?',
          answer:
            'Principalmente a hijxs, nietxs y sobrinxs de trabajadorxs, con enfoque multiedad. En distintos períodos se describe participación desde edades muy tempranas hasta adolescencia.',
        },
        {
          question: '¿Por qué una campaña de crowdfunding?',
          answer:
            'Para sostener y mejorar el funcionamiento cotidiano: plantel, materiales pedagógicos, seguridad/infraestructura y talleres. El objetivo es depender menos de “parches” y construir un esquema transparente y verificable.',
        },
        {
          question: '¿Qué actividades se realizan?',
          answer:
            'Talleres y propuestas de juego, arte y cultura. Se mencionan experiencias como ajedrez, recreación, arte, literatura, folklore, cine y teatro; y también talleres de ESI y derechos de niñxs y adolescentes.',
        },
        {
          question: '¿Cómo se controla la transparencia?',
          answer:
            'Publicamos evidencias por etapa (documentos, fotos, links y reportes). Cuando haya datos sensibles, se publicará versión redactada, pero con trazabilidad suficiente para verificar avances.',
        },
        {
          question: '¿Mi aporte es una inversión?',
          answer:
            'No. Es un aporte solidario para sostener derechos y condiciones materiales. No otorga participación societaria ni rendimiento financiero.',
        },
        {
          question: '¿Puedo ayudar sin aportar dinero?',
          answer:
            'Sí: donación de materiales, colaboración en talleres, difusión y acompañamiento técnico (mantenimiento, seguridad, pintura, etc.).',
        },
      ],
    },

    contribution: {
      title: 'Elegí tu aporte solidario',
      subtitle:
        'Cada aporte sostiene cuidado cotidiano, materiales pedagógicos y talleres. El “impacto” es una equivalencia orientativa para visualizar destino social.',
      benefitLabel: 'Impacto estimado: {benefit} hora(s) de Juegoteca',
      selectionTitle: 'Tu selección',
      selectionAmountLabel: 'Aporte:',
      selectionBenefitLabel: 'Impacto:',
      continueLabel: 'Continuar',
      disclaimer:
        'Este programa constituye un crowdfunding solidario orientado a sostener un espacio comunitario de cuidado y aprendizaje. No representa oferta pública de valores ni asesoramiento financiero. Publicaremos evidencias por etapa para seguimiento colectivo.',
    },

    milestonesSection: {
      title: 'Etapas del plan',
      subtitle: 'Un roadmap concreto, con criterios de avance y evidencias públicas.',
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
      timelineTitle: 'Línea de tiempo',
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
      title: 'Actualizaciones',
      nextUpdateLabel: 'Próxima actualización:',
      nextUpdateDate: '15 de febrero de 2026',
      placeholder:
        'Publicaremos avances, compras, mejoras realizadas y aprendizajes del proceso (con evidencias).',
    },

    updateCard: {
      categoryLabels: {
        general: 'General',
        tecnico: 'Pedagógico / Técnico',
        logistica: 'Infraestructura / Logística',
        legal: 'Legal / Institucional',
        comercial: 'Comunidad / Difusión',
      },
      readMoreLabel: 'Leer más →',
    },
  },

  milestonesView: {
    heroTitle: 'Etapas de fortalecimiento',
    heroSubtitle:
      'Seguí el progreso de cada etapa del plan. Total recaudado:',
    heroAmountSeparator: 'de',
    evidencesTitle: 'Evidencias públicas',
    evidencesSubtitle:
      'Documentos, notas, reportes y registros que permiten verificar avances (con redacción cuando haya datos sensibles).',
  },

  milestoneDetailView: {
    backLabel: '← Volver',
    infoTitle: 'Información general',
    detailsTitle: 'Descripción detallada',
    statusTitle: 'Estado del plan',
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
    ctaTitle: '¿Querés apoyar esta etapa?',
    ctaSubtitle: 'Ingresá con Google y elegí tu aporte.',
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
    heroTitle: 'Actualizaciones',
    heroSubtitle: 'Novedades y reportes del plan de sostenimiento de la Juegoteca',
    statsLabel: 'actualizaciones publicadas',
    categoryFilters: {
      all: 'Todas',
      general: 'General',
      tecnico: 'Pedagógico / Técnico',
      logistica: 'Infraestructura / Logística',
      legal: 'Legal / Institucional',
      comercial: 'Comunidad / Difusión',
    },
    emptyState: 'No hay actualizaciones en esta categoría aún.',
    modalCloseLabel: 'Cerrar',
  },

  documentsView: {
    heroTitle: 'Repositorio de documentos',
    heroSubtitle: 'Acceso público a documentación y evidencias vinculadas a la Juegoteca y a la campaña',
    loadingLabel: 'Cargando documentos...',
    retryLabel: 'Reintentar',
    errorFallback: 'Error al cargar documentos',
    emptyTitle: 'No hay documentos disponibles aún',
    emptySubtitle: 'Los documentos aparecerán aquí a medida que se publiquen evidencias por etapa.',
    downloadLabel: 'Descargar',
    uncategorizedLabel: 'Sin categoría',
    categoryOrder: ['Institucional', 'Pedagógico', 'Infraestructura', 'Finanzas', 'Legal', 'Prensa'],
  },

  subscribeView: {
    heroTitle: 'Aportar',
    heroSubtitle: 'Sumate a sostener la Juegoteca con un aporte solidario',
    authModalTitle: 'Ingresá a tu cuenta',
    authModalSubtitle: 'Para continuar necesitás autenticarte con Google',
    authModalClose: '×',
    greetingLabel: 'Hola,',
    dashboardLink: 'Mi Dashboard',
    levelSelectedTitle: 'Aporte seleccionado',
    levelBenefitLabel: 'Impacto:',
    changeLevelLabel: 'Cambiar aporte',
    levelSelectorTitle: 'Seleccioná tu aporte',
    authConfirmTitle: 'Autenticación y confirmación',
    authPrompt: 'Necesitás autenticarte para continuar',
    authPromptButton: 'Continuar con Google',
    submitLabel: 'Continuar al pago',
    submitLoadingLabel: 'Procesando...',
    successTitle: '✓ Aporte registrado',
    successSubtitle: '¡Gracias! Tu aporte fue registrado. Ahora podés completar el pago.',
    summaryTitle: 'Resumen',
    summaryNameLabel: 'Nombre:',
    summaryEmailLabel: 'Email:',
    summaryLevelLabel: 'Aporte:',
    summaryAmountLabel: 'Monto:',
    payLabel: 'Ir a pagar',
    payLoadingLabel: 'Redirigiendo...',
    payNote:
      'Serás redirigido a tu página de pago personalizada para completar la transacción.',
    errors: {
      loadPayment: 'Error al cargar Mercado Pago. Por favor, recargá la página.',
      missingLevel: 'Seleccioná un aporte para continuar',
      missingUser: 'Error: usuario no disponible',
      validationFailed: 'Validación fallida:',
      expiredSession: 'Sesión expirada. Cerrá sesión y volvé a ingresar.',
      forbidden: 'No tenés permisos para realizar esta acción.',
      serverError: 'Error del servidor. Intentá más tarde.',
      createContribution: 'Error al crear el aporte',
      unknownContribution: 'Error desconocido al procesar tu aporte',
      missingToken: 'Token de aporte no disponible',
      missingLevelPayment: 'Aporte no disponible',
      paymentInit: 'No se pudo iniciar el pago',
    },
  },

  subscribePaymentView: {
    headerTitle: 'Tu aporte',
    greetingLabel: 'Hola,',
    loadingLabel: 'Cargando información de tu aporte...',
    retryLabel: 'Reintentar',
    detailsTitle: 'Detalles',
    statusLabels: {
      pendiente: 'Pendiente',
      procesando: 'Procesando',
      completado: 'Completado',
      fallido: 'Fallido',
      cancelado: 'Cancelado',
    },
    detailLabels: {
      level: 'Aporte:',
      amount: 'Monto:',
      created: 'Creado:',
      completed: 'Completado:',
      token: 'Token:',
    },
    payment: {
      pendingTitle: 'Completar pago',
      pendingSubtitle: 'Tu pago está pendiente. Hacé clic para continuar.',
      pendingButton: 'Ir a Mercado Pago',
      processingTitle: 'Pago en proceso',
      processingSubtitle: 'Tu pago se está procesando. Puede tardar unos minutos.',
      processingButton: 'Actualizar estado',
      completedTitle: '✓ Pago completado',
      completedSubtitle: '¡Gracias por tu aporte! El pago se procesó correctamente.',
      completedNote: 'Publicaremos evidencias y actualizaciones del uso de fondos por etapas.',
      failedTitle: '✖ Pago fallido',
      failedSubtitle: 'Hubo un problema procesando el pago. Intentá nuevamente.',
      failedButton: 'Reintentar pago',
      cancelledTitle: 'Pago cancelado',
      cancelledSubtitle: 'El pago fue cancelado. Podés reintentarlo si querés.',
      cancelledButton: 'Reintentar pago',
    },
    infoHelpTitle: '¿Necesitás ayuda?',
    infoHelpSubtitle:
      'Si tenés problemas con el pago, contactanos desde el chat o por los canales publicados.',
    notFoundLabel: 'No se encontró el aporte solicitado.',
    notFoundCta: '← Volver',
    authInfoPrefix: 'Si sos el usuario registrado, podés',
    authInfoLink: 'ir a tu dashboard',
    authInfoSuffix: 'para ver tus aportes.',
    errors: {
      emptyToken: 'Token inválido o vacío',
      loadContribution: 'No se pudo cargar el aporte',
      paymentInfo: 'No se pudo cargar la información de pago',
      paymentInit: 'Error al iniciar pago',
    },
  },

  subscriptionStatusView: {
    heroTitle: 'Estado del aporte',
    idLabel: 'ID:',
    loadingLabel: 'Cargando información...',
    errorTitle: 'Error',
    retryLabel: 'Reintentar',
    backHomeLabel: 'Volver al inicio',
    statusTitle: 'Estado actual',
    detailLabels: {
      level: 'Aporte:',
      amount: 'Monto:',
      created: 'Creado:',
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
    explanationTitle: '¿Qué significa?',
    explanations: {
      pendiente:
        'Tu aporte está registrado pero falta completar el pago. Podés continuarlo desde el botón.',
      procesando:
        'El pago está en proceso. Actualizá el estado en unos minutos.',
      completado:
        '¡Gracias! Tu aporte quedó confirmado. Vas a ver el seguimiento de etapas y evidencias públicas.',
      fallido:
        'El pago no pudo procesarse. Podés reintentar o pedir soporte.',
      cancelado:
        'El pago fue cancelado. Si querés, podés iniciar un nuevo aporte.',
    },
    actions: {
      completePayment: 'Completar pago',
      refreshStatus: 'Actualizar estado',
      contactSupport: 'Contactar soporte',
    },
    errors: { emptyId: 'ID inválido o vacío' },
  },

  userDashboardView: {
    title: 'Mi Dashboard',
    greetingLabel: 'Hola,',
    logoutLabel: 'Cerrar sesión',
    loadingLabel: 'Cargando tus aportes...',
    retryLabel: 'Reintentar',
    contributionsTitle: 'Mis aportes',
    contributionsPrefix: 'Tenés',
    contributionsSingle: 'aporte',
    contributionsPlural: 'aportes',
    statusLabel: 'Estado del pago:',
    completedAtLabel: 'Completado:',
    viewDetailsLabel: 'Ver detalles',
    payLabel: 'Completar pago',
    totalContributedLabel: 'Total aportado:',
    completedPaymentsLabel: 'Pagos completados:',
    pendingPaymentsLabel: 'Pagos pendientes:',
    emptyTitle: 'Aún no tenés aportes',
    emptySubtitle: 'Sumate para sostener la Juegoteca.',
    emptyCta: 'Hacer un aporte',
    newContributionLabel: '+ Nuevo aporte',
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
    title: 'Panel de administración',
    logoutLabel: 'Cerrar sesión',
    authRequired: 'Debés estar autenticado para acceder al panel.',
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
    shortcutsTitle: 'Atajos',
    shortcuts: {
      milestones: 'Gestionar etapas',
      updates: 'Crear actualización',
      support: 'Contacto/Soporte',
    },
    milestonesTitle: 'Gestión de etapas',
    milestonesEmpty: 'No hay etapas registradas',
    updatesTitle: 'Gestión de actualizaciones',
    updatesEmpty: 'No hay actualizaciones registradas',
    milestoneLabels: {
      target: '🎯 Meta:',
      raised: '💰 Recaudado:',
    },
    updateLabels: {
      published: '✔ Publicado:',
    },
    errors: {
      loadData: 'Error al cargar datos',
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
        name: 'Sostén operativo: horarios, plantel y cuidado cotidiano',
        description:
          'Asegurar continuidad del espacio: acompañamiento diario, coordinación y presencia educativa.',
        details: `Objetivo
- Sostener el funcionamiento cotidiano de la Juegoteca como derecho y como condición material de la gestión obrera.
- Priorizar cobertura en franjas críticas (turnos) y capacidad de respuesta ante contingencias.

Qué financia esta etapa (ejemplos)
- Coordinación / planificación pedagógica.
- Horas de acompañamiento educativo.
- Insumos básicos de funcionamiento (higiene, limpieza, botiquín, etc.).
- Fondo mínimo para reemplazos / urgencias.

Criterio de avance (evidencias públicas)
- Nómina de roles (sin datos sensibles) + esquema horario.
- Reporte mensual de actividad (cantidades, talleres realizados, mejoras).
- Registro de compras esenciales (ticket/factura redactada cuando corresponda).`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-03-01',
        status: 'active',
        responsible: 'Comisión de Juegoteca + Cooperativa Madygraf',
        published: true,
        evidences: [
          {
            id: 101,
            title: 'Inauguración de la Juegoteca (contexto histórico)',
            type: 'link',
            url: 'https://www.laizquierdadiario.com/Se-inauguro-la-juegoteca-de-MadyGraf',
            publishedAt: '2016-05-26',
            description: 'Nota de inauguración (25/05/2016) y funcionamiento inicial.',
          },
          {
            id: 102,
            title: 'Juegoteca como sostén de la organización (nota 2017)',
            type: 'link',
            url: 'https://www.laizquierdadiario.com/MadyGraf-con-lucha-y-organizacion-pusimos-en-pie-nuestra-juegoteca',
            publishedAt: '2017-05-17',
            description: 'Describe multiedad, actividades y plan de apertura ampliada.',
          },
        ],
        timeline: [
          {
            date: '2026-02-01',
            title: 'Publicación de esquema de roles y horarios',
            description: 'Se publica la matriz de roles/horas (sin datos sensibles).',
            status: 'in-progress',
          },
          {
            date: '2026-02-15',
            title: 'Reporte mensual N°1',
            description: 'Se publica el primer reporte mensual de actividad y compras esenciales.',
            status: 'pending',
          },
          {
            date: '2026-03-01',
            title: 'Revisión y ajuste operativo',
            description: 'Ajuste de cobertura y prioridades según evidencia del primer mes.',
            status: 'pending',
          },
        ],
      },

      {
        id: 2,
        name: 'Infraestructura y seguridad del espacio',
        description:
          'Mejoras edilicias, seguridad e higiene para sostener un espacio cuidado y apto para infancias.',
        details: `Objetivo
- Acondicionar el espacio (pintura, iluminación, ventilación/calefacción si aplica).
- Señalética y seguridad (matafuegos, botiquín, salidas, organización del espacio).
- Mobiliario básico seguro y funcional.

Criterio de avance (evidencias públicas)
- Checklist técnico de mejoras + fotos antes/después.
- Presupuestos comparados (versión pública) y comprobantes redactados.`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-04-01',
        status: 'pending',
        dependencies: [1],
        responsible: 'Mantenimiento + Comisión de Juegoteca',
        published: true,
        evidences: [
          {
            id: 201,
            title: 'Proyecto/planilla: mejoras de infraestructura (plantilla pública)',
            type: 'document',
            url: 'https://juegoteca.madygraf.com/docs/etapa-2/plan-infraestructura-v1.pdf',
            version: '1.0',
            publishedAt: '2026-02-05',
          },
        ],
        timeline: [
          {
            date: '2026-02-10',
            title: 'Relevamiento y checklist de seguridad',
            description: 'Se releva estado actual y se define priorización de mejoras.',
            status: 'pending',
          },
          {
            date: '2026-03-10',
            title: 'Ejecución de mejoras críticas',
            description: 'Se ejecutan mejoras críticas y se publica evidencia fotográfica.',
            status: 'pending',
          },
          {
            date: '2026-04-01',
            title: 'Cierre de etapa',
            description: 'Checklist final + comprobantes redactados.',
            status: 'pending',
          },
        ],
      },

      {
        id: 3,
        name: 'Materiales pedagógicos y biblioteca lúdica',
        description:
          'Compra y reposición de materiales: juegos, libros, recursos didácticos y artísticos.',
        details: `Objetivo
- Fortalecer propuestas pedagógicas y de juego.
- Reposición por desgaste y ampliación por edades.

Qué puede incluir
- Juegos de mesa/cooperativos, material de arte, libros infantiles/juveniles.
- Material para talleres (cine/teatro/folklore, etc.) según planificación.

Criterio de avance
- Listado público de compras por rubro + evidencia (facturas redactadas cuando aplique).
- Registro de implementación (talleres realizados + uso).`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-05-01',
        status: 'pending',
        dependencies: [1],
        responsible: 'Equipo educativo + Comisión de Juegoteca',
        published: true,
        evidences: [
          {
            id: 301,
            title: 'Talleres y enfoque pedagógico (ESI, derechos y talleres)',
            type: 'document',
            url: 'https://cehti.org/wp-content/uploads/2021/03/Mujeres-trabajadoras.pdf',
            publishedAt: '2021-03-01',
            description:
              'Referencia sobre talleres, ESI y formalización del sector (fuente académica/compilación).',
          },
        ],
        timeline: [
          {
            date: '2026-03-05',
            title: 'Curaduría y lista pública de compras',
            description: 'Se publica lista por edades/rubros con criterios pedagógicos.',
            status: 'pending',
          },
          {
            date: '2026-04-10',
            title: 'Compra y puesta en uso',
            description: 'Ingreso de materiales y registro de implementación en talleres.',
            status: 'pending',
          },
          {
            date: '2026-05-01',
            title: 'Reporte de resultados',
            description: 'Se publica reporte con evidencias de uso y ajustes.',
            status: 'pending',
          },
        ],
      },

      {
        id: 4,
        name: 'Bienestar: alimentación y acompañamiento cotidiano',
        description:
          'Fortalecer condiciones materiales para sostener largas franjas horarias (meriendas/insumos básicos).',
        details: `Objetivo
- Acompañar el sostenimiento cotidiano cuando hay jornadas extendidas.
- Garantizar insumos básicos (alimentación, higiene, etc.) según esquema de funcionamiento.

Criterio de avance
- Reporte mensual de compras por rubro (versión pública).
- Evidencia del esquema de provisión (sin datos sensibles).`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-06-01',
        status: 'pending',
        dependencies: [1],
        responsible: 'Comisión de Juegoteca + Cooperativa',
        published: true,
        evidences: [
          {
            id: 401,
            title: 'Documento institucional (referencia sobre horario extendido)',
            type: 'document',
            url: 'https://www.unpaz.edu.ar/sites/default/files/2022-05/Reso%20CS%2008-2022.pdf',
            publishedAt: '2022-05-01',
            description: 'Referencia institucional donde se describe el espacio y su funcionamiento.',
          },
        ],
        timeline: [
          {
            date: '2026-04-01',
            title: 'Definición del esquema de provisión',
            description: 'Se define el esquema mínimo y se publica el criterio.',
            status: 'pending',
          },
          {
            date: '2026-05-01',
            title: 'Primer reporte mensual',
            description: 'Reporte público de rubros y evidencias (redactadas).',
            status: 'pending',
          },
          {
            date: '2026-06-01',
            title: 'Ajuste por demanda real',
            description: 'Ajuste del esquema según uso observado.',
            status: 'pending',
          },
        ],
      },

      {
        id: 5,
        name: 'Talleres y comunidad: continuidad cultural y educativa',
        description:
          'Sostener y ampliar talleres (arte, ajedrez, cine/teatro, folklore) y articulaciones educativas.',
        details: `Objetivo
- Sostener talleres y propuestas culturales.
- Articular con instituciones educativas (prácticas, voluntariados, etc.) cuando corresponda.

Criterio de avance
- Calendario de talleres publicado.
- Registro de actividades (fotos/videos con permisos cuando aplique) + reportes.`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-07-01',
        status: 'pending',
        dependencies: [1, 3],
        responsible: 'Equipo educativo + redes solidarias',
        published: true,
        evidences: [
          {
            id: 501,
            title: 'Nota 2017: actividades y talleres (multiedad)',
            type: 'link',
            url: 'https://www.laizquierdadiario.com/MadyGraf-con-lucha-y-organizacion-pusimos-en-pie-nuestra-juegoteca',
            publishedAt: '2017-05-17',
          },
          {
            id: 502,
            title: 'Dossier 2022: derechos de las infancias y recorrido',
            type: 'link',
            url: 'https://www.laizquierdadiario.com/Juegoteca-Madygraf-luchar-y-garantizar-derechos-para-las-infancias',
            publishedAt: '2022-08-12',
          },
        ],
        timeline: [
          {
            date: '2026-05-15',
            title: 'Publicación de calendario trimestral',
            description: 'Se publica un calendario de talleres y responsables.',
            status: 'pending',
          },
          {
            date: '2026-06-15',
            title: 'Ejecución + evidencias',
            description: 'Se publican registros y un reporte de participación.',
            status: 'pending',
          },
          {
            date: '2026-07-01',
            title: 'Evaluación y mejora',
            description: 'Ajuste del diseño de talleres según resultados.',
            status: 'pending',
          },
        ],
      },

      {
        id: 6,
        name: 'Transparencia: repositorio y política de evidencias',
        description:
          'Estandarizar qué se publica y cómo, para que cualquiera pueda verificar avances sin exponer datos sensibles.',
        details: `Objetivo
- Publicar criterios claros: qué evidencia se publica por etapa y qué se redacta.
- Mantener repositorio ordenado por categorías: institucional, pedagógico, finanzas, infraestructura, prensa.

Criterio de avance
- Documento “Política de evidencias” publicado.
- Estructura de carpetas + index público de documentos.`,
        targetAmount: 0,
        raisedAmount: 0,
        targetDate: '2026-02-20',
        status: 'pending',
        dependencies: [1],
        responsible: 'Equipo técnico + Comisión de Juegoteca',
        published: true,
        evidences: [
          {
            id: 601,
            title: 'Planificación 2014: por qué una juegoteca en Madygraf',
            type: 'link',
            url: 'https://www.laizquierdadiario.com/Una-juegoteca-en-MadyGraf-bajo-control-obrero',
            publishedAt: '2014-12-01',
          },
          {
            id: 602,
            title: 'Lavaca: dimensión de género y transformación del espacio',
            type: 'link',
            url: 'https://lavaca.org/mu205/modo-madygraf-la-ex-atlantida-hoy-recuperada-y-recien-expropiada/',
            publishedAt: '2025-01-01',
          },
        ],
        timeline: [
          {
            date: '2026-02-05',
            title: 'Documento de política de evidencias',
            description: 'Se publica versión 1.0 con criterios y redacción de sensibles.',
            status: 'pending',
          },
          {
            date: '2026-02-20',
            title: 'Repositorio ordenado + index',
            description: 'Se publica estructura y listados por categoría.',
            status: 'pending',
          },
        ],
      },
    ],

    contributionLevels: [
      { amount: 5_000, benefit: 1, name: 'Aporte 5k' },
      { amount: 10_000, benefit: 2, name: 'Aporte 10k' },
      { amount: 25_000, benefit: 5, name: 'Aporte 25k' },
      { amount: 50_000, benefit: 10, name: 'Aporte 50k' },
      { amount: 100_000, benefit: 20, name: 'Aporte 100k' },
      { amount: 250_000, benefit: 50, name: 'Aporte 250k' },
    ],

    updates: [
      {
        id: 1,
        category: 'general',
        title: 'Por qué existe una Juegoteca dentro de una fábrica recuperada',
        excerpt:
          'La Juegoteca nace como respuesta material al derecho al cuidado y a la necesidad de sostener organización colectiva en la gestión obrera.',
        content: `La Juegoteca se construye para resolver un problema concreto: ¿cómo sostenés trabajo, producción y organización colectiva si además tenés hijxs a cargo?

Desde sus inicios se la describe como un espacio impulsado por redes de familias y la Comisión de Mujeres, pensado para que el cuidado no sea un obstáculo para participar y decidir.

Esta campaña busca sostener y fortalecer ese derecho con un plan por etapas, evidencias públicas y seguimiento continuo.`,
        status: 'published',
        publishedAt: '2026-01-25T12:00:00Z',
      },
      {
        id: 2,
        category: 'tecnico',
        title: 'Enfoque pedagógico: juego, arte, ESI y derechos',
        excerpt:
          'No es solo cuidado: es un espacio de aprendizaje con talleres culturales y abordajes de derechos.',
        content: `La Juegoteca se describe como multiedad y con propuestas que incluyen talleres (ajedrez, arte, literatura, folklore, cine y teatro), y también espacios vinculados a ESI y derechos de niñxs y adolescentes.

En esta campaña, una etapa específica fortalece materiales pedagógicos y una “biblioteca lúdica”, con listas públicas de compras y reportes de implementación.`,
        status: 'published',
        publishedAt: '2026-01-25T12:10:00Z',
      },
      {
        id: 3,
        category: 'legal',
        title: 'Gobernanza y trabajo: la Juegoteca como sector de la cooperativa',
        excerpt:
          'La Juegoteca aparece documentada como un sector formal, con trabajadoras incorporadas y participación en decisiones.',
        content: `Distintas fuentes académicas describen la formalización de la Juegoteca como un sector más dentro de Madygraf, con trabajadoras incorporadas a la cooperativa y representación en instancias de decisión.

Para la campaña, esto se traduce en un compromiso: publicar criterios de transparencia, evidencias por etapa y reportes periódicos, con redacción de datos sensibles cuando corresponda.`,
        status: 'published',
        publishedAt: '2026-01-25T12:20:00Z',
      },
      {
        id: 4,
        category: 'logistica',
        title: 'Plan 2026: infraestructura, seguridad y materiales',
        excerpt:
          'Ordenamos un plan por etapas: sostén operativo, mejoras del espacio, materiales, bienestar y talleres.',
        content: `El plan de fortalecimiento se organiza en etapas con criterios de avance verificables:
1) Sostén operativo (horarios/plantel)
2) Infraestructura y seguridad
3) Materiales pedagógicos y biblioteca lúdica
4) Bienestar (insumos básicos)
5) Talleres y comunidad
6) Transparencia y repositorio documental

Cada etapa tendrá evidencias públicas (documentos, fotos, reportes) para seguimiento colectivo.`,
        status: 'published',
        publishedAt: '2026-01-25T12:30:00Z',
      },
    ],
  },
};
