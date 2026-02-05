# 🤖 Guía Definitiva de Integración: Frontend ↔ Meta-Agente V2

Esta guía detalla los payloads exactos y las estructuras de datos necesarias para la comunicación entre el Frontend y los servicios del Meta-Agente.

## 1. Configuración de Red
- **Base URL:** `http://localhost:3007/api`
- **Autenticación:** Todos los endpoints (excepto `/health`) requieren un JWT en el header:  
  `Authorization: Bearer <TU_JWT_TOKEN>`

---

## 2. Servicio de Secretaría (Secretary)
Este es el agente personal que orquestador de tareas.

### Enviar Comando
- **Endpoint:** `POST /api/secretary/command`
- **Payload (Request Body):**
```json
{
  "input": {
    "text": "¿Cómo va mi campaña de video?",
    "channel": "web",
    "sessionId": "sesion_123",
    "metadata": {
      "key": "value"
    }
  }
}
```

### Recibir Respuesta (Estructura Unificada)
```json
{
  "response": "Estoy analizando tu campaña de video ahora mismo.",
  "actions": [
    {
      "type": "UI_RENDER_NODE",
      "label": "Ver Detalles de Video",
      "payload": {
        "jobId": "video_987",
        "data": { "status": "processing" }
      }
    }
  ],
  "context": {
    "intent": "UI_RENDER_NODE",
    "confidence": 1.0
  },
  "timestamp": "2026-01-30T15:00:00.000Z"
}
```

---

## 3. Servicio de Recepción (FrontDesk V2)
Este servicio actúa como la puerta de enlace inteligente para visitantes y clientes.

### Enviar Mensaje
- **Endpoint:** `POST /api/v2/agents/front-desk`
- **Payload (Request Body):**
```json
{
  "message": "Hola, me interesa comprar el servicio de hosting.",
  "context": {
    "sessionId": "sesion_abc_123",
    "language": "es",
    "origin": "landing_page",
    "siteType": "colombiatic",
    "products": ["hosting", "dominios"],
    "websiteUrl": "https://tusitio.com"
  }
}
```

### Recibir Respuesta
```json
{
  "success": true,
  "data": {
    "response": "¡Excelente elección! 🚀 Veo que estás listo para comprar nuestro servicio de hosting...",
    "routingDecision": "sales_assistant",
    "contextSummary": "Usuario interesado en servicios de hosting. Emoción: excited.",
    "nextSteps": [
      "Routing to sales_assistant agent",
      "Preparing context for specialist"
    ],
    "emotion": "excited",
    "urgency": 8,
    "complexity": 5
  },
  "message": "Processing complete",
  "agent": "front-desk-v2",
  "timestamp": "2026-01-30T15:05:00.000Z"
}
```

---

## 4. Prompt Maestro para la IA del Frontend
Copia este prompt en tu generador de código para crear los componentes de integración:

> "Actúa como desarrollador Senior de React/TypeScript. Crea una capa de servicios de integración para dos agentes:
> 
> 1. **Secretary Service:** Implementa una función `sendSecretaryCommand(text, sessionId)` que llame a `POST /api/secretary/command` enviando el payload `{ input: { text, channel: 'web', sessionId } }`. Debe retornar la respuesta mapeada a la interfaz `SecretaryResponse` (con response, actions, context y timestamp).
> 
> 2. **FrontDesk Service:** Implementa una función `sendFrontDeskMessage(message, sessionId, siteInfo)` que llame a `POST /api/v2/agents/front-desk` enviando `{ message, context: { sessionId, ...siteInfo } }`.
> 
> 3. **Gestión de Errores:** Implementa un interceptor de Axios que detecte errores 401 y dispare un evento de 'unauthorized' para limpiar el localStorage y redirigir al login.
> 
> 4. **Tipado:** Asegura que todas las interfaces coincidan exactamente con la estructura JSON proporcionada en la guía de integración."

---

## 5. Mapeo de Acciones (Actions)
Cuando el campo `actions` no esté vacío, el frontend debe renderizar componentes específicos según el `type`:
- `UI_RENDER_NODE`: Renderiza un nodo visual del flujo.
- `EXECUTE_TASK`: Muestra una barra de progreso de una tarea en segundo plano.
- `INIT_TOOL`: Abre un modal con la herramienta solicitada (ej. Editor de Video).