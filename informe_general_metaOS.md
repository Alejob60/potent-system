# Informe de Inteligencia del Sistema: MetaOS
**Versión:** 2.0 (Arquitectura Híbrida y Omnicanal)
**Estado:** Operacional con Áreas de Optimización
**Fecha:** 31 de enero de 2026

## 1. Resumen Ejecutivo
MetaOS es un orquestador de agentes de IA basado en NestJS que utiliza una arquitectura de micro-servicios internos desacoplados. El sistema combina persistencia transaccional (PostgreSQL) con memoria visual y semántica (MongoDB), orquestada por un Meta-Agente central y múltiples mini-agentes especialistas.

## 2. El "Cerebro": Arquitectura de Agentes

### 2.1 Meta-Agente (`EnhancedMetaAgent`)
*   **Rol:** Orquestador Central (Córtex Prefrontal).
*   **Función:** Recibe inputs del usuario, analiza la intención y utiliza el `TaskPlannerService` para generar un grafo de tareas.
*   **Conexión:** Se comunica con el resto del sistema mediante el `EventBus`.

### 2.2 Mini-Agentes (Especialistas)
*   **Secretary Agent:** Especializado en gestión de agenda y control de interrupciones.
*   **Viralization Pipeline:** Mini-agente de marketing que analiza tendencias y genera contenido viral.
*   **Purchase & Intent Agents:** Actúan de forma silenciosa analizando el flujo de chat para detectar oportunidades comerciales y gestionar pagos pendientes.

## 3. El "Sistema Nervioso": Servicios y Flujos

### 3.1 Event Bus (Comunicación Reactiva)
El sistema no utiliza llamadas directas rígidas, sino un patrón **Pub/Sub interno**.
*   **Flujo:** Un mensaje llega por `WebSocket` -> `EventBus` lo publica -> Los Agentes interesados reaccionan.
*   **Ventaja:** Si el `ViralizationPipeline` falla, el `SecretaryAgent` sigue funcionando.

### 3.2 La Memoria Dual
*   **Memoria Fotográfica (Workspace):** Guarda el estado exacto del canvas (ReactFlow) en MongoDB. Permite al usuario volver exactamente a donde dejó su trabajo.
*   **Memoria Semántica (Knowledge Base):** Procesa archivos (PDF/Imágenes) mediante Azure y los convierte en vectores. Esto permite a la IA "recordar" manuales o documentos técnicos.

## 4. Análisis de Conectividad y Función

| Componente | Conexión | Estado | Función Correcta |
| :--- | :--- | :--- | :--- |
| **Frontend -> API** | JWT / WebSocket | ✅ Excelente | Autenticación robusta y tiempo real. |
| **Meta-Agente -> Planner** | Inyección Directa | ✅ Correcto | Generación de planes estructurada. |
| **Agentes -> Knowledge** | Inyección / Query | ⚠️ Parcial | Los agentes tienen los datos, pero falta el prompt-loop para RAG automático. |
| **Services -> DB** | TypeORM / Mongoose | ✅ Correcto | Separación clara entre datos relacionales y NoSQL. |

## 5. Errores de Flujo Interno e Identificación de Riesgos

### 5.1 Bloqueo de Hilo en Procesamiento de Archivos (Crítico)
*   **Problema:** El `ExtractorService` procesa PDFs de forma síncrona.
*   **Riesgo:** Un PDF de 10MB bloqueará el hilo de ejecución o causará un timeout en el frontend, degradando la experiencia del usuario.
*   **Solución:** Mover el procesamiento a un worker en segundo plano (BullMQ o Redis).

### 5.2 Desconexión de Borrado (Huérfanos de Datos)
*   **Problema:** No hay sincronización de borrado entre Postgres (Tenant/User) y MongoDB (Workspace/Knowledge).
*   **Riesgo:** Si un tenant se da de baja, sus vectores y archivos persisten en MongoDB, generando costos innecesarios y riesgos de privacidad.

### 5.3 El "Bucle de Silencio"
*   **Problema:** Si el Meta-Agente delega una tarea a un mini-agente y este falla silenciosamente, el Meta-Agente no siempre recibe el reporte de error para replanificar.
*   **Riesgo:** El usuario ve una tarea "en progreso" que nunca termina.

## 6. Recomendaciones Estratégicas

1.  **Implementar RAG Nativo:** Conectar el `KnowledgeService` directamente en el `SystemPrompt` del Meta-Agente para que pueda citar documentos subidos en sus respuestas.
2.  **Asincronía Total:** Convertir el `upload` de conocimiento en un proceso con estados (Recibido -> Procesando -> Indexado) notificando al usuario vía WebSocket.
3.  **Heartbeat de Agentes:** Implementar un sistema de "salud" donde cada mini-agente reporte su estado cada 30 segundos al orquestador.

---
**Informe generado por el Meta-Agente de Arquitectura.**
