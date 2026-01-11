<template>
  <div class="faq-section">
    <h2>Preguntas Frecuentes</h2>
    <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
      <h3 @click="toggleFaq(index)">{{ faq.question }}</h3>
      <p v-if="faq.showAnswer">{{ faq.answer }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Logger } from '@/infrastructure/logger'

export default {
  name: 'FaqSection',
  data() {
    return {
      faqs: [
        { question: 'Pregunta 1', answer: 'Respuesta 1', showAnswer: false },
        { question: 'Pregunta 2', answer: 'Respuesta 2', showAnswer: false },
        // ...más preguntas frecuentes
      ],
    }
  },
  methods: {
    toggleFaq(index: number) {
      this.faqs[index].showAnswer = !this.faqs[index].showAnswer
    },
    handleFaqError(error: unknown) {
      Logger.error('Error en sección FAQ', error)
    },
  },
}
</script>

<style scoped>
/* .faq-section {  Estilos aquí si es necesario  } */
/* .faq-item {  Estilos aquí si es necesario  } */
</style>