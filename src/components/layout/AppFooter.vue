<!--
Path: src/components/layout/AppFooter.vue
-->

<script setup lang="ts">
import { appFooterData } from '@/infrastructure/mockData';
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-info">
        <div class="footer-logo">
          <img :alt="appFooterData.logo.alt" :src="appFooterData.logo.src" :width="appFooterData.logo.width" />
          <p>{{ appFooterData.logo.text }}</p>
        </div>
        <div class="footer-links">
          <h4>{{ appFooterData.links.title }}</h4>
          <ul>
            <li v-for="(item, idx) in appFooterData.links.items" :key="idx">
              <a :href="item.href">{{ item.label }}</a>
            </li>
          </ul>
        </div>
        <div class="footer-contact">
          <h4>{{ appFooterData.contact.title }}</h4>
          <p>Email: {{ appFooterData.contact.email }}</p>
          <div class="social-links">
            <a v-for="(social, idx) in appFooterData.contact.social" :key="idx" :href="social.href" :aria-label="social.aria">{{ social.short }}</a>
          </div>
        </div>
      </div>
      <div class="copyright">
        <p>{{ appFooterData.copyright }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #333;
  color: white;
  padding: 60px 0 20px;
}

/* container en components.css */

.footer-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-links ul {
  list-style: none;
  padding: 0;
}

.footer-links a,
.social-links a {
  color: #ddd;
  text-decoration: none;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

p {
  margin: 0;
}

h4 {
  margin-bottom: 15px;
}

.copyright {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: #999;
}
</style>
