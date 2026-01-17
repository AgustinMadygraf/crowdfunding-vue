Responde como un experto en **Clean Architecture + SOLID** aplicado al frontend, y también en **Vue 3, Vite y TypeScript**.

### Contexto
Quiero que analices la arquitectura general del proyecto y, en particular, el archivo:
- `src/infrastructure/mockData.ts`

y los archivos que dependen de él (directa o indirectamente), incluyendo:
- `src/application/useContributionLevels.ts`
- `src/application/useMilestones.ts`
- `src/application/useUpdates.ts`
- `src/components/layout/AppFooter.vue`
- `src/components/sections/FaqSection.vue`
- `src/views/HomeView.vue`

### Objetivos del análisis
1. Detectar acoplamientos y violaciones de Clean Architecture / SOLID (por ejemplo: lógica de negocio en componentes, dependencias invertidas mal, infraestructura filtrándose a la capa de aplicación, etc.).
2. Evaluar si `mockData.ts` está ubicado y modelado correctamente, y proponer una estrategia para:
   - mantener mocks para desarrollo
   - y permitir reemplazarlos fácilmente por un backend real (API)
3. Mejorar la separación entre:
   - dominio (modelos/reglas)
   - aplicación (casos de uso / composables)
   - infraestructura (repositorios, fuentes de datos, HTTP)
   - UI (componentes / vistas)

### Entregables (quiero que lo devuelvas en este orden)
1. **Mapa de capas actual**: cómo fluye la data desde `mockData.ts` hasta la UI (diagrama textual o lista por pasos).
2. **Lista priorizada de problemas** (de mayor impacto a menor), cada uno con:
   - archivo(s) afectados
   - por qué es un problema (principio SOLID / regla de dependencias)
   - riesgo/impacto (alto/medio/bajo)
3. **Propuesta de arquitectura objetivo**:
   - estructura de carpetas recomendada (tree bajo `src/`)
   - reglas de imports (qué puede importar qué)
4. **Plan de refactor en pasos pequeños** (orden seguro), indicando qué mover y qué crear:
   - interfaces/ports
   - repositorios
   - tipos/DTOs vs modelos de dominio
   - composables/casos de uso
5. **Ejemplos de código** (mínimo 2):
   - Antes → Después de cómo consumir datos (desde mock → repository → use case/composable → componente)
   - Un ejemplo de “swap” mock ↔ API usando inyección de dependencias (sin librerías pesadas)
6. **Recomendaciones específicas para Vue/Vite/TS**:
   - typing (types vs interfaces, inferencia, strict)
   - organización de composables
   - manejo de estado (si aplica)
   - tests (unitarios para casos de uso y adaptadores)

### Restricciones
- Evita soluciones mágicas o extremadamente complejas.
- Prefiero inyección de dependencias simple (factory/provider).
- Mantén compatibilidad con Vue 3 + Vite.

### Inputs
Si necesitas ver el contenido, pídeme que pegue los archivos o fragmentos relevantes y dime exactamente qué partes necesitas.
