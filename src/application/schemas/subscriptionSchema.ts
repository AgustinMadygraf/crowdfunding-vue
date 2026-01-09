import { z } from 'zod'

/**
 * Schema de validación para el formulario de pre-registro
 * Basado en FR-020 y FR-021 del SRS v1.0
 */
export const subscriptionFormSchema = z.object({
  // Campos obligatorios (FR-020)
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  email: z
    .string()
    .email('Debe ingresar un email válido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .toLowerCase()
    .trim(),

  consentimiento: z
    .boolean()
    .refine(val => val === true, {
      message: 'Debe aceptar los términos y condiciones para continuar'
    }),

  // Campos opcionales (FR-020)
  telefono: z
    .string()
    .regex(/^[\d\s\-\+\(\)]*$/, 'Formato de teléfono inválido')
    .max(30, 'El teléfono no puede exceder 30 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  whatsapp: z
    .string()
    .regex(/^[\d\s\-\+\(\)]*$/, 'Formato de WhatsApp inválido')
    .max(30, 'El WhatsApp no puede exceder 30 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  provincia: z
    .string()
    .max(100, 'La provincia no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  tipo_interesado: z
      .enum(['persona', 'empresa', 'cooperativa', 'otro'])
    .optional()
    .or(z.literal('')),

  rango_monto: z
    .enum([
      'hasta_5000',
      '5000_10000',
      '10000_25000',
      '25000_50000',
      '50000_100000',
      'mas_100000'
      ])
    .optional()
    .or(z.literal(''))
})

/**
 * Tipo inferido del schema
 */
export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>

/**
 * Schema para validar el payload completo que se envía al backend
 * Incluye: lead + level_id + consent + utm (FR-011, FR-020, NFR-MKT-001)
 */
export const createSubscriptionRequestSchema = z.object({
  lead: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(255),
    phone: z.string().max(30).optional(),
    whatsapp: z.string().max(30).optional(),
    province: z.string().max(100).optional(),
    type: z.enum(['persona', 'empresa', 'cooperativa', 'otro']).optional(),
    amount_range: z.enum([
      'hasta_5000',
      '5000_10000',
      '10000_25000',
      '25000_50000',
      '50000_100000',
      'mas_100000'
    ]).optional()
  }),
  
  level_id: z.string().min(1, 'Debe seleccionar un nivel de contribución'),
  
  consent: z.object({
    accepted: z.literal(true),
    version: z.string().min(1),
    accepted_at: z.string().datetime() // ISO 8601
  }),
  
  utm: z.object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),
    campaign_id: z.string().optional(),
    referrer: z.string().optional(),
    timestamp: z.number().optional()
  }).optional()
})

export type CreateSubscriptionRequest = z.infer<typeof createSubscriptionRequestSchema>
