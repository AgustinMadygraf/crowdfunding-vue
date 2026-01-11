import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    allowedHosts: ['unhued-tashia-beforehand.ngrok-free.app', 'localhost', '127.0.0.1'],
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://sdk.mercadopago.com https://*.chatwoot.com https://chatwoot.madygraf.com; style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http://localhost:5173; connect-src 'self' https://accounts.google.com https://api.mercadopago.com https://www.mercadolibre.com https://api.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com http://localhost:5000 http://127.0.0.1:5000; frame-src 'self' https://accounts.google.com https://www.mercadopago.com.ar https://www.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; object-src 'none'; base-uri 'self'; form-action 'self' https://www.mercadopago.com.ar;",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
    }
  },
})
