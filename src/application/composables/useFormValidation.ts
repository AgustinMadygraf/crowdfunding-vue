import { ref, type Ref } from 'vue'
import { z, type ZodError, type ZodObject, type ZodRawShape } from 'zod'

/**
 * Composable para manejar validación de formularios con Zod
 * 
 * @param schema - Schema de Zod para validar
 * @returns Métodos y estados para validación
 */
export function useFormValidation<T extends ZodRawShape>(schema: ZodObject<T>) {
  // Estado de errores por campo
  const errors = ref<Record<string, string>>({}) as Ref<Record<string, string>>
  
  // Error general del formulario
  const formError = ref<string | null>(null)
  
  // Estado de validación
  const isValid = ref(false)

  /**
   * Valida un campo individual
   * @param fieldName - Nombre del campo
   * @param value - Valor a validar
   * @returns true si es válido, false si hay error
   */
  const validateField = (fieldName: string, value: unknown): boolean => {
    try {
      // Intentar validar solo este campo usando partial
      const partialSchema = schema.partial()
      partialSchema.parse({ [fieldName]: value })
      
      // Si pasa, limpiar error
      delete errors.value[fieldName]
      return true
    } catch (error) {
      if (error instanceof z.ZodError && error.issues) {
        // Extraer mensaje de error para este campo
        const fieldError = error.issues.find((e: any) => e.path[0] === fieldName)
        if (fieldError) {
          errors.value[fieldName] = fieldError.message
        }
      }
      return false
    }
  }

  /**
   * Valida el formulario completo
   * @param data - Objeto con todos los datos del formulario
   * @returns true si es válido, false si hay errores
   */
  const validateForm = (data: unknown): boolean => {
    try {
      schema.parse(data)
      
      // Si pasa, limpiar todos los errores
      errors.value = {}
      formError.value = null
      isValid.value = true
      return true
    } catch (error) {
      if (error instanceof z.ZodError && error.issues) {
        // Mapear errores por campo
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err: any) => {
          const fieldName = err.path[0] as string
          if (fieldName) {
            newErrors[fieldName] = err.message
          }
        })
        errors.value = newErrors
        
        // Mensaje general si hay múltiples errores
        if (error.issues.length > 1) {
          formError.value = 'Por favor corrija los errores en el formulario'
        } else {
          formError.value = error.issues[0].message
        }
      } else {
        formError.value = 'Error de validación desconocido'
      }
      
      isValid.value = false
      return false
    }
  }

  /**
   * Limpia todos los errores
   */
  const clearErrors = () => {
    errors.value = {}
    formError.value = null
    isValid.value = false
  }

  /**
   * Limpia el error de un campo específico
   */
  const clearFieldError = (fieldName: string) => {
    delete errors.value[fieldName]
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  const getFieldError = (fieldName: string): string | undefined => {
    return errors.value[fieldName]
  }

  /**
   * Verifica si un campo tiene error
   */
  const hasFieldError = (fieldName: string): boolean => {
    return !!errors.value[fieldName]
  }

  return {
    errors,
    formError,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError
  }
}
