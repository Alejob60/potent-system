# 🔐 OAuth Integration Guide - Complete Social Media & Service Connections

## 📋 **Plataformas Soportadas**

### **Redes Sociales**
- ✅ **Instagram** - Publicación de posts, stories, reels
- ✅ **Facebook** - Posts en páginas y perfiles
- ✅ **LinkedIn** - Posts profesionales y contenido
- ✅ **Twitter/X** - Tweets y hilos
- ✅ **YouTube** - Subida y gestión de videos

### **Servicios de Productividad**
- ✅ **Google** - Gmail, Drive, Calendar
- ✅ **Microsoft** - Outlook, OneDrive, Calendar

### **Servicios Específicos**
- ✅ **Google Calendar** - Gestión completa de calendarios
- ✅ **Microsoft Calendar** - Calendarios de Outlook
- ✅ **Gmail** - Envío de emails
- ✅ **Outlook** - Envío de emails

## 🚀 **Endpoints Disponibles**

### **1. Gestión de Plataformas**

#### **Obtener Plataformas Disponibles**
```bash
GET /api/oauth/platforms

Response:
{
  "platforms": ["instagram", "facebook", "google", "microsoft", ...],
  "categories": {
    "social": ["instagram", "facebook", "linkedin", "twitter"],
    "video": ["youtube"],
    "productivity": ["google", "microsoft"],
    "calendar": ["google-calendar", "microsoft-calendar"],
    "email": ["google", "microsoft"]
  }
}
```

### **2. Conexión OAuth**

#### **Iniciar Conexión OAuth**
```bash
POST /api/oauth/connect/:platform
Content-Type: application/json

Body:
{
  "sessionId": "user-session-123",
  "redirectUrl": "http://your-frontend.com/oauth-success" // opcional
}

Response:
{
  "success": true,
  "authUrl": "https://platform.com/oauth/authorize?...",
  "state": "user-session-123_instagram_1234567890",
  "platform": "instagram",
  "message": "Please visit the auth URL to connect your instagram account"
}
```

#### **Callback OAuth (automático)**
```bash
GET /api/oauth/callback/:platform?code=AUTH_CODE&state=SESSION_STATE

# Este endpoint se llama automáticamente por la plataforma
# No necesitas llamarlo manualmente
```

### **3. Gestión de Cuentas Conectadas**

#### **Obtener Cuentas Conectadas**
```bash
GET /api/oauth/accounts/:sessionId

Response:
{
  "accounts": [
    {
      "id": "instagram_123456789",
      "platform": "instagram",
      "name": "@mi_cuenta_insta",
      "email": "mi_cuenta_insta@instagram.com",
      "avatar": "https://...",
      "accountType": "social",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "scope": ["user_profile", "user_media"],
      "isExpired": false
    }
  ],
  "total": 1
}
```

#### **Desconectar Cuenta**
```bash
POST /api/oauth/disconnect
Content-Type: application/json

Body:
{
  "sessionId": "user-session-123",
  "accountId": "instagram_123456789"
}

Response:
{
  "success": true,
  "message": "Successfully disconnected instagram account"
}
```

#### **Renovar Token**
```bash
POST /api/oauth/refresh/:accountId
Content-Type: application/json

Body:
{
  "sessionId": "user-session-123"
}

Response:
{
  "success": true,
  "message": "Successfully refreshed instagram token",
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

## 📧 **Integración de Email**

### **Enviar Email**
```bash
POST /api/integrations/email/send
Content-Type: application/json

Body:
{
  "sessionId": "user-session-123",
  "provider": "google", // "google" o "microsoft"
  "message": {
    "to": ["destinatario@email.com"],
    "cc": ["copia@email.com"],
    "bcc": ["copia_oculta@email.com"],
    "subject": "Asunto del email",
    "body": "Contenido del email en texto plano o HTML",
    "isHtml": true,
    "attachments": [
      {
        "filename": "documento.pdf",
        "content": "base64_encoded_content",
        "contentType": "application/pdf"
      }
    ]
  }
}

Response:
{
  "success": true,
  "messageId": "gmail_message_id_12345",
  "message": "Email sent successfully"
}
```

## 📅 **Integración de Calendario**

### **Crear Evento de Calendario**
```bash
POST /api/integrations/calendar/create-event
Content-Type: application/json

Body:
{
  "sessionId": "user-session-123",
  "provider": "google-calendar", // "google-calendar" o "microsoft-calendar"
  "event": {
    "title": "Reunión importante",
    "description": "Descripción del evento",
    "startTime": "2024-03-15T10:00:00.000Z",
    "endTime": "2024-03-15T11:00:00.000Z",
    "location": "Oficina principal",
    "attendees": ["asistente1@email.com", "asistente2@email.com"],
    "isAllDay": false,
    "recurrence": {
      "frequency": "weekly", // "daily", "weekly", "monthly", "yearly"
      "interval": 1,
      "until": "2024-06-15T10:00:00.000Z"
    }
  }
}

Response:
{
  "success": true,
  "eventId": "calendar_event_id_12345",
  "eventUrl": "https://calendar.google.com/event?eid=...",
  "message": "Calendar event created successfully"
}
```

## 📱 **Publicación en Redes Sociales**

### **Publicar en Redes Sociales**
```bash
POST /api/integrations/social/post/:platform
Content-Type: application/json

# Plataformas: instagram, facebook, linkedin, twitter

Body:
{
  "sessionId": "user-session-123",
  "content": {
    "text": "Contenido del post #hashtag",
    "imageUrls": ["https://example.com/image1.jpg"],
    "videoUrls": ["https://example.com/video1.mp4"]
  }
}

Response:
{
  "success": true,
  "postId": "platform_post_id_12345",
  "message": "Posted successfully to instagram",
  "result": {
    // Respuesta específica de la plataforma
  }
}
```

## 🎥 **Subida a YouTube**

### **Subir Video a YouTube**
```bash
POST /api/integrations/youtube/upload
Content-Type: application/json

Body:
{
  "sessionId": "user-session-123",
  "videoData": {
    "title": "Título del video",
    "description": "Descripción del video",
    "videoFile": "base64_encoded_video_content",
    "tags": ["tag1", "tag2", "marketing"]
  }
}

Response:
{
  "success": true,
  "videoId": "youtube_video_id_12345",
  "videoUrl": "https://www.youtube.com/watch?v=youtube_video_id_12345",
  "message": "Video uploaded successfully to YouTube"
}
```

## 🔄 **Integración con WebSocket**

El sistema envía actualizaciones en tiempo real via WebSocket:

```javascript
const socket = io('http://localhost:3007');

// Conectar a la sesión
socket.emit('join_session', { sessionId: 'user-session-123' });

// Escuchar eventos OAuth
socket.on('oauth_initiated', (data) => {
  console.log('OAuth iniciado:', data);
  // { platform: 'instagram', authUrl: '...', message: '...' }
});

socket.on('oauth_success', (data) => {
  console.log('OAuth exitoso:', data);
  // { platform: 'instagram', account: {...}, message: '...' }
});

socket.on('oauth_error', (data) => {
  console.log('Error OAuth:', data);
  // { platform: 'instagram', error: '...', message: '...' }
});

socket.on('oauth_disconnected', (data) => {
  console.log('Cuenta desconectada:', data);
});
```

## 🌐 **Flujo Frontend Completo**

### **1. HTML/JavaScript para OAuth Popup**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Conectar Redes Sociales</title>
</head>
<body>
    <div id="platforms"></div>

    <script>
        const sessionId = 'user-session-123';
        const API_BASE = 'http://localhost:3007/api';

        // Cargar plataformas disponibles
        async function loadPlatforms() {
            const response = await fetch(`${API_BASE}/oauth/platforms`);
            const data = await response.json();
            
            const container = document.getElementById('platforms');
            data.platforms.forEach(platform => {
                const button = document.createElement('button');
                button.textContent = `Conectar ${platform}`;
                button.onclick = () => connectPlatform(platform);
                container.appendChild(button);
            });
        }

        // Conectar plataforma
        async function connectPlatform(platform) {
            try {
                const response = await fetch(`${API_BASE}/oauth/connect/${platform}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Abrir popup OAuth
                    const popup = window.open(
                        data.authUrl,
                        `oauth_${platform}`,
                        'width=600,height=700,scrollbars=yes,resizable=yes'
                    );
                    
                    // Escuchar respuesta del popup
                    window.addEventListener('message', function(event) {
                        if (event.data.type === 'oauth_success') {
                            console.log('Conexión exitosa:', event.data);
                            popup.close();
                            loadConnectedAccounts();
                        } else if (event.data.type === 'oauth_error') {
                            console.error('Error de conexión:', event.data);
                            popup.close();
                        }
                    });
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        // Cargar cuentas conectadas
        async function loadConnectedAccounts() {
            const response = await fetch(`${API_BASE}/oauth/accounts/${sessionId}`);
            const data = await response.json();
            console.log('Cuentas conectadas:', data.accounts);
        }

        // Inicializar
        loadPlatforms();
        loadConnectedAccounts();
    </script>
