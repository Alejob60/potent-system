# 📱 Frontend Integration Prompt - Conexión con Meta Agent

## 🎯 Objetivo
Este documento proporciona instrucciones detalladas para conectar correctamente el frontend con el Front Desk Agent del sistema Misy Agent, asegurando que los mensajes se envíen y reciban exitosamente.

## 🏗️ Arquitectura de Comunicación

```
┌─────────────┐    HTTP POST    ┌────────────────────┐    WebSocket    ┌──────────────┐
│  Frontend   │ ──────────────► │  Front Desk Agent  │ ◄──────────────► │  Dashboard   │
│             │                 │                    │                 │              │
│  React/Next │                 │  /api/agents/front-│                 │ Real-time UI │
└─────────────┘                 │  desk              │                 └──────────────┘
                                └────────────────────┘
                                          │
                                          ▼
                                ┌────────────────────┐
                                │  Specialized Agent │
                                │  (video-scriptor,  │
                                │   post-scheduler,  │
                                │   etc.)            │
                                └────────────────────┘
```

## 📡 Endpoint de Conexión

### URL Base
```
http://localhost:3008/api
```

### Endpoint Principal
```
POST /api/agents/front-desk
```

## 📦 Estructura del Mensaje

### Request Body
```json
{
  "message": "Texto del mensaje del usuario",
  "context": {
    "sessionId": "identificador-único-de-sesión",
    "language": "es"
  }
}
```

### Ejemplo Completo
```json
{
  "message": "Quiero crear un video para TikTok sobre recetas saludables",
  "context": {
    "sessionId": "user-session-123",
    "language": "es"
  }
}
```

## 🚀 Implementación en Frontend

### 1. Instalación de Dependencias
```bash
npm install axios socket.io-client
```

### 2. Servicio de Comunicación
```javascript
// services/agentService.js
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3008/api';
const SOCKET_URL = 'http://localhost:3008';

class AgentService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  // Enviar mensaje al Front Desk Agent
  async sendMessage(message, context = {}) {
    try {
      const response = await this.api.post('/agents/front-desk', {
        message,
        context: {
          sessionId: context.sessionId || this.generateSessionId(),
          language: context.language || 'es',
          ...context
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error enviando mensaje al agente:', error);
      throw error;
    }
  }

  // Generar ID de sesión único
  generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Escuchar eventos en tiempo real
  onAgentUpdate(callback) {
    this.socket.on('agent_status_update', callback);
  }

  onTaskProgress(callback) {
    this.socket.on('task_progress', callback);
  }

  onSystemAlert(callback) {
    this.socket.on('system_alert', callback);
  }
}

export default new AgentService();
```

### 3. Componente de Chat
```jsx
// components/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import agentService from '../services/agentService';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generar sesión al cargar el componente
    const newSessionId = agentService.generateSessionId();
    setSessionId(newSessionId);
    
    // Configurar escuchadores de WebSocket
    agentService.onAgentUpdate((data) => {
      console.log('Actualización de agente:', data);
    });

    agentService.onTaskProgress((data) => {
      console.log('Progreso de tarea:', data);
    });

    // Limpiar al desmontar
    return () => {
      agentService.socket.close();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Enviar mensaje al agente
      const response = await agentService.sendMessage(inputMessage, {
        sessionId
      });
      
      // Agregar respuesta del agente
      const agentMessage = {
        id: Date.now() + 1,
        text: response.conversation.agentResponse,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: response.status,
        targetAgent: response.conversation.targetAgent,
        collectedInfo: response.conversation.collectedInfo,
        missingInfo: response.conversation.missingInfo
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        sender: 'agent',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Asistente de Contenido Viral</h2>
        <p>Sesión ID: {sessionId}</p>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              {message.sender === 'agent' && message.missingInfo && message.missingInfo.length > 0 && (
                <div className="missing-info">
                  <small>Información pendiente: {message.missingInfo.join(', ')}</small>
                </div>
              )}
            </div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message agent">
            <div className="message-content">
              <p>Escribiendo...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu mensaje aquí..."
          disabled={isLoading}
          rows="3"
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading || !inputMessage.trim()}
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
```

### 4. Estilos CSS
```css
/* styles/chat.css */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  background-color: #4a6cf7;
  color: white;
  padding: 1rem;
  text-align: center;
}

.chat-header h2 {
  margin: 0 0 0.5rem 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f5f7fb;
}

.message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 80%;
}

.message.user {
  background-color: #4a6cf7;
  color: white;
  margin-left: auto;
}

.message.agent {
  background-color: white;
  border: 1px solid #ddd;
  margin-right: auto;
}

.message.error {
  background-color: #ffebee;
  border-color: #f44336;
  color: #c62828;
}

.message-content p {
  margin: 0 0 0.5rem 0;
}

.missing-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fff3e0;
  border-radius: 4px;
  border-left: 3px solid #ff9800;
}

.message-timestamp {
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: right;
}

.input-container {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #ddd;
  background-color: white;
}

.input-container textarea {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  margin-right: 0.5rem;
}

.input-container button {
  padding: 0.75rem 1.5rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-container button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.input-container button:hover:not(:disabled) {
  background-color: #3a5cf0;
}
```

## 📊 Respuesta del Agente

### Estructura de Respuesta
```json
{
  "agent": "front-desk",
  "status": "clarification_needed", // o "ready"
  "conversation": {
    "userMessage": "Mensaje original del usuario",
    "agentResponse": "Respuesta generada por el agente",
    "objective": "generate_video", // o "schedule_post", "analyze_trends", etc.
    "targetAgent": "video-scriptor", // agente especializado asignado
    "collectedInfo": {
      "platform": "tiktok",
      "topic": "recetas saludables",
      "duration": "30s"
    },
    "missingInfo": ["narration", "subtitles"],
    "confidence": 0.9,
    "isComplete": false
  }
}
```

## 🔄 Flujo de Comunicación

1. **Inicio de Sesión**: El frontend genera un `sessionId` único
2. **Envío de Mensaje**: El usuario envía un mensaje al Front Desk Agent
3. **Procesamiento**: El agente analiza el mensaje y determina la intención
4. **Respuesta**: El agente responde con información recolectada y estado
5. **Iteración**: Si falta información, el agente solicita más detalles
6. **Asignación**: Cuando se completa la información, se asigna a un agente especializado

## 🛠️ Manejo de Errores

### Códigos de Error Comunes
- `400`: Solicitud mal formada
- `404`: Endpoint no encontrado
- `500`: Error interno del servidor
- `503`: Servicio no disponible

### Ejemplo de Manejo de Errores
```javascript
try {
  const response = await agentService.sendMessage(userMessage);
  // Procesar respuesta exitosa
} catch (error) {
  if (error.response) {
    // Error del servidor
    switch (error.response.status) {
      case 400:
        console.error('Solicitud mal formada');
        break;
      case 500:
        console.error('Error interno del servidor');
        break;
      default:
        console.error('Error desconocido:', error.response.data);
    }
  } else if (error.request) {
    // Error de red
    console.error('Error de conexión con el servidor');
  } else {
    // Error en la configuración
    console.error('Error en la solicitud:', error.message);
  }
}
```

## 🎨 Mejoras UX Recomendadas

1. **Indicadores de Carga**: Mostrar estado de "escribiendo" mientras se procesa
2. **Historial de Conversación**: Mantener historial de mensajes en la sesión
3. **Sugerencias Contextuales**: Mostrar sugerencias basadas en la intención detectada
4. **Validación en Tiempo Real**: Validar formato de mensajes antes de enviar
5. **Notificaciones**: Alertas para mensajes importantes o errores

## 🔐 Consideraciones de Seguridad

1. **CORS**: Configurar orígenes permitidos en el backend
2. **Validación**: Validar todos los inputs del usuario
3. **Rate Limiting**: Implementar límites de solicitudes
4. **Autenticación**: Considerar autenticación para usuarios registrados

## 🧪 Pruebas de Conexión

### Verificación del Endpoint
```bash
# Probar conexión básica
curl -X POST http://localhost:3008/api/agents/front-desk \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, quiero crear contenido viral",
    "context": {
      "sessionId": "test-session-123",
      "language": "es"
    }
  }'
```

### Verificación de Documentación
- Swagger UI: `http://localhost:3008/api-docs`
- Documentación de endpoints del Front Desk Agent

## 📞 Soporte y Depuración

### Logs Relevantes
- Verificar consola del backend para errores
- Revisar respuesta del endpoint en herramientas como Postman
- Confirmar que el puerto 3008 esté disponible

### Problemas Comunes
1. **Conexión Rechazada**: Verificar que el backend esté corriendo
2. **CORS**: Configurar orígenes permitidos en `main.ts`
3. **Timeout**: Aumentar timeout en cliente HTTP si es necesario

Este prompt proporciona todas las instrucciones necesarias para conectar exitosamente el frontend con el Front Desk Agent del sistema Misy Agent.