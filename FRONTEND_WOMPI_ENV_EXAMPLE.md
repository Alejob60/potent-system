# Ejemplo de Configuración de Variables de Entorno para Integración Wompi

## Archivo .env de Ejemplo

Este archivo muestra las variables de entorno necesarias para la integración de pagos Wompi en el frontend de ColombiaTIC.

```bash
# === CONFIGURACIÓN GENERAL DEL FRONTEND ===
# URL base de la API del Meta-Agent
REACT_APP_API_URL=http://localhost:3007/api

# URL de retorno después del checkout de Wompi
REACT_APP_WOMPI_REDIRECT_URL=http://localhost:3000/checkout/return

# === CONFIGURACIÓN DE PAGOS ===
# Habilitar modo de pagos simulados para desarrollo
REACT_APP_USE_MOCK_PAYMENTS=false

# === AUTENTICACIÓN ===
# Duración del token de autenticación en minutos
REACT_APP_AUTH_TOKEN_EXPIRATION=60

# === CONFIGURACIÓN DE RED ===
# Timeout para requests HTTP en milisegundos
REACT_APP_HTTP_TIMEOUT=15000

# Número de reintentos para requests fallidos
REACT_APP_HTTP_RETRY_ATTEMPTS=3

# === MONITOREO DE PAGOS ===
# Intervalo de monitoreo del estado de pago en milisegundos
REACT_APP_PAYMENT_STATUS_POLL_INTERVAL=3000

# Número máximo de intentos de monitoreo
REACT_APP_PAYMENT_STATUS_MAX_ATTEMPTS=20

# === CONFIGURACIÓN DE SEGURIDAD ===
# Habilitar modo estricto de CSP (Content Security Policy)
REACT_APP_STRICT_CSP=true
```

## Descripción de Variables

### REACT_APP_API_URL
- **Valor por defecto**: `http://localhost:3007/api`
- **Descripción**: URL base del API del Meta-Agent donde se encuentran los endpoints de pago
- **Uso en producción**: Debe apuntar al dominio de producción

### REACT_APP_WOMPI_REDIRECT_URL
- **Valor por defecto**: `http://localhost:3000/checkout/return`
- **Descripción**: URL a la que Wompi redirige después de completar el checkout
- **Importante**: Debe coincidir con la configuración en el dashboard de Wompi

### REACT_APP_USE_MOCK_PAYMENTS
- **Valores posibles**: `true` o `false`
- **Valor por defecto**: `false`
- **Descripción**: 
  - `true`: Usa pagos simulados para desarrollo/testing
  - `false`: Conecta al API real de Wompi
- **Uso en desarrollo**: Útil para pruebas sin procesar pagos reales

### REACT_APP_AUTH_TOKEN_EXPIRATION
- **Valor por defecto**: `60`
- **Descripción**: Duración del token JWT en minutos
- **Consideraciones**: Ajustar según políticas de seguridad del sistema

### REACT_APP_HTTP_TIMEOUT
- **Valor por defecto**: `15000`
- **Descripción**: Tiempo máximo de espera para requests HTTP en milisegundos
- **Optimización**: Ajustar según latencia esperada de la red

### REACT_APP_HTTP_RETRY_ATTEMPTS
- **Valor por defecto**: `3`
- **Descripción**: Número de reintentos para requests HTTP fallidos
- **Balance**: Más reintentos = mayor tolerancia a fallos pero peor experiencia de usuario

### REACT_APP_PAYMENT_STATUS_POLL_INTERVAL
- **Valor por defecto**: `3000`
- **Descripción**: Intervalo entre verificaciones del estado del pago en milisegundos
- **Consideraciones**: 
  - Valores muy bajos pueden sobrecargar el servidor
  - Valores muy altos pueden retrasar la actualización del estado

### REACT_APP_PAYMENT_STATUS_MAX_ATTEMPTS
- **Valor por defecto**: `20`
- **Descripción**: Número máximo de intentos de monitoreo del estado del pago
- **Cálculo**: Con intervalo de 3 segundos, esto da aproximadamente 1 minuto de monitoreo

### REACT_APP_STRICT_CSP
- **Valores posibles**: `true` o `false`
- **Valor por defecto**: `true`
- **Descripción**: Habilita políticas estrictas de seguridad de contenido
- **Recomendación**: Siempre `true` en producción

## Configuración por Entorno

### Desarrollo Local (.env.development)
```bash
REACT_APP_API_URL=http://localhost:3007/api
REACT_APP_WOMPI_REDIRECT_URL=http://localhost:3000/checkout/return
REACT_APP_USE_MOCK_PAYMENTS=true
REACT_APP_HTTP_TIMEOUT=15000
REACT_APP_PAYMENT_STATUS_POLL_INTERVAL=2000
```

### Staging (.env.staging)
```bash
REACT_APP_API_URL=https://staging-api.colombiatic.com/api
REACT_APP_WOMPI_REDIRECT_URL=https://staging.colombiatic.com/checkout/return
REACT_APP_USE_MOCK_PAYMENTS=false
REACT_APP_STRICT_CSP=true
```

### Producción (.env.production)
```bash
REACT_APP_API_URL=https://api.colombiatic.com/api
REACT_APP_WOMPI_REDIRECT_URL=https://colombiatic.com/checkout/return
REACT_APP_USE_MOCK_PAYMENTS=false
REACT_APP_STRICT_CSP=true
REACT_APP_HTTP_TIMEOUT=10000
```

## Consideraciones de Seguridad

1. **Nunca commitear archivos .env**: Usar .env.example como plantilla
2. **Variables sensibles**: Las claves de API deben manejarse en el backend
3. **HTTPS en producción**: Asegurar que todas las comunicaciones sean seguras
4. **Validación de entradas**: Siempre validar datos antes de enviar al backend

## Troubleshooting

### Problemas Comunes

1. **"API no accesible"**
   - Verificar que REACT_APP_API_URL esté correctamente configurada
   - Asegurar que el servidor del Meta-Agent esté corriendo

2. **"Pagos no funcionan en producción"**
   - Verificar que REACT_APP_USE_MOCK_PAYMENTS=false
   - Confirmar que las credenciales de Wompi estén configuradas en el backend

3. **"Timeout en requests"**
   - Aumentar REACT_APP_HTTP_TIMEOUT
   - Verificar conectividad de red

4. **"Estado del pago no se actualiza"**
   - Verificar REACT_APP_PAYMENT_STATUS_POLL_INTERVAL
   - Confirmar que los webhooks de Wompi estén correctamente configurados

## Mejores Prácticas

1. **Versionar .env.example**: Mantener actualizado con nuevas variables
2. **Documentar cambios**: Explicar propósito de nuevas variables
3. **Usar valores por defecto razonables**: Facilitar la configuración inicial
4. **Separar por entorno**: Diferentes configuraciones para dev, staging, prod
5. **Validar en tiempo de compilación**: Verificar variables requeridas