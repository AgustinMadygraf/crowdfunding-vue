/**
 * GUÍA: Edición de Contenido para v1.0
 * 
 * v1.0 NO tiene backoffice admin. Para editar contenido del sitio, modifica este archivo directamente.
 * 
 * PASOS:
 * 1. Edita los datos abajo (mockMilestones, mockContributionLevels, etc.)
 * 2. Guarda los cambios
 * 3. Ejecuta: git add -A && git commit -m "Update: descripción del cambio"
 * 4. Ejecuta: git push main
 * 5. GitHub Actions redeploy automático en ~2 minutos
 * 6. Cambios online ✅
 * 
 * QUÉ EDITAR:
 * - mockMilestones: Etapas del proyecto (título, monto, estado, fecha)
 * - mockContributionLevels: Niveles de contribución (monto, beneficios, nombre)
 * - mockUpdates: Actualizaciones/noticias del proyecto
 * - mockEvidences: Evidencias por etapa (documentos, fotos, checksums)
 * - mockDocuments: Documentos públicos disponibles para descargar
 * 
 * ESTRUCTURA JSON: Respeta indentación y comas. Si rompes JSON → error en deploy.
 * Usa herramientas online si dudas: https://jsonlint.com/
 * 
 * v2.0+: Cuando cambios sean frecuentes (20+/mes) o contrates admin, implementar backoffice.
 */

import type { Milestone } from '@/domain/milestone';
import type { ContributionLevel } from '@/domain/contribution-level';
import type { Update } from '@/domain/update';

export const mockMilestones: Milestone[] = [
  {
    id: 1,
    name: 'Transformación Digital Comercial',
    description: 'Adquisición de rotativa RKHA190 para operaciones de impresión',
    details: 'Esta etapa cubre la fase inicial de la adquisición de la rotativa RKHA190. Incluye investigación de mercado, selección de proveedores, negociación de términos, y revisión técnica de especificaciones.',
    targetAmount: 100_000,
    raisedAmount: 30_000,
    targetDate: '2025-10-15',
    status: 'active',
    responsible: 'Área Comercial',
    published: true,
    evidences: [
      {
        id: 1,
        title: 'Propuesta técnica RKHA190',
        type: 'document',
        url: 'https://example.com/propuesta-tecnica.pdf',
        version: '1.0',
        publishedAt: '2025-09-15',
      },
      {
        id: 2,
        title: 'Comparativa de máquinas',
        type: 'document',
        url: 'https://example.com/comparativa.pdf',
        version: '1.0',
        publishedAt: '2025-09-20',
      },
    ],
    timeline: [
      {
        date: '2025-09-01',
        title: 'Análisis de mercado',
        description: 'Se realizó estudio comparativo de máquinas rotativas disponibles',
        status: 'completed',
      },
      {
        date: '2025-09-15',
        title: 'Selección de proveedor',
        description: 'Se eligió proveedor con mejor relación precio-calidad',
        status: 'completed',
      },
      {
        date: '2025-10-15',
        title: 'Cierre de negociación',
        description: 'Finalización de términos contractuales',
        status: 'in-progress',
      },
    ],
  },
  {
    id: 2,
    name: 'Anticipo 30% máquina',
    description: 'Pago inicial del 30% del valor de la rotativa',
    details: 'Anticipo requerido por el proveedor para iniciar el proceso de manufactura y reserva de unidad.',
    targetAmount: 22_000,
    raisedAmount: 0,
    targetDate: '2025-11-01',
    status: 'pending',
    dependencies: [1],
    published: true,
  },
  {
    id: 3,
    name: 'Saldo 70% máquina',
    description: 'Pago final del 70% antes de envío',
    details: 'Saldo final requerido antes del envío de la máquina. Se realiza contra inspección técnica final.',
    targetAmount: 200_000,
    raisedAmount: 0,
    targetDate: '2025-12-01',
    status: 'pending',
    dependencies: [2],
    published: true,
  },
  {
    id: 4,
    name: 'Flete Oceánico',
    description: 'Transporte marítimo desde proveedor a puerto',
    details: 'Incluye flete marítimo, seguro de transporte, y gestión de documentación aduanal internacional.',
    targetAmount: 60_000,
    raisedAmount: 0,
    targetDate: '2026-01-15',
    status: 'pending',
    dependencies: [3],
    published: true,
  },
  {
    id: 5,
    name: 'Aduana',
    description: 'Trámites aduanales y desaduanamiento',
    details: 'Incluye derechos aduanales, gestión de documentación, y tasas de desaduanamiento en puerto.',
    targetAmount: 18_000,
    raisedAmount: 0,
    targetDate: '2026-02-01',
    status: 'pending',
    dependencies: [4],
    published: true,
  },
  {
    id: 6,
    name: 'Instalación y montaje',
    description: 'Montaje, calibración e instalación de la rotativa',
    details: 'Incluye transporte interno, preparación de infraestructura, montaje en planta, calibración técnica, y capacitación de operadores.',
    targetAmount: 18_000,
    raisedAmount: 0,
    targetDate: '2026-02-15',
    status: 'pending',
    dependencies: [5],
    published: true,
  },
];

