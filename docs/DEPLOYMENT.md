# 🚀 Deployment Guide - Crowdfunding Vue

## Security Headers Configuration

### Content Security Policy (CSP) for Production

**IMPORTANT**: The Vite dev server (npm run dev) includes `'unsafe-inline'` for development convenience. **PRODUCTION must remove this** to maintain security.

#### Production CSP (STRICT - No unsafe-inline)

Configure your production server (Nginx, Apache, etc.) with this CSP header:

```
Content-Security-Policy: default-src 'self'; script-src 'self' blob: https://accounts.google.com https://sdk.mercadopago.com https://*.chatwoot.com https://chatwoot.madygraf.com; worker-src 'self' blob:; style-src 'self' https://accounts.google.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://secure.gravatar.com https://graph.facebook.com https://platform-lookaside.fbsbx.com https://i.pravatar.cc https://ui-avatars.com https://*.chatwoot.com https://chatwoot.madygraf.com https://www.mercadopago.com https://www.mercadopago.com.ar https://mercadopago.com https://www.mercadolibre.com https://mercadolibre.com https://*.mercadolibre.com https://www.mercadolibre.com.ar https://mercadolibre.com.ar https://*.mercadolibre.com.ar https://www.mercadolivre.com https://mercadolivre.com https://*.mercadolivre.com; connect-src 'self' https://accounts.google.com https://api.mercadopago.com https://www.mercadolibre.com https://api.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; frame-src 'self' https://accounts.google.com https://www.mercadopago.com.ar https://www.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; object-src 'none'; base-uri 'self'; form-action 'self' https://www.mercadopago.com.ar;
```

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security Headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' blob: https://accounts.google.com https://sdk.mercadopago.com https://*.chatwoot.com https://chatwoot.madygraf.com; worker-src 'self' blob:; style-src 'self' https://accounts.google.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://secure.gravatar.com https://graph.facebook.com https://platform-lookaside.fbsbx.com https://i.pravatar.cc https://ui-avatars.com https://*.chatwoot.com https://chatwoot.madygraf.com https://www.mercadopago.com https://www.mercadopago.com.ar https://mercadopago.com https://www.mercadolibre.com https://mercadolibre.com https://*.mercadolibre.com https://www.mercadolibre.com.ar https://mercadolibre.com.ar https://*.mercadolibre.com.ar https://www.mercadolivre.com https://mercadolivre.com https://*.mercadolivre.com; connect-src 'self' https://accounts.google.com https://api.mercadopago.com https://www.mercadolibre.com https://api.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; frame-src 'self' https://accounts.google.com https://www.mercadopago.com.ar https://www.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; object-src 'none'; base-uri 'self'; form-action 'self' https://www.mercadopago.com.ar;" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/javascript;

    # Root directory
    root /var/www/crowdfunding-vue/dist;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### Apache Configuration

```apache
<VirtualHost *:443>
    ServerName yourdomain.com

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    DocumentRoot /var/www/crowdfunding-vue/dist

    # Security Headers
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' blob: https://accounts.google.com https://sdk.mercadopago.com https://*.chatwoot.com https://chatwoot.madygraf.com; worker-src 'self' blob:; style-src 'self' https://accounts.google.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://secure.gravatar.com https://graph.facebook.com https://platform-lookaside.fbsbx.com https://i.pravatar.cc https://ui-avatars.com https://*.chatwoot.com https://chatwoot.madygraf.com https://www.mercadopago.com https://www.mercadopago.com.ar https://mercadopago.com https://www.mercadolibre.com https://mercadolibre.com https://*.mercadolibre.com https://www.mercadolibre.com.ar https://mercadolibre.com.ar https://*.mercadolibre.com.ar https://www.mercadolivre.com https://mercadolivre.com https://*.mercadolivre.com; connect-src 'self' https://accounts.google.com https://api.mercadopago.com https://www.mercadolibre.com https://api.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; frame-src 'self' https://accounts.google.com https://www.mercadopago.com.ar https://www.mercadolibre.com https://*.chatwoot.com https://chatwoot.madygraf.com; object-src 'none'; base-uri 'self'; form-action 'self' https://www.mercadopago.com.ar;"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"

    # Enable mod_rewrite for SPA routing
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>

    # Gzip compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css text/javascript application/javascript application/json
    </IfModule>

    # Cache headers for static assets
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "max-age=31536000, public, immutable"
    </FilesMatch>
</VirtualHost>

# HTTP redirect to HTTPS
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect / https://yourdomain.com/
</VirtualHost>
```

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_production_client_id.apps.googleusercontent.com
VITE_MERCADOPAGO_PUBLIC_KEY=your_production_key
```

**Never commit `.env.production` with real secrets to git!** Use your CI/CD system to inject secrets at deployment time.

## Build & Deployment

### 1. Build Production Bundle

```bash
npm run build
```

This creates a `dist/` directory optimized for production.

### 2. Deployment Steps

```bash
# Copy dist to server
scp -r dist/* user@server:/var/www/crowdfunding-vue/

# Or using a deployment tool (GitHub Actions, GitLab CI, etc.)
# See .github/workflows/deploy.yml for example
```

### 3. Verify Deployment

- [ ] Test all core flows (login, subscribe, payment)
- [ ] Check browser console for CSP violations (should be none!)
- [ ] Verify HTTPS is enforced
- [ ] Test API connectivity from production domain
- [ ] Confirm Google OAuth is working with production Client ID
- [ ] Test MercadoPago payment flow
- [ ] Monitor error tracking (if configured)

## Security Checklist

- [ ] CSP header set correctly (no `unsafe-inline` in production)
- [ ] HTTPS enforced (80 → 443 redirect)
- [ ] HSTS header enabled (optional, advanced)
- [ ] Secrets stored in CI/CD system, not in git
- [ ] API rate limiting configured on backend
- [ ] Database backups enabled
- [ ] Monitoring and alerting configured
- [ ] SSL certificate valid and not self-signed
- [ ] CORS properly configured on backend

## Common Issues

### "CSP violation" errors in production

**Cause**: Forgot to set CSP header on server
**Fix**: Add CSP header to Nginx/Apache config (see above)

### Static assets returning 404

**Cause**: Wrong DocumentRoot or routing misconfigured
**Fix**: Ensure DocumentRoot points to `dist/` directory and SPA routing is enabled

### API calls failing with CORS errors

**Cause**: Backend CORS policy doesn't include production domain
**Fix**: Update backend CORS configuration for `https://yourdomain.com`

### Google OAuth "origin not allowed"

**Cause**: Production domain not added to Google Cloud Console
**Fix**: 
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add production domain to "Authorized JavaScript origins"
4. Wait 1-2 minutes for changes to propagate

## Rollback Strategy

Keep previous version available:

```bash
# Before deploying new version
cp -r /var/www/crowdfunding-vue/dist /var/www/crowdfunding-vue/dist.backup

# If new version has issues
cp -r /var/www/crowdfunding-vue/dist.backup /var/www/crowdfunding-vue/dist
```

Or use blue-green deployment with two server instances.

## Performance Optimization

- Enable gzip compression (see Nginx/Apache configs)
- Use HTTP/2 for faster asset delivery
- Configure CDN for static assets (optional)
- Monitor bundle size: `npm run build -- --analyze`

## Monitoring

Set up monitoring for:
- Application uptime
- Error tracking (Sentry)
- User analytics
- API response times
- Certificate expiration alerts

---

**Last Updated**: January 11, 2026
**Version**: 1.0
