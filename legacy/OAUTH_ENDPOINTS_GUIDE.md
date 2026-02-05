# Guía Completa de Endpoints OAuth

## 🎯 Resumen
Sistema OAuth completo para conexión con múltiples plataformas: Instagram, YouTube, Facebook, Google, Microsoft, calendarios y email.

## 📋 Plataformas Soportadas

### Redes Sociales
- **Instagram** - Publicación de fotos y stories
- **Facebook** - Publicación en páginas y perfiles
- **YouTube** - Subida de videos y gestión de canal

### Servicios Productividad
- **Google** - Gmail, Google Calendar, Google Drive
- **Microsoft** - Outlook, Microsoft Calendar, OneDrive

### Funcionalidades Específicas
- **Envío de Emails** - Gmail y Outlook
- **Gestión de Calendarios** - Google Calendar y Microsoft Calendar
- **Publicación Automática** - Todas las redes sociales

## 🔗 Endpoints OAuth Principales

### 1. Listar Plataformas Disponibles
```http
GET /api/oauth/platforms
```
**Respuesta:**
```json
{
  "platforms": [
    "instagram", "facebook", "youtube", 
    "google", "microsoft", 
    "google-calendar", "microsoft-calendar"
  ]
}
```

### 2. Iniciar Conexión OAuth
```http
POST /api/oauth/connect/:platform
```
**Body:**
```json
{
  "sessionId": "user-session-123",
  "redirectUrl": "http://localhost:3000/oauth-success"
}
```
**Respuesta:**
```json
{
  "authUrl": "https://accounts.google.com/oauth/authorize?client_id=...",
  "state": "random-state-string"
}
```

### 3. Callback OAuth (Automático)
```http
GET /api/oauth/callback/:platform?code=AUTH_CODE&state=STATE
```

### 4. Listar Cuentas Conectadas
```http
GET /api/oauth/accounts/:sessionId
```
**Respuesta:**
```json
{
  "accounts": [
    {
      "id": "account-id-1",
      "platform": "google",
      "email": "usuario@gmail.com",
      "connectedAt": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  ]
}
```

### 5. Desconectar Cuenta
```http
POST /api/oauth/disconnect
```
**Body:**
```json
{
  "sessionId": "user-session-123",
  "accountId": "account-id-1"
}
```

## 📧 Endpoints de Integración

### Envío de Emails
```http
POST /api/integrations/email/send
```
**Body:**
```json
{
  "sessionId": "user-session-123",
  "provider": "google",
  "message": {
    "to": ["destinatario@email.com"],
    "cc": ["copia@email.com"],
    "subject": "Asunto del email",
    "body": "Contenido del mensaje",
    "isHtml": true
  }
}
```

### Crear Evento en Calendario
```http
POST /api/integrations/calendar/create-event
```
**Body:**
```json
{
  "sessionId": "user-session-123",
  "provider": "google-calendar",
  "event": {
    "title": "Reunión importante",
    "description": "Descripción del evento",
    "startTime": "2024-01-20T15:00:00Z",
    "endTime": "2024-01-20T16:00:00Z",
    "location": "Sala de conferencias",
    "attendees": ["invitado@email.com"]
  }
}
```

### Publicar en Redes Sociales
```http
POST /api/integrations/social/post/:platform
```
**Body:**
```json
{
  "sessionId": "user-session-123",
  "content": {
    "text": "¡Nuevo post en mi red social!",
    "imageUrl": "https://ejemplo.com/imagen.jpg",
    "scheduledTime": "2024-01-20T18:00:00Z"
  }
}
```

### Subir Video a YouTube
```http
POST /api/integrations/youtube/upload
```
**Body:**
```json
{
  "sessionId": "user-session-123",
  "video": {
    "title": "Mi nuevo video",
    "description": "Descripción del video",
    "videoUrl": "https://ejemplo.com/video.mp4",
    "thumbnailUrl": "https://ejemplo.com/thumbnail.jpg",
    "tags": ["tutorial", "tecnologia"],
    "privacy": "public"
  }
}
```

## 🔧 Configuración Requerida

### Variables de Entorno (.env)
```env
# Instagram
INSTAGRAM_CLIENT_ID=tu_instagram_client_id
INSTAGRAM_CLIENT_SECRET=tu_instagram_client_secret

# Facebook
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret

# YouTube/Google
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Microsoft
MICROSOFT_CLIENT_ID=tu_microsoft_client_id
MICROSOFT_CLIENT_SECRET=tu_microsoft_client_secret

# URLs de Callback
OAUTH_REDIRECT_BASE_URL=http://localhost:3007/api/oauth/callback
```

## 📱 Flujo de Uso Típico

### 1. Conectar Cuenta
1. Frontend llama a `POST /api/oauth/connect/google`
2. Usuario es redirigido a la URL de autorización
3. Usuario autoriza la aplicación
4. Sistema recibe callback y almacena tokens
5. WebSocket notifica éxito de conexión

### 2. Enviar Email
1. Frontend llama a `POST /api/integrations/email/send`
2. Sistema verifica cuenta conectada
3. Usa token de acceso para enviar email via Gmail API
4. Retorna confirmación de envío

### 3. Publicar en Redes Sociales
1. Frontend llama a `POST /api/integrations/social/post/instagram`
2. Sistema verifica cuenta de Instagram conectada
3. Publica contenido usando Instagram API
4. WebSocket notifica resultado de publicación

## 🔄 Gestión Automática de Tokens

El sistema incluye:
- **Refresh automático** de tokens expirados
- **Reintento automático** en caso de fallo de token
- **Notificaciones WebSocket** para cambios de estado
- **Almacenamiento seguro** en base de datos

## ⚡ Notificaciones en Tiempo Real

Todos los eventos OAuth se notifican via WebSocket:
```json
{
  "type": "oauth_connected",
  "data": {
    "platform": "google",
    "email": "usuario@gmail.com",
    "sessionId": "user-session-123"
  }
}
```

## 🔒 Seguridad

- Tokens almacenados de forma segura
- State parameter para prevenir CSRF
- Validación de redirect URLs
- Cifrado de datos sensibles
- Expiración automática de sesiones

## 🚀 Estado Actual

✅ **Sistema completamente implementado y funcional**
✅ **Todas las dependencias resueltas**
✅ **Endpoints mapeados correctamente**
✅ **Integración WebSocket funcionando**
✅ **Manejo de errores implementado**

El sistema está listo para uso en producción con todas las plataformas solicitadas.