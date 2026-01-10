/**
 * Dominio: Usuario
 * Define la estructura de datos de un usuario en la aplicación
 */

export interface User {
  id: string
  email: string
  nombre: string
  avatar_url?: string
}

export interface UserWithContributions extends User {
  contributions: Array<{
    id: string
    monto: number
    nivel_nombre: string
    estado_pago: 'pendiente' | 'procesando' | 'completado' | 'fallido' | 'cancelado'
    created_at: string
    completed_at?: string
    token: string
  }>
}
