# Auditoría Clean Architecture

Fecha: 2026-03-03
Repositorio: `crowdfunding-vue`

## Alcance
- Capas revisadas: `domain`, `application`, `presentation`, `infrastructure`, `stores`, `router`, `views`.
- Validaciones ejecutadas: `npm run check:arch-boundaries`, `npm run test -- --run`, `npm run type-check`.

## Hallazgos

### Certezas de alto nivel

#### (AL-01) La capa de presentación depende directamente de infraestructura
- Evidencia:
  - Al inicio de la auditoría, `src/presentation/composables/useMilestones.ts`, `useUpdates.ts`, `useDocuments.ts` y `useAdminData.ts` importaban repositorios/DTO concretos de `infrastructure`.
- Impacto: acoplamiento fuerte UI-IO, baja testabilidad y reemplazo difícil de adaptadores.
- Estado tras ejecución: mitigado parcialmente en esta sesión (BL-02).

#### (AL-02) Existen dos stacks HTTP paralelos para el mismo dominio
- Evidencia:
  - Al inicio de la auditoría coexistían repositorios con `fetch` directo (`src/infrastructure/repositories/*.ts`) y stack paralelo `src/infrastructure/api.ts` + `src/infrastructure/services/*Service.ts`.
- Impacto: duplicación de manejo de errores/reintentos y deriva de comportamiento.
- Estado tras ejecución: resuelto en esta sesión; stack paralelo eliminado y consolidación en repositorios.

#### (AL-03) El contrato de autenticación está en infraestructura y es consumido aguas adentro
- Evidencia:
  - Al inicio de la auditoría, `presentation`/`stores` importaban `IAuthService/AuthState` desde `@/infrastructure/services/IAuthService`.
- Impacto: inversión de dependencias incompleta; cambia infraestructura y arrastra capa de presentación.
- Estado tras ejecución: mitigado parcialmente en esta sesión (BL-04).

#### (AL-04) El “modelo de contenido” está tipado como dominio aunque es contenido de UI
- Evidencia:
  - Al inicio de la auditoría, `src/presentation/content.ts` y `src/presentation/content.jugoteca.ts` tipaban `content` con `Content` desde `src/domain/content.ts`.
- Impacto: contaminación del dominio con concerns de copy, navegación y componentes de interfaz.
- Estado tras ejecución: mitigado parcialmente en esta sesión (BL-05).

#### (AL-05) Observabilidad no homogénea en runtime
- Evidencia:
  - Coexisten `logger` y `console.*` en vistas/composables/infra.
  - Ejemplos: `src/views/SubscribeView.vue`, `src/router/index.ts`, `src/views/MilestonesView.vue`.
- Impacto: trazas inconsistentes, difícil filtrar severidad/códigos y riesgo de fuga de detalles operativos.

### Certezas de bajo nivel (con opciones)

#### (BL-01) Corregir rutas `/login` inexistentes en `AdminView.vue`
- Evidencia:
  - `src/views/AdminView.vue` redirige a `/login` y muestra CTA a `/login`.
  - `src/router/index.ts` no define ruta `login`.
- Opciones:
  1) Redirigir a `/suscribir` (ruta existente de entrada de autenticación)
     - Pros: cambio mínimo, consistente con flujo actual.
     - Contras: UX no explícita de "login".
  2) Crear nueva vista/route `/login`
     - Pros: semántica clara.
     - Contras: mayor alcance y duplicación potencial.
  3) Redirigir a `name: 'home'` y abrir modal de auth vía query/evento
     - Pros: evita ruta adicional.
     - Contras: más acoplamiento UI-ruteo.
- Recomendación final: opción 1.

#### (BL-02) Desacoplar composables de datos públicos de repositorios/DTO de infraestructura
- Evidencia:
  - Imports directos de infraestructura en `useMilestones`, `useUpdates`, `useDocuments`, `useAdminData`.
- Opciones:
  1) Crear puertos en `application/ports` + provider y componer en `main.ts`
     - Pros: respeta dependency rule, testabilidad alta, cambio incremental.
     - Contras: agrega capa de composición.
  2) Inyectar repositorios concretos por parámetros de cada composable
     - Pros: simple de implementar.
     - Contras: infraestructura sigue filtrándose en presentación.
  3) Mover toda lógica de fetch a vistas
     - Pros: menos abstracción.
     - Contras: empeora mantenibilidad y SRP.
- Recomendación final: opción 1.

#### (BL-03) Eliminar exports incompletos con placeholders
- Evidencia:
  - `src/infrastructure/services/auth/googleOAuthProvider.ts` (`getGoogleOAuthToken`).
  - `src/infrastructure/services/csrfService.ts` (`fetchCsrfToken`).
  - `src/infrastructure/services/auth/tokenStorage.ts` (`saveToken`).
- Opciones:
  1) Eliminar exports no usados hasta definir caso real
     - Pros: reduce deuda y ambigüedad.
     - Contras: si alguien externo lo usa, habría ruptura (no hay usos internos).
  2) Implementar completamente las funciones
     - Pros: API completa.
     - Contras: agrega alcance sin demanda funcional.
  3) Marcar explícitamente como `throw new Error('Not implemented')`
     - Pros: falla explícita.
     - Contras: mantiene ruido y APIs sin valor.
- Recomendación final: opción 1.

#### (BL-04) Mover contrato de Auth a `application/ports`
- Evidencia:
  - Al inicio, el contrato `IAuthService` estaba en `src/infrastructure/services/IAuthService.ts` y era consumido por `presentation`/`stores`.
- Opciones:
  1) Crear contrato en `application/ports` y mantener re-export en infraestructura durante transición
     - Pros: corta dependencia inversa sin romper imports internos.
     - Contras: coexistencia temporal de dos rutas.
  2) Mover contrato y reemplazar todos los imports en un solo paso
     - Pros: limpieza total inmediata.
     - Contras: mayor riesgo de roturas en un único cambio.
  3) Mantener contrato en infraestructura
     - Pros: cero cambios inmediatos.
     - Contras: viola regla de dependencias.
- Recomendación final: opción 1.

#### (BL-05) Mover el tipado de `Content` a presentación
- Evidencia:
  - Al inicio, `presentation/content*.ts` dependía de `src/domain/content.ts`.
- Opciones:
  1) Crear `src/presentation/content.types.ts` y actualizar imports de `content*.ts`
     - Pros: separa concerns UI del dominio con cambio acotado.
     - Contras: duplicación temporal mientras exista el archivo en `domain`.
  2) Eliminar por completo `src/domain/content.ts` en el mismo cambio
     - Pros: limpieza total.
     - Contras: mayor riesgo si existen consumidores no detectados.
  3) Mantener tipado en `domain`
     - Pros: cero trabajo.
     - Contras: contaminación persistente del dominio.
- Recomendación final: opción 1.

### Dudas de alto nivel
- Documentadas en `docs/decisions.open.md`.
