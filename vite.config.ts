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
      // CSP para desarrollo: permite unsafe-inline para Vite dev tools y hot reload
      'Content-Security-Policy': process.env.NODE_ENV === 'production'
        ? "default-src 'self'; script-src 'self' blob: https://accounts.google.com https://sdk.mercadopago.com https://*.chatwoot.com https://chatwoot.madygraf.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://secure.gravatar.com https://graph.facebook.com https://platform-lookaside.fbsbx.com https://i.pravatar.cc https://ui-avatars.com https://*.chatwoot.com https://chatwoot.madygraf.com https://www.mercadopago.com https://www.mercadopago.com.ar https://mercadopago.com https://www.mercadolibre.com https://mercadolibre.com https://*.mercadolibre.com https://www.mercadolibre.com.ar https://mercadolibre.com.ar https://*.mercadolibre.com.ar https://www.mercadolivre.com https://mercadolivre.com https://*.mercadolivre.com http://localhost:5173; connect-src 'self' https://accounts.google.com https://api.mercadopago.com https://www.mercadolibre.com https://api.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com http://localhost:5000 http://127.0.0.1:5000 ws://localhost:5173 ws://127.0.0.1:5173; frame-src 'self' https://accounts.google.com https://www.mercadopago.com.ar https://www.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; object-src 'none'; base-uri 'self'; form-action 'self' https://www.mercadopago.com.ar;"
        : "default-src 'self'; script-src 'self' 'unsafe-inline' blob: https://accounts.google.com https://sdk.mercadopago.com https://*.chatwoot.com https://chatwoot.madygraf.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://secure.gravatar.com https://graph.facebook.com https://platform-lookaside.fbsbx.com https://i.pravatar.cc https://ui-avatars.com https://*.chatwoot.com https://chatwoot.madygraf.com https://www.mercadopago.com https://www.mercadopago.com.ar https://mercadopago.com https://www.mercadolibre.com https://mercadolibre.com https://*.mercadolibre.com https://www.mercadolibre.com.ar https://mercadolibre.com.ar https://*.mercadolibre.com.ar https://www.mercadolivre.com https://mercadolivre.com https://*.mercadolivre.com http://localhost:5173; connect-src 'self' https://accounts.google.com https://api.mercadopago.com https://www.mercadolibre.com https://api.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com http://localhost:5000 http://127.0.0.1:5000 ws://localhost:5173 ws://127.0.0.1:5173; frame-src 'self' https://accounts.google.com https://www.mercadopago.com.ar https://www.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; object-src 'none'; base-uri 'self'; form-action 'self' https://www.mercadopago.com.ar;",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
    }
  },
  build: {
    // En production, el servidor debe servir CSP sin unsafe-inline
    // Ver docs/DEPLOYMENT.md para configuración de headers en Nginx/Apache
  }
})
