import { z } from 'zod'

/**
 * Schema de validación para crear una contribución
 * Valida montos, datos de usuario y nivel de contribución
 * 
 * NOTE: user_id y nivel_id no usan validación UUID porque el backend
 * puede usar diferentes formatos de identificadores (UUID, string, etc.)
 * La validación se enfoca en presence y length para permitir flexibilidad
 */
export const createContributionSchema = z.object({
  user_id: z
    .string()
    .min(1, 'El ID de usuario es requerido')
    .max(255, 'El ID de usuario no puede exceder 255 caracteres')
    .trim(),

  monto: z
    .number()
    .int('El monto debe ser un número entero')
    .min(100, 'El monto mínimo es $100')
    .max(1000000, 'El monto máximo es $1,000,000'),

  nivel_id: z
    .string()
    .min(1, 'El ID del nivel es requerido')
    .max(255, 'El ID del nivel no puede exceder 255 caracteres')
    .trim(),

  nivel_nombre: z
    .string()
    .min(1, 'El nombre del nivel es requerido')
    .max(100, 'El nombre del nivel no puede exceder 100 caracteres')
    .trim(),

  utm_params: z
    .record(z.string(), z.string())
    .optional()
    .default({})
})

export type CreateContributionInput = z.infer<typeof createContributionSchema>

/**
 * Valida datos de contribución y retorna errores estructurados
 */
export function validateContribution(data: unknown) {
  const result = createContributionSchema.safeParse(data)
  
  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach(issue => {
      const path = issue.path.join('.')
      errors[path] = issue.message
    })
    return { valid: false, errors }
  }

  return { valid: true, data: result.data, errors: {} }
}

/**
 * Schema de validación para nivel de contribución
 */
export const contributionLevelSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).max(100),
  monto: z.number().int().min(1),
  descripcion: z.string().optional()
})

export type ContributionLevel = z.infer<typeof contributionLevelSchema>
