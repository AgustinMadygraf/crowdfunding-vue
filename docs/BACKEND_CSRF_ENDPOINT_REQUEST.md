# 🔧 Solicitud al Equipo Backend: Endpoint CSRF

## Resumen Ejecutivo

El frontend necesita un endpoint dedicado para obtener el token CSRF al inicializar la aplicación.

## Endpoint Requerido

```http
GET /api/csrf-token
```

### Response Esperado

**Status:** 200 OK

**Headers:**
```
X-CSRF-Token: d0ef37862aaba611418a...
Set-Cookie: XSRF-TOKEN=d0ef37862aaba611418a...; Path=/; SameSite=Lax
```

**Body (opcional):**
```json
{
  "token": "d0ef37862aaba611418a..."
}
```

## Implementación Sugerida (Flask)

```python
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """
    Endpoint para obtener el token CSRF
    El frontend lo solicita al inicializar la aplicación
    """
    # Obtener o crear token en sesión
    csrf_token = CsrfService.get_or_create_token(session)
    
    # Crear response
    response = jsonify({'token': csrf_token})
    
    # Enviar token en cookie (para lectura JS)
    response.set_cookie(
        'XSRF-TOKEN',
        csrf_token,
        httponly=False,  # Permitir lectura desde JavaScript
        secure=True,     # Solo HTTPS en producción
        samesite='Lax'
    )
    
    # Enviar también en header
    response.headers['X-CSRF-Token'] = csrf_token
    
    return response
```

## Beneficios

1. **Endpoint dedicado:** Propósito claro y específico
2. **Sin side-effects:** No carga datos innecesarios (contributions, etc.)
3. **Performance:** Response mínima (solo token)
4. **Separación de concerns:** CSRF independiente de lógica de negocio
5. **Estándar REST:** Siguiendo convenciones HTTP

## Estado Actual (Workaround)

Actualmente el frontend solicita el token de:
```
GET /api/contributions?_csrf_init=1
```

**Funciona** pero es un workaround:
- Carga datos de contribuciones innecesariamente
- Mezcla CSRF con lógica de negocio
- Response más pesada de lo necesario

## Testing del Nuevo Endpoint

```bash
# Request
curl -i http://localhost:5000/api/csrf-token \
  -X GET \
  -H "Accept: application/json"

# Expected Response
HTTP/1.1 200 OK
Set-Cookie: XSRF-TOKEN=abc123...; Path=/; SameSite=Lax
X-CSRF-Token: abc123...
Content-Type: application/json

{"token": "abc123..."}
```

## Prioridad

**Media** - El workaround actual funciona, pero el endpoint dedicado es más limpio y eficiente.

## Contacto

Frontend implementará el endpoint automáticamente cuando esté disponible (con fallback al método actual).

---

**Fecha:** 2026-01-11  
**Equipo:** Frontend Security Team
