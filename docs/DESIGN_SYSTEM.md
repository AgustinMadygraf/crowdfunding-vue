# Design System - Portal Madypack

**Versión:** 1.0  
**Última actualización:** 2026-01-09  
**Estado:** En construcción

---

## 📋 Introducción

Este documento describe el sistema de diseño utilizado en el Portal Madypack. Se utiliza **CSS vanilla con Variables CSS** en lugar de un framework como Bootstrap, lo que permite una mayor personalización y un bundle más ligero.

---

## 🎨 Paleta de Colores

### Variables CSS Base (`:root`)

```css
/* Colores principales */
--vt-c-white: #ffffff;
--vt-c-white-soft: #f8f8f8;
--vt-c-white-mute: #f2f2f2;

--vt-c-black: #181818;
--vt-c-black-soft: #222222;
--vt-c-black-mute: #282828;

--vt-c-indigo: #2c3e50;  /* Primary */

/* Divisores y bordes */
--vt-c-divider-light-1: rgba(60, 60, 60, 0.29);
--vt-c-divider-light-2: rgba(60, 60, 60, 0.12);
--vt-c-divider-dark-1: rgba(84, 84, 84, 0.65);
--vt-c-divider-dark-2: rgba(84, 84, 84, 0.48);

/* Texto */
--vt-c-text-light-1: var(--vt-c-indigo);
--vt-c-text-light-2: rgba(60, 60, 60, 0.66);
--vt-c-text-dark-1: var(--vt-c-white);
--vt-c-text-dark-2: rgba(235, 235, 235, 0.64);
```

### Colores Semánticos

```css
/* Variables semánticas por tema */
--color-background: var(--vt-c-white);
--color-background-soft: var(--vt-c-white-soft);
--color-background-mute: var(--vt-c-white-mute);

--color-border: var(--vt-c-divider-light-2);
--color-border-hover: var(--vt-c-divider-light-1);

--color-heading: var(--vt-c-text-light-1);
--color-text: var(--vt-c-text-light-1);

/* Con prefers-color-scheme: dark */
--color-background: var(--vt-c-black);
--color-heading: var(--vt-c-text-dark-1);
--color-text: var(--vt-c-text-dark-2);
```

### Colores de Acciones (Por componente)

**HeroSection:**
- Primary: `#4caf50` (Verde)
- Secondary: `#333` (Oscuro)
- Hover: `#45a049`

**Fondo:** Gradiente azul `135deg, #f5f7fa 0%, #c3cfe2 100%`

**Fondos de secciones:**
- UpdatesSection: `#f9fafb`
- FAQ: `#f9fafb`
- Default: `#ffffff`

---

## 🔤 Tipografía

### Fuentes

**Familia principal:**
```css
font-family:
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  Oxygen,
  Ubuntu,
  Cantarell,
  'Fira Sans',
  'Droid Sans',
  'Helvetica Neue',
  sans-serif;
```

### Tamaños (recomendados)

| Uso | Tamaño | Peso |
|-----|--------|------|
| h1 (Hero) | 2.75rem | bold |
| h2 (Sección) | 2rem | bold |
| h3 (Subsección) | 1.5rem | bold |
| Párrafo | 1rem (15px) | normal |
| Pequeño | 0.875rem | normal |
| Hero Subtitle | 1.2rem | normal |

### Interlineado

```css
line-height: 1.6;  /* Por defecto en body */
```

---

## 📐 Espaciado

### Variables

```css
--section-gap: 160px;  /* Espacio entre secciones */
```

### Recomendaciones de márgenes/paddings

| Componente | Padding | Margin |
|------------|---------|--------|
| Sección | 80px 20px | 0 |
| Container | max-width: 960px, margin: 0 auto | - |
| Cards | 24px | 24px bottom |
| Botones | 12px 24px | - |
| Texto | - | margin-bottom: 12px - 24px |

---

## 🔲 Componentes Base

### Botones

**Primary Button (`.btn-primary`)**
- Background: `#4caf50`
- Color: `#fff`
- Padding: `12px 24px`
- Border-radius: `4px`
- Hover: `#45a049`
- Transition: `all 0.3s ease`

```vue
<button class="btn btn-primary">Quiero aportar</button>
```

**Secondary Button (`.btn-secondary`)**
- Background: `transparent`
- Color: `#333`
- Border: `2px solid #333`
- Padding: `12px 24px`
- Hover: Background `#333`, Color `#fff`

```vue
<a class="btn btn-secondary">Ver avance</a>
```

### Contenedor Principal (`.container`)

```css
max-width: 960px;
margin: 0 auto;
```

### Secciones (`.section`)

```css
padding: 80px 20px;
background-color: [variable];
```

---

## 📱 Responsive Design

### Breakpoints

```css
@media (max-width: 768px) {
  /* Mobile optimizations */
  h1 { font-size: 2rem; }
  .cta-buttons { flex-direction: column; }
  .hero { padding: 60px 20px; }
  /* etc. */
}
```

### Principios

- **Mobile First:** Base en móvil, mejorar en desktop
- **Flexible:** 80% width on mobile, max-width 960px on desktop
- **Readable:** Aumentar padding en móvil para facilitar lectura

---

## 🎭 Modo Oscuro (Dark Mode)

El sistema soporta `prefers-color-scheme: dark` y ajusta:
- Backgrounds: Oscuro
- Texto: Claro
- Bordes: Tonos más claros
- Transiciones suave entre modos

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--vt-c-black);
    --color-text: var(--vt-c-text-dark-2);
    /* ... más variables */
  }
}
```

---

## 📦 Componentes Vue Actuales

### Estructura Funcional

| Componente | Ruta | Responsabilidad |
|------------|------|-----------------|
| `AppHeader` | `layout/` | Navegación top + logo |
| `AppFooter` | `layout/` | Footer con enlaces |
| `HeroSection` | `sections/` | CTA principal |
| `MilestonesSection` | `sections/` | Panel de etapas |
| `ContributionSection` | `sections/` | Selección de niveles |
| `UpdatesSection` | `sections/` | Actualizaciones |
| `FaqSection` | `sections/` | Preguntas frecuentes |
| `MilestoneCard` | `milestones/` | Tarjeta individual |

### Uso de Composables

```typescript
import { useMilestones } from '@/application/useMilestones';
import { useContributionLevels } from '@/application/useContributionLevels';

const { milestones, progressPercentage } = useMilestones();
const { levels, selectLevel } = useContributionLevels();
```

---

## 🔧 Herramientas y Configuración

- **Framework:** Vue 3 + TypeScript
- **Build:** Vite
- **CSS:** Vanilla CSS + Variables CSS (sin preprocesador)
- **Sin dependencias UI:** Bootstrap, Tailwind, etc.

---

## 📝 Guía para Nuevos Componentes

### Plantilla básica de componente

```vue
<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <section class="mi-seccion">
    <div class="container">
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
      <!-- Contenido -->
    </div>
  </section>
</template>

<style scoped>
.mi-seccion {
  padding: 80px 20px;
  background-color: var(--color-background);
}

.container {
  max-width: 960px;
  margin: 0 auto;
}

h2 {
  color: var(--color-heading);
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .mi-seccion {
    padding: 60px 20px;
  }
}
</style>
```

### Buenas prácticas

1. **Usar variables CSS** en lugar de colores hardcodeados
2. **Margin-bottom para espaciado** en lugar de margin-top
3. **Sección = 80px padding** (60px en móvil)
4. **Container = max-width 960px**
5. **Siempre incluir responsive** con breakpoint 768px
6. **Transiciones suave** (`transition: all 0.3s ease`)

---

## 🌐 Próximas mejoras

- [ ] Sistema de grid (CSS Grid o flexbox patterns)
- [ ] Animaciones de entrada (Intersection Observer)
- [ ] Temas personalizables (múltiples color schemes)
- [ ] Componentes accesibles (ARIA labels)
- [ ] Tests visuales de componentes

---

**Mantenedor:** Equipo de desarrollo Madygraf  
**Última revisión:** 2026-01-09
