# Manual de Integración Frontend: MetaOS (V2.0)
**Estado:** Definitivo / Producción
**Sistema:** MetaOS Orchestrator
**Protocolo:** REST (HTTPS) + WebSockets (WSS)

## 1. Arquitectura de Seguridad y Headers
Todas las peticiones deben estar firmadas por un Token JWT emitido por el Backend Principal. MetaOS valida este token y extrae la identidad del usuario y del Tenant.

### Headers Obligatorios
| Header | Valor / Ejemplo | Descripción |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT_TOKEN>` | Token de sesión del usuario. |
| `x-tenant-id` | `UUID / String` | Identificador del Tenant actual. |
| `Content-Type` | `application/json` | Formato de intercambio de datos. |

---

## 2. Gestión del Workspace (Memoria Fotográfica)
Este endpoint permite guardar y recuperar la posición de los nodos y el estado del canvas de ReactFlow.

### Sincronizar Canvas (Auto-save)
- **Endpoint:** `POST /api/workspace/sync`
- **Payload:**
```json
{
  "nodes": [
    { "id": "node-1", "type": "agentNode", "position": { "x": 100, "y": 200 }, "data": { "label": "Meta-Agent" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "node-1", "target": "node-2", "animated": true }
  ],
  "viewport": { "x": 0, "y": 0, "zoom": 1.2 }
}
```

### Cargar Estado Inicial
- **Endpoint:** `GET /api/workspace/state`
- **Respuesta:** El mismo objeto JSON enviado en `sync`. Si es nuevo, devuelve un objeto con arrays vacíos.

---

## 3. Base de Conocimiento (RAG - Memoria Vectorial)
Para que el usuario pueda "darle de leer" documentos a la IA.

### Subir Archivo (PDF/Imagen)
- **Endpoint:** `POST /api/knowledge/upload`
- **Content-Type:** `multipart/form-data`
- **Payload:** `file: [Archivo Binario]`
- **Respuesta Esperada:**
```json
{
  "success": true,
  "documentId": "mongo_id_123",
  "summary": "Resumen técnico generado por GPT-4o...",
  "sourceType": "pdf"
}
```

---

## 4. Interacción con el Meta-Agente (Orquestador)
Este es el flujo principal de chat inteligente y generación de acciones.

### Enviar Mensaje / Comando
- **Endpoint:** `POST /api/chat/interactive` (o el configurado para `processUserMessage`)
- **Payload:**
```json
{
  "message": "Crea una campaña de video para el producto X basada en el PDF que subí",
  "sessionId": "uuid-session-123"
}
```

### Respuesta del MetaOS (Payload de Alta Inteligencia)
El frontend debe estar preparado para recibir una respuesta "enriquecida" que no solo contiene texto, sino **intenciones de UI**:

```json
{
  "text": "He analizado tus documentos. Basado en el manual 'ProductoX.pdf', propongo...",
  "intent": "PROPOSE_STRATEGY", 
  "payload": {
    "steps": [
      { "type": "FLUX_IMAGE", "data": { "prompt": "Anuncio de producto X" } },
      { "type": "VIDEO_NODE", "data": { "duration": 60 } }
    ]
  },
  "relevantKnowledge": [
    { "text": "...fragmento del PDF...", "source": "ProductoX.pdf" }
  ],
  "planId": "plan_abc",
  "sagaId": "saga_xyz"
}
```

**Acción Sugerida para Frontend:**
- Si `intent === 'CREATE_NODE'`: El frontend debe instanciar un nuevo nodo en ReactFlow automáticamente.
- Si `intent === 'PROPOSE_STRATEGY'`: Mostrar un modal con la lista de pasos para aprobación del usuario.

---

## 5. Flujo de Seguridad Crítico (Data Governance)
1.  **Aislamiento:** MetaOS nunca devuelve datos que no pertenezcan al `tenantId` del token.
2.  **Sensibilidad:** El `userId` enviado en el cuerpo de la solicitud es ignorado; MetaOS siempre utiliza el `sub` (ID de usuario) codificado dentro del JWT para prevenir la suplantación de identidad (Identity Spoofing).
3.  **Sanitización:** Todos los outputs de texto pasan por un filtro de contenido antes de ser enviados al frontend.

---

## 6. WebSockets (Notificaciones en Tiempo Real)
- **URL:** `wss://api.metaos.ai/socket.io`
- **Evento de Escucha:** `INTERACTIVE_RESPONSE_GENERATED`
- **Uso:** El frontend debe escuchar este evento para actualizar la UI cuando un proceso asíncrono (como una Saga de larga duración) termina.

---
**Nota para Desarrolladores:** El sistema utiliza una arquitectura de **Sagas**. Si una operación falla, el sistema intentará compensar (revertir) los cambios automáticamente. El frontend recibirá el estado de la saga mediante el ID proporcionado.
