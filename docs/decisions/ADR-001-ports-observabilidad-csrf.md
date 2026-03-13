# ADR-001: Aislar observabilidad y CSRF de infraestructura en capas UI

## Estado
- **Fecha**: 2026-03-13
- **Estado**: Aceptada
- **Decisores**: Agente (`decision-helper`) con mandato explícito del usuario

## Contexto
La auditoría detectó dependencias directas desde `presentation`, `views` y `stores` hacia infraestructura:
- `@/infrastructure/logging/logger` en múltiples composables/vistas/store.
- `@/infrastructure/services/csrfService` en `useCsrfToken`.

Esto mantiene acoplamiento de capas UI a implementaciones concretas y deja incompleta la regla de inversión de dependencias ya aplicada en otras áreas (repositorios, auth ports/providers).

## Decisión
**Opción seleccionada**: Introducir puertos en `application` para observabilidad y CSRF, con adaptadores en `infrastructure` y wiring en composition root.

**Justificación**:
- Alinea el proyecto con la estrategia previa de Clean Architecture ya implementada en `application/ports`.
- Reduce acoplamiento y facilita tests/mocks en UI.
- Es una migración incremental y reversible por archivo.

## Consecuencias

### Positivas
- `presentation/views/stores` dejan de depender de infraestructura concreta.
- Mayor testabilidad y claridad de fronteras.
- Se habilita enforcement automático más estricto en `check:arch-boundaries`.

### Negativas / Trade-offs
- Incrementa cantidad de contratos/adaptadores.
- Requiere migración en varios archivos UI y ajuste de bootstrap.

## Alternativas Rechazadas

### Opción A: Mantener import directo actual
**Por qué se rechazó**:
Conserva deuda de arquitectura y contradice la dirección ya tomada por el proyecto.

### Opción C: Solo abstraer logger y dejar CSRF concreto
**Por qué se rechazó**:
Deja inconsistencia parcial de capas y obliga a una segunda migración similar en corto plazo.

## Implementación
- **Plan de acción**: Ver `docs/todo.md`
- **Fecha estimada**: 2026-03-14
- **Responsable**: Agente + revisión de usuario

## Notas
- Esta decisión no cambia contrato de negocio; afecta exclusivamente estructura de dependencias.
- Se recomienda procesar la implementación con `skill:todo-workflow`.
