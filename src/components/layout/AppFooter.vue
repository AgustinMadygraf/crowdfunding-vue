<!--
Path: src/components/layout/AppFooter.vue
-->

<script setup lang="ts">
import { content } from '@/infrastructure/content';

const footerContent = content.app.footer;
</script>

<template>
  <footer class="bg-dark text-white py-5">
    <div class="container">
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-4">
          <img :alt="footerContent.logo.alt" :src="footerContent.logo.src" :width="footerContent.logo.width" />
          <p class="mt-3 mb-0">{{ footerContent.logo.text }}</p>
        </div>
        <div class="col-12 col-md-4">
          <h4 class="h6 text-uppercase text-white-50 mb-3">{{ footerContent.links.title }}</h4>
          <ul class="list-unstyled mb-0">
            <li v-for="(item, idx) in footerContent.links.items" :key="idx">
              <a :href="item.href" class="text-decoration-none text-white-50">{{ item.label }}</a>
            </li>
          </ul>
        </div>
        <div class="col-12 col-md-4">
          <h4 class="h6 text-uppercase text-white-50 mb-3">{{ footerContent.contact.title }}</h4>
          <p class="mb-2 text-white-50">{{ footerContent.contact.emailLabel }} {{ footerContent.contact.email }}</p>
          <div class="d-flex gap-3">
            <a v-for="(social, idx) in footerContent.contact.social" :key="idx" :href="social.href" :aria-label="social.aria" class="text-decoration-none text-white-50">{{ social.short }}</a>
          </div>
        </div>
      </div>
      <div class="border-top border-white-10 pt-3 text-center text-white-50 small">
        <p class="mb-0">{{ footerContent.copyright }}</p>
      </div>
    </div>
  </footer>
</template>
