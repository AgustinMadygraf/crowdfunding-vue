<template>
  <!-- ...existing template code... -->
</template>

<script lang="ts">
import { Logger } from '@/infrastructure/logger'
// ...existing imports...

const handleAppError = (error: unknown) => {
  Logger.error('Error global en App.vue', error)
}

// ...existing script code...
</script>

<style>
/* ...existing styles... */
</style>