# TODO CI/CD deploy.yml

## Hecho
- [x] Hacer fail-fast real en deploy lftp (`set cmd:fail-exit true` y remover `|| echo` en `mirror`).
- [x] Validar `dist/index.html` y tamano minimo antes de publicar.
- [x] Versionar `.htaccess` en `public/.htaccess` y eliminar generacion inline en workflow.
- [x] Agregar `deploy-smoke` opcional con URL explicita (`DEPLOY_HEALTHCHECK_URL`).
- [x] Crear `build-validate` para validar solo variables de build.

## Pendiente

### Bloque Build
- [x] Separar pipeline en jobs de build y deploy, conectados por artifact inmutable.
- [x] Crear `build-typecheck` como job dedicado.
- [x] Crear `build-test` como job dedicado.
- [x] Crear `build-package` para generar `dist/` y subir artifact.
- [x] Evitar doble type-check en empaquetado (usar `npm run build-only` donde corresponda).

### Bloque Deploy
- [x] Crear `deploy-preflight` para validar vars/secrets FTP, resolver IPv4 y chequear puerto.
- [x] Crear `deploy-release` que consuma artifact y haga deploy.

### Hardening
- [ ] Pinnear actions por SHA para reducir riesgo de supply chain.
- [ ] Definir `environment: production` con protecciones (aprobacion/manual gates).
- [ ] Evaluar migracion de FTP plano a SFTP/FTPS.
- [ ] Reescribir el bloque heredoc de `.htaccess` para evitar advertencias del parser YAML local.
