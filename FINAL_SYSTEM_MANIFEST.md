# 📑 Manifiesto Técnico: MisyBot Meta-Agent (Viral Steam Engine) V2

Este documento detalla el estado actual, la arquitectura y el protocolo de integración de MisyBot Meta-Agent tras la refactorización industrial.

## 1. Resumen de la Arquitectura
MisyBot ha pasado de ser un chatbot lineal a un **Orquestador Agéntico Multi-tenant**. El sistema utiliza un modelo de "Cerebro Central" (Front-Desk V2) que valida, enriquece y rutea peticiones a agentes especializados.

### Stack Tecnológico
- **Núcleo:** NestJS (TypeScript).
- **IA:** Azure OpenAI (GPT-4o para razonamiento, Ada-002 para embeddings).
- **Persistencia:** PostgreSQL (Configuraciones), MongoDB (Memoria RAG), Redis (Caché, Seguridad y Rate Limiting).
- **Seguridad:** Protocolo dual TAT (Tenant Access Token) + HMAC-SHA256 con protección anti-replay.

---

## 2. Capacidades Operativas (Lo que funciona)

### A. Capa de Seguridad Industrial
- **Aislamiento Multi-tenant:** Los datos están separados por `tenantId`. Ningún cliente puede acceder a la memoria o configuración de otro.
- **Validación de Firmas:** Las peticiones deben incluir una firma HMAC, un `timestamp` y un `nonce`.
- **Revocación de Tokens:** Soporte para invalidar tokens de acceso en tiempo real a través de la tabla `tenant_tokens`.

### B. Gateway Inteligente (Front-Desk V2)
- **Endpoint:** `POST /api/v2/gateway/process`.
- **Enriquecimiento Automático:** Recupera el manual de marca, catálogo de productos y tono de voz del tenant antes de procesar el mensaje con IA.
- **Detección de Intención:** Clasifica automáticamente entre ventas, soporte, análisis o creación de contenido.

### C. Modo Marketing Senior
- **System Prompt Estratégico:** La IA actúa como un Director de Marketing.
- **Output Estructurado:** Genera tablas Markdown para calendarios y utiliza el método persuasivo AIDA.
- **Modo Demo Activo:** Configurado por defecto para "Calzado El Comandante" ($150.000 COP, botas indestructibles).

### D. Ecosistema de Canales (Omnicanalidad)
- **Webhooks Unificados:** Soporte para WhatsApp Business, Instagram DM y Facebook Messenger.
- **Factoría de Adaptadores:** Permite añadir nuevos canales (ej. Telegram o Slack) simplemente implementando la interfaz `ChannelAdapter`.

---

## 3. Flujo de Datos Técnico

1.  **Entrada:** El **Misy SDK** o un **Webhook Social** envía un mensaje al Gateway.
2.  **Validación:** El `SecurityMiddleware` verifica el JWT y la integridad de la firma HMAC.
3.  **Contexto:** El `TenantContextStore` inyecta los datos del negocio (Postgres -> Redis Cache).
4.  **Memoria:** Se realiza una búsqueda semántica en MongoDB para recuperar historial relevante.
5.  **Razonamiento:** `OrchestratorService` envía el paquete completo a GPT-4o.
6.  **Acción:** Si se requiere, el LLM dispara una herramienta (Tool Calling) en el backend de Azure.
7.  **Salida:** Respuesta en Español Latino, formateada para el frontend actual.

---

## 4. Guía de Integración para Nuevos Microservicios

Para conectar un nuevo servicio o frontend a MisyBot:

### 1. Requisitos de Seguridad
Debes enviar los siguientes headers en cada petición `POST`:
- `Authorization: Bearer <TU_TAT_TOKEN>`
- `x-misy-signature: <HMAC_GENERADO>`
- `x-misy-timestamp: <ISO_8601>`
- `x-misy-nonce: <UUID_UNICO>`

### 2. Generación de la Firma
La firma se genera concatenando `timestamp + nonce + body_json` y cifrándolo con el `tenantSecret` usando SHA256.

---

## 5. Roadmap: Pendientes y Próximos Pasos

1.  **Callbacks de Producción:** Implementar el endpoint que reciba la confirmación de Azure cuando un video o imagen haya terminado de renderizarse.
2.  **Dashboard de Analíticas:** Crear una vista de administrador que consuma `FeedbackController` para mostrar el ROAS y engagement por tenant.
3.  **SDK UI:** Desarrollar componentes de React/Vue que ya traigan la lógica del `misy-sdk.js` integrada.
4.  **Integración CRM:** Conectar los leads detectados por el `sales-assistant` con HubSpot o Salesforce de forma automática.

---
**Desarrollado por:** Gemini AI Architect
**Fecha:** 02 de Febrero de 2026
**Estado:** Estable / Listo para Despliegue
