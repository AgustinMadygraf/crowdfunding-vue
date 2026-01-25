<template>
  <div class="faq-section">
    <h2>{{ faqTitle }}</h2>
    <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
      <h3 @click="toggleFaq(index)">{{ faq.question }}</h3>
      <p v-if="faq.showAnswer">{{ faq.answer }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { content } from '@/infrastructure/content'


export default {
  name: 'FaqSection',
  data() {
    return {
      faqTitle: content.home.faq.title,
      faqs: content.home.faq.items.map((item) => ({ ...item, showAnswer: false })),
    }
  },
  methods: {
    toggleFaq(index: number) {
      this.faqs[index].showAnswer = !this.faqs[index].showAnswer
    },
    handleFaqError(error: unknown) {
      console.error('Error en sección FAQ', error)
    },
  },
}
</script>

<style scoped>
/* .faq-section {  Estilos aquí si es necesario  } */
/* .faq-item {  Estilos aquí si es necesario  } */
</style>