export const mockContributionLevels: ContributionLevel[] = [
  { amount: 25_000, benefit: 6, name: 'Colaborador' },
  { amount: 50_000, benefit: 8, name: 'Aliado' },
  { amount: 100_000, benefit: 10, name: 'Socio' },
  { amount: 250_000, benefit: 12, name: 'Impulsor' },
  { amount: 500_000, benefit: 14, name: 'Estratégico' },
  { amount: 1_000_000, benefit: 18, name: 'Principal' },
];

export const mockUpdates: Update[] = [
  {
    id: 1,
    category: 'comercial',
    title: 'Lanzamiento oficial del proyecto RKHA190',
    excerpt: 'Iniciamos la campaña de crowdfunding para la adquisición de la rotativa RKHA190.',
    content: `Hoy marca un hito histórico para la Cooperativa Madygraf. Después de meses de análisis y planificación, lanzamos oficialmente el proyecto de crowdfunding para la adquisición de la rotativa RKHA190.

Esta máquina de última generación nos permitirá duplicar nuestra capacidad de producción, reducir costos operativos en un 40%, y consolidar nuestra posición en el mercado gráfico argentino.

El proyecto está dividido en 6 etapas claras, con evidencias públicas en cada fase. Invitamos a toda la comunidad a ser parte de esta transformación digital.`,
    status: 'published',
    publishedAt: '2025-08-15T10:00:00Z',
  },
  {
    id: 2,
    category: 'tecnico',
    title: 'Especificaciones técnicas de la RKHA190 confirmadas',
    excerpt: 'Publicamos el documento técnico completo con las capacidades de la rotativa.',
    content: `Tras el análisis comparativo de 5 proveedores internacionales, confirmamos las especificaciones técnicas definitivas de la RKHA190:

• Velocidad: 45,000 impresiones/hora (3x velocidad actual)
• Formato: A3+ con sistema de alimentación continua
• Tecnología: Offset de 4 colores con sistema de secado UV
• Consumo energético: 30% menor vs modelos anteriores
• Mantenimiento: Sistema predictivo con sensores IoT

El documento completo está disponible en la sección de Evidencias de la Etapa 1.`,
    status: 'published',
    publishedAt: '2025-09-01T14:30:00Z',
  },
  {
    id: 3,
    category: 'comercial',
    title: 'Selección de proveedor completada',
    excerpt: 'Elegimos al proveedor final tras evaluación de costo-beneficio.',
    content: `Después de 3 semanas de negociaciones, hemos seleccionado al proveedor definitivo para la RKHA190.

Criterios de selección:
✓ Precio competitivo con financiamiento flexible
✓ Soporte técnico local en Argentina
✓ Garantía extendida de 3 años
✓ Capacitación incluida para 8 operadores
✓ Piezas de repuesto disponibles en stock local

El contrato se firmará una vez alcanzado el 50% del monto objetivo de la Etapa 1.`,
    status: 'published',
    publishedAt: '2025-09-15T11:00:00Z',
  },
  {
    id: 4,
    category: 'logistica',
    title: 'Planificación del transporte internacional',
    excerpt: 'Coordinamos la logística de flete marítimo desde Europa.',
    content: `Iniciamos la planificación logística para el transporte de la RKHA190 desde el puerto de Rotterdam (Países Bajos) hasta Buenos Aires.

Detalles del proceso:
• Embalaje especializado con protección anti-humedad
• Contenedor de 40 pies HC (High Cube)
• Tiempo estimado de tránsito: 28-32 días
• Seguro de carga: cobertura total contra daños
• Agente aduanero certificado por AFIP

El flete se coordinará con 2 semanas de anticipación al pago del saldo de embarque (Etapa 2).`,
    status: 'published',
    publishedAt: '2025-10-01T09:00:00Z',
  },
  {
    id: 5,
    category: 'legal',
    title: 'Documentación aduanera iniciada',
    excerpt: 'Presentamos la solicitud de importación ante AFIP y INAL.',
    content: `Avanzamos en los trámites legales y aduaneros para la importación de la RKHA190.

Documentación en proceso:
✓ Declaración Jurada de Importación (DJCP)
✓ Certificado de Origen EUR.1
✓ Factura comercial y packing list
✓ Permiso de embarque (SIMI)
✓ Póliza de seguro internacional

Nuestro despachante de aduana estima 15 días hábiles para la liberación una vez arribado el contenedor al puerto.`,
    status: 'published',
    publishedAt: '2025-10-20T16:00:00Z',
  },
  {
    id: 6,
    category: 'tecnico',
    title: 'Preparación de infraestructura en planta',
    excerpt: 'Iniciamos las obras de acondicionamiento para recibir la RKHA190.',
    content: `Comenzamos las tareas de preparación de infraestructura en nuestra planta de Banfield.

Trabajos en curso:
• Refuerzo de cimientos (carga máxima: 12 toneladas)
• Instalación eléctrica trifásica de 380V/63A
• Sistema de climatización industrial (control de humedad)
• Plataforma de carga con acceso para montacargas
• Cableado de red para sistema IoT de monitoreo

Fecha estimada de finalización: 15 de enero de 2026. La máquina podrá instalarse inmediatamente al arribo.`,
    status: 'published',
    publishedAt: '2025-11-10T13:00:00Z',
  },
  {
    id: 7,
    category: 'comercial',
    title: '¡Alcanzamos el 30% de la meta!',
    excerpt: 'Gracias a nuestros primeros colaboradores, superamos los $100,000.',
    content: `¡Hito alcanzado! Gracias a 47 colaboradores, hemos recaudado más de $100,000 en las primeras 3 semanas de campaña.

Números clave:
📊 30% del objetivo total ($378,000)
👥 47 contribuyentes (mix de individuos y empresas)
💰 Ticket promedio: $2,100
🎯 Proyección: alcanzar 50% para fin de año

Agradecemos especialmente a nuestros Socios e Impulsores que creyeron desde el día 1. El resto de la comunidad: ¡todavía están a tiempo de sumarse y ser parte de esta transformación!`,
    status: 'published',
    publishedAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 8,
    category: 'tecnico',
    title: 'Equipo técnico capacitado en tecnología offset',
    excerpt: 'Nuestros operadores completaron la certificación internacional.',
    content: `Excelentes noticias: 6 de nuestros operadores completaron la certificación técnica internacional en sistemas offset de alta velocidad.

Programa de capacitación:
✓ 80 horas teórico-prácticas
✓ Simulador virtual de operación RKHA190
✓ Certificación ISO 12647-2 (gestión de color)
✓ Mantenimiento preventivo y correctivo
✓ Sistema de control de calidad en tiempo real

Instructores: Técnicos de Heidelberg con 15+ años de experiencia. Nuestro equipo está listo para operar la RKHA190 desde el día 1.`,
    status: 'published',
    publishedAt: '2025-12-20T15:00:00Z',
  },
];
