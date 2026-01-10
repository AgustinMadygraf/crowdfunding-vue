<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-info">
        <div class="footer-logo">
          <img alt="Madygraf logo" src="@/assets/logo.svg" width="80" />
          <p>Cooperativa de Trabajo Madygraf</p>
        </div>
        <div class="footer-links">
          <h4>Documentos</h4>
          <ul>
            <li><a href="#">Términos y Condiciones</a></li>
            <li><a href="#">Política de Privacidad</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <h4>Contacto</h4>
          <p>Email: info@madypack.com.ar</p>
          <div class="social-links">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="LinkedIn">LI</a>
          </div>
        </div>
      </div>
      <div class="copyright">
        <p>&copy; 2025 Cooperativa de Trabajo Madygraf. Todos los derechos reservados.</p>
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
