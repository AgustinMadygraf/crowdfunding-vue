# TODO CI/CD deploy.yml

## Hecho
- [x] Hacer fail-fast real en deploy lftp (`set cmd:fail-exit true` y remover `|| echo` en `mirror`).

## Pendiente

### Bloque Build
- [ ] Separar pipeline en jobs de build y deploy, conectados por artifact inmutable.
- [ ] Crear `build-validate` para validar solo variables de build.
- [ ] Crear `build-typecheck` como job dedicado.
- [ ] Crear `build-test` como job dedicado.
- [ ] Crear `build-package` para generar `dist/` y subir artifact.
- [ ] Evitar doble type-check en empaquetado (usar `npm run build-only` donde corresponda).

### Bloque Deploy
- [ ] Crear `deploy-preflight` para validar vars/secrets FTP, resolver IPv4 y chequear puerto.
- [ ] Crear `deploy-release` que consuma artifact y haga deploy.
- [ ] Agregar `deploy-smoke` opcional con URL explicita (`DEPLOY_HEALTHCHECK_URL`).
- [ ] Versionar `.htaccess` en `public/.htaccess` y eliminar generacion inline en workflow.
- [ ] Validar `dist/index.html` y tamano minimo antes de publicar.

### Hardening
- [ ] Pinnear actions por SHA para reducir riesgo de supply chain.
- [ ] Definir `environment: production` con protecciones (aprobacion/manual gates).
- [ ] Evaluar migracion de FTP plano a SFTP/FTPS.
- [ ] Reescribir el bloque heredoc de `.htaccess` para evitar advertencias del parser YAML local.