</body>
</html>
```

### **2. React/Vue Component Example**
```javascript
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function SocialConnections() {
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [socket, setSocket] = useState(null);
  const sessionId = 'user-session-123';

  useEffect(() => {
    // Conectar WebSocket
    const ws = io('http://localhost:3007');
    ws.emit('join_session', { sessionId });
    
    // Escuchar eventos
    ws.on('oauth_success', (data) => {
      console.log('OAuth exitoso:', data);
      loadConnectedAccounts();
    });
    
    setSocket(ws);
    loadConnectedAccounts();
    
    return () => ws.disconnect();
  }, []);

  const connectPlatform = async (platform) => {
    try {
      const response = await fetch('/api/oauth/connect/' + platform, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.open(data.authUrl, '_blank', 'width=600,height=700');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadConnectedAccounts = async () => {
    const response = await fetch(`/api/oauth/accounts/${sessionId}`);
    const data = await response.json();
    setConnectedAccounts(data.accounts);
  };

  return (
    <div>
      <h2>Conectar Redes Sociales</h2>
      
      <div>
        <button onClick={() => connectPlatform('instagram')}>
          Conectar Instagram
        </button>
        <button onClick={() => connectPlatform('facebook')}>
          Conectar Facebook
        </button>
        <button onClick={() => connectPlatform('google')}>
          Conectar Google
        </button>
        <button onClick={() => connectPlatform('microsoft')}>
          Conectar Microsoft
        </button>
      </div>

      <h3>Cuentas Conectadas</h3>
      {connectedAccounts.map(account => (
        <div key={account.id}>
          <strong>{account.platform}</strong>: {account.name}
          <button onClick={() => disconnectAccount(account.id)}>
            Desconectar
          </button>
        </div>
      ))}
    </div>
  );
}
```

## ⚙️ **Configuración de Aplicaciones OAuth**

### **Instagram**
1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Crear app → Agregar Instagram Basic Display
3. Configurar Redirect URI: `http://localhost:3007/api/oauth/callback/instagram`

### **Facebook**
1. Mismo proceso que Instagram
2. Agregar Login with Facebook
3. Configurar permisos: `pages_manage_posts`, `pages_read_engagement`

### **Google (YouTube, Gmail, Calendar)**
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto → Habilitar APIs (YouTube, Gmail, Calendar)
3. Crear credenciales OAuth 2.0
4. Redirect URI: `http://localhost:3007/api/oauth/callback/google`

### **Microsoft (Outlook, Calendar)**
1. Ir a [Azure Portal](https://portal.azure.com/)
2. Azure Active Directory → App registrations
3. Configurar permisos: `Mail.Send`, `Calendars.ReadWrite`
4. Redirect URI: `http://localhost:3007/api/oauth/callback/microsoft`

### **LinkedIn**
1. Ir a [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Crear app → Configurar OAuth
3. Redirect URI: `http://localhost:3007/api/oauth/callback/linkedin`

### **Twitter/X**
1. Ir a [Twitter Developer Portal](https://developer.twitter.com/)
2. Crear app → Configurar OAuth 2.0
3. Redirect URI: `http://localhost:3007/api/oauth/callback/twitter`

## 🔒 **Seguridad y Mejores Prácticas**

1. **Tokens Seguros**: Los tokens se almacenan temporalmente en memoria y se auto-renuevan
2. **HTTPS en Producción**: Usar HTTPS para todos los redirects OAuth
3. **Scopes Mínimos**: Solo solicitar permisos necesarios
4. **Validación de State**: Protección contra ataques CSRF
5. **Expiración de Tokens**: Manejo automático de tokens expirados
6. **Rate Limiting**: Implementar límites de API según plataforma

## 🚀 **Testing de la Integración**

```bash
# 1. Iniciar servidor
npm run start:dev

# 2. Probar obtener plataformas
curl http://localhost:3007/api/oauth/platforms

# 3. Iniciar OAuth (necesita frontend para completar)
curl -X POST http://localhost:3007/api/oauth/connect/google \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-session-123"}'

# 4. Ver cuentas conectadas
curl http://localhost:3007/api/oauth/accounts/test-session-123
```

**¡Tu sistema OAuth está completo y listo para conectar todas las plataformas principales!** 🎉