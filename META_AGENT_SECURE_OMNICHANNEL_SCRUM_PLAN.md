# 🧩 Meta-Agent Secure Omnichannel Multisite SCRUM Plan

## 🎯 Objective
Build a Meta-Agent Service that is secure, capable of functioning from any affiliated website, ensuring security, authentication, multi-business context, and omnichannel support.

## 📚 Épicas

### ÉPICA 1 — Seguridad y Autenticación Multisitio (High Priority)
Diseñar un mecanismo seguro que permita a cualquier sitio afiliado autenticarse y usar los agentes sin exponer claves del backend principal.

### ÉPICA 2 — Tenant Context Isolation
Separar el contexto y datos de cada negocio usando tenantId, incluyendo session context, workflows, historiales, preferencias y permisos.

### ÉPICA 3 — Front-Desk V2 como Gateway Inteligente
Actualizar Front-Desk para actuar como pasarela universal, validando tokens, firmando requests y enroutando al Decision Engine.

### ÉPICA 4 — Omnicanalidad
Permitir que el Meta-Agente reciba mensajes desde:
- Web chat
- WhatsApp
- Instagram DM
- Messenger
- Email
- APIs externas
- CRMs empresariales

### ÉPICA 5 — SDK para Sitios Externos
Crear un SDK que permita que cualquier sitio web externo active el meta-agente de forma segura.

## 👤 Historias de Usuario

### HU-01 — Como sitio afiliado necesito un token seguro para usar el meta-agente
**Para que** mis clientes puedan interactuar sin comprometer datos del backend principal.

**Criterios de Aceptación:**
- El sitio afiliado puede obtener un Tenant Access Token (TAT) del backend principal
- El TAT contiene tenantId, siteId, origin y permissions
- El TAT está firmado criptográficamente y expira en 24 horas
- El TAT no contiene información de usuario final

### HU-02 — Como negocio necesito que mi historial, configuración y datos no se mezclen con otros
**Requiere** tenantId + sessionContext aislado.

**Criterios de Aceptación:**
- Cada negocio tiene un tenantId único
- Los datos de cada negocio están completamente aislados
- No hay filtración de datos entre tenants
- El contexto de sesión se mantiene por tenant

### HU-03 — Como usuario final quiero chatear con el agente desde cualquier sitio
**Para** recibir soporte, información y contenidos.

**Criterios de Aceptación:**
- El usuario puede chatear desde web, WhatsApp, Instagram, Messenger, Email
- La conversación mantiene contexto del canal
- Las respuestas son coherentes independientemente del canal
- El historial de conversación se almacena correctamente

### HU-04 — Como administrador quiero ver auditoría de cada llamada
**Con** logs y trazabilidad.

**Criterios de Aceptación:**
- Todas las llamadas se registran en Application Insights
- Los logs incluyen tenantId, sessionId, agentName
- Se puede rastrear el origen de cada llamada
- Se registran errores y tiempos de respuesta

## 🛠️ Tareas Técnicas Detalladas

### 🔐 TAREA T1 — Implementar "Tenant Access Token (TAT)"
**Formato JWT con:**
- tenantId
- siteId
- origin
- permissions
- iat, exp
- Firma HS256 o RS256

**El backend principal entrega tokens a los sitios afiliados.**

**Criterios:**
- Expira en 24h
- No contiene info de usuario final
- Validación estricta de origen

**Estimación:** 3 días
**Dependencias:** Infraestructura de seguridad existente

### 🛡️ TAREA T2 — Implementar "Client-Request Signature HMAC"
**Cada request desde un sitio externo debe incluir:**
- X-Misy-Signature: HMAC_SHA256(body, tenant_secret)

**Criterios:**
- Si la firma no coincide → 401
- Prevenir replay attacks con X-Misy-Timestamp

**Estimación:** 2 días
**Dependencias:** TAREA T1

### 🟨 TAREA T3 — Middleware Global de Seguridad en Meta-Agente Service
**Validar:**
- Tenant Access Token
- Firma HMAC
- Origen (CORS dinámico por tenant)
- Límite de rate limit por tenant
- Injectar tenantContext al request

**Estimación:** 4 días
**Dependencias:** TAREA T1, TAREA T2

### 🧠 TAREA T4 — Extender Front-Desk V2 para Multi-Tenant Context
**Agregar a la request:**
```json
{
  "tenantId": "string",
  "siteId": "string",
  "sessionId": "string",
  "channel": "web|whatsapp|instagram|messenger|email",
  "metadata": {}
}
```

**Estimación:** 3 días
**Dependencias:** TAREA T3

### 🔵 TAREA T5 — Actualizar AI Decision Engine
**Agregar reglas:**
- Decisión basada en industria → business persona
- Decisión basada en canal → tono y formato
- Validación de permisos por tenant
- Control de límites por agente

**Estimación:** 4 días
**Dependencias:** TAREA T4

### 🗂️ TAREA T6 — Crear "Tenant Context Store"
**Usar Redis o PostgreSQL para almacenar:**
- tenantId
- sessionId
- businessProfile
- industry
- faq data
- branding
- workflow state
- last messages
- limits per minute

**Estimación:** 3 días
**Dependencias:** Infraestructura Redis/PostgreSQL existente

### 🟦 TAREA T7 — Crear SDK Universal JS
**Funciones:**
- misy.init({ tenantId, publicKey })
- misy.connectChat()
- misy.sendMessage()
- misy.getSession()
- misy.subscribeEvents()

**Estimación:** 5 días
**Dependencias:** TAREA T1, TAREA T2

### 🧪 TAREA T8 — Pruebas de Penetración y Seguridad
**Probar:**
- Token tampering
- HMAC spoofing
- Session hijacking
- Rate limit bypass
- CORS leak
- SQL injection
- Prompt injection

**Estimación:** 4 días
**Dependencias:** Todas las tareas anteriores

## 🏗️ Esquemas de Arquitectura

### Componentes Principales:
1. **SDK Universal JS** - Cliente para sitios externos
2. **Tenant Access Token Service** - Generación y validación de tokens
3. **HMAC Signature Validator** - Validación de firmas de requests
4. **Meta-Agent Gateway** - Middleware de seguridad y enrutamiento
5. **Tenant Context Store** - Almacenamiento de contexto por tenant
6. **Front-Desk V2** - Gateway inteligente con validación
7. **AI Decision Engine** - Motor de decisiones actualizado
8. **Specialized Agents** - Agentes existentes (video, marketing, etc.)

### Flujo de Datos:
```
Sitio Afiliado → SDK JS → TAT + HMAC → Meta-Agent Gateway → 
Front-Desk V2 → AI Decision Engine → Specialized Agent → 
Respuesta → Sitio Afiliado
```

## 🔒 Detalles de Seguridad

### Autenticación:
- **Tenant Access Token (TAT)**: JWT firmado con información de tenant
- **HMAC Signature**: Firma criptográfica de cada request
- **Rate Limiting**: Límites por tenant para prevenir abusos

### Autorización:
- **Permissions Model**: Control de acceso basado en permisos por tenant
- **Channel Restrictions**: Limitaciones por canal de comunicación
- **Agent Limits**: Control de uso de agentes por tenant

### Protección contra ataques:
- **Replay Attack Prevention**: Timestamps en headers
- **CORS Dinámico**: Orígenes permitidos por tenant
- **Input Validation**: Validación estricta de todos los inputs
- **Output Sanitization**: Limpieza de respuestas

## 🔗 Dependencias

1. **Infraestructura existente**: Redis, PostgreSQL, MongoDB
2. **Front-Desk V2**: Servicio existente a modificar
3. **AI Decision Engine**: Servicio existente a actualizar
4. **Specialized Agents**: Agentes existentes a integrar
5. **Security Infrastructure**: Key Vault, Application Insights
6. **Service Bus**: Para comunicación entre servicios

## ✅ Criterios de Aceptación

1. **Autenticación segura**: Un sitio afiliado puede conectarse solo si tiene token + HMAC válido
2. **Aislamiento de datos**: Cada negocio ve su propio contexto sin mezcla
3. **Omnicanalidad**: El meta-agente responde desde cualquier página externa
4. **Auditoría**: Logs en Application Insights con tenantId, sessionId, agentName
5. **Soporte omnicanal**: Funcionando en WhatsApp, IG, Facebook, Web, Email
6. **SDK funcional**: Cualquier sitio puede integrar el SDK y usar el servicio

## 🧪 Pruebas

### Pruebas Unitarias:
- Validación de Tenant Access Tokens
- Verificación de firmas HMAC
- Middleware de seguridad
- Context store operations
- SDK functions

### Pruebas de Integración:
- Flujo completo de autenticación
- Enrutamiento por tenant
- Comunicación con agentes especializados
- Manejo de contexto por canal

### Pruebas de Seguridad:
- Token tampering
- HMAC spoofing
- Session hijacking
- Rate limit bypass
- CORS leak
- SQL injection
- Prompt injection

### Pruebas de Rendimiento:
- Carga concurrente por tenant
- Tiempos de respuesta
- Rate limiting
- Escalabilidad horizontal

## ⚠️ Riesgos y Mitigación

| Riesgo | Mitigación |
|--------|------------|
| Confusión entre contexto de negocios | Tenant Context Store aislado |
| Exposición de backend principal | Tokens firmados + HMAC |
| Sitios afiliados inseguros | Expiración corta + revocar tokens |
| Alta carga del Meta-Agente | Service Bus + queues |
| Mezcla de datos | Validación estricta de tenantId |
| Ataques de repetición | Timestamps en headers |
| Problemas de CORS | Configuración dinámica por tenant |
| Limitaciones de rate limit | Ajuste dinámico por tenant |

## 🚀 Requisitos de DevOps

### Infraestructura:
- **Kubernetes**: Para orquestación de contenedores
- **Azure Container Registry**: Para almacenamiento de imágenes
- **Azure Load Balancer**: Para balanceo de carga
- **Azure Monitor**: Para monitoreo y alertas
- **Azure Key Vault**: Para gestión de secretos

### CI/CD:
- **GitHub Actions**: Para pipelines de integración continua
- **Automated Testing**: Pruebas automáticas en cada commit
- **Security Scanning**: Análisis de seguridad en el pipeline
- **Blue/Green Deployment**: Despliegue sin downtime
- **Rollback Mechanisms**: Capacidad de revertir cambios

### Monitoreo:
- **Application Insights**: Para telemetría y logs
- **Custom Metrics**: Métricas específicas por tenant
- **Alerting**: Notificaciones de problemas
- **Distributed Tracing**: Seguimiento de requests

## 🖥️ Requisitos de Frontend

### SDK Universal JS:
- **Lightweight**: < 50KB minificado
- **Framework Agnostic**: Funciona con React, Vue, Angular, Vanilla JS
- **TypeScript Support**: Definiciones de tipos incluidas
- **Modular**: Carga solo los componentes necesarios
- **Offline Support**: Funcionalidad básica sin conexión

### Componentes:
- **Chat Widget**: Widget de chat personalizable
- **Voice Integration**: Soporte para entrada de voz
- **File Upload**: Subida de archivos segura
- **Rich Media**: Soporte para imágenes, videos, documentos
- **Theme Support**: Personalización visual por tenant

### APIs:
- **Initialization**: Configuración del SDK
- **Messaging**: Envío y recepción de mensajes
- **Context Management**: Manejo de contexto de sesión
- **Event Subscription**: Suscripción a eventos del sistema
- **Analytics**: Envío de datos analíticos

## 🔧 Ajustes necesarios en Backends existentes

### Modificaciones en Servicios Comunes:
1. **ContextBundleService**: Adaptar para multi-tenant context
2. **MongoVectorService**: Aislar embeddings por tenant
3. **ServiceBusService**: Enrutar mensajes por tenant
4. **RedisService**: Espacios de nombres por tenant
5. **KeyVaultService**: Gestión de secretos por tenant

### Actualizaciones en Agentes Especializados:
1. **Todos los agentes**: Validar tenant context en cada request
2. **Agentes de contenido**: Personalizar por branding de tenant
3. **Agentes de análisis**: Aislar métricas por tenant
4. **Agentes de scheduling**: Respetar límites por tenant

### Cambios en Infraestructura:
1. **Base de datos**: Añadir tenantId a todas las entidades
2. **Caching**: Estrategias de cache por tenant
3. **Logging**: Incluir tenantId en todos los logs
4. **Monitoring**: Dashboards y alertas por tenant

## 🔄 Cambios en el Front-Desk Agent V2 y el Decision Engine

### Front-Desk V2:
1. **Validación de seguridad**: Integrar TAT y HMAC validation
2. **Context enrichment**: Añadir tenantId, siteId, channel a requests
3. **Rate limiting**: Implementar límites por tenant
4. **CORS dinámico**: Configurar orígenes permitidos por tenant
5. **Logging**: Registrar todas las interacciones con tenant context

### AI Decision Engine:
1. **Tenant-aware routing**: Enrutar basado en permisos de tenant
2. **Business persona integration**: Decidir basado en industria del tenant
3. **Channel-adapted responses**: Adaptar tono y formato por canal
4. **Limit enforcement**: Respetar límites de uso por tenant
5. **Context preservation**: Mantener contexto multi-tenant en decisiones

## 🌐 Flujo para sitios afiliados externos

### Paso 1: Registro del Sitio Afiliado
1. El sitio se registra en el backend principal
2. Se genera un tenantId único para el sitio
3. Se crea un tenant secret para firmas HMAC
4. Se configuran permisos y límites

### Paso 2: Integración del SDK
1. El sitio incluye el SDK JS en su página
2. Inicializa el SDK con tenantId y publicKey
3. Conecta el widget de chat o componentes necesarios

### Paso 3: Autenticación y Comunicación
1. El SDK solicita un Tenant Access Token al backend principal
2. El backend principal genera y firma el TAT
3. El SDK incluye el TAT y firma HMAC en cada request
4. El Meta-Agent Gateway valida autenticidad y autorización

### Paso 4: Procesamiento de Requests
1. El Front-Desk V2 enriquece el contexto con tenant info
2. El AI Decision Engine toma decisiones basadas en tenant context
3. El agente especializado procesa la solicitud
4. La respuesta se devuelve al sitio afiliado

## 🏢 Modelo de "Tenant Context Isolation" por negocio

### Estructura de Almacenamiento:
```
Tenant Context Store (Redis/PostgreSQL)
├── tenantId: "tenant-123"
│   ├── sessions: { sessionId1, sessionId2, ... }
│   ├── businessProfile: { industry, size, location, ... }
│   ├── branding: { colors, logo, tone, ... }
│   ├── faqData: { customFAQs, preferences, ... }
│   ├── workflowState: { currentProcesses, status, ... }
│   ├── limits: { agentUsage, rateLimits, ... }
│   └── metadata: { createdAt, updatedAt, ... }
└── tenantId: "tenant-456"
    ├── sessions: { sessionId3, sessionId4, ... }
    ├── businessProfile: { industry, size, location, ... }
    ├── branding: { colors, logo, tone, ... }
    ├── faqData: { customFAQs, preferences, ... }
    ├── workflowState: { currentProcesses, status, ... }
    ├── limits: { agentUsage, rateLimits, ... }
    └── metadata: { createdAt, updatedAt, ... }
```

### Aislamiento de Datos:
1. **Nivel de base de datos**: tenantId como parte de todas las queries
2. **Nivel de cache**: Espacios de nombres separados por tenant
3. **Nivel de logs**: Identificación clara de tenant en todos los registros
4. **Nivel de procesamiento**: Contexto de tenant inyectado en cada request

### Gestión de Sesiones:
1. **Session ID único**: Generado por tenant
2. **Contexto persistente**: Almacenado en Tenant Context Store
3. **Expiración controlada**: TTL configurado por tenant
4. **Seguridad**: Encriptación de datos sensibles en sesión

## 📊 Métricas y Monitoreo

### Métricas por Tenant:
- Uso de agentes especializados
- Tiempos de respuesta
- Tasa de éxito de requests
- Errores por tipo
- Uso de recursos

### Dashboards:
- **Tenant Overview**: Métricas agregadas por tenant
- **Agent Performance**: Rendimiento de agentes por tenant
- **Security Dashboard**: Incidentes de seguridad por tenant
- **Usage Analytics**: Patrones de uso por tenant

### Alertas:
- **Rate Limiting**: Cuando se alcanzan límites por tenant
- **Security Incidents**: Actividad sospechosa por tenant
- **Performance Issues**: Degradación del servicio por tenant
- **Resource Exhaustion**: Uso excesivo de recursos por tenant

## 📅 Plan de Implementación

### Sprint 1 (Semanas 1-2): Seguridad y Autenticación
- TAREA T1: Implementar Tenant Access Token
- TAREA T2: Implementar Client-Request Signature HMAC
- TAREA T3: Middleware Global de Seguridad (parcial)

### Sprint 2 (Semanas 3-4): Contexto y Enrutamiento
- TAREA T3: Completar Middleware Global de Seguridad
- TAREA T4: Extender Front-Desk V2
- TAREA T6: Crear Tenant Context Store

### Sprint 3 (Semanas 5-6): Integración y Omnicanalidad
- TAREA T5: Actualizar AI Decision Engine
- Implementar canales adicionales (WhatsApp, Instagram, etc.)
- Pruebas de integración multi-canal

### Sprint 4 (Semanas 7-8): SDK y Pruebas
- TAREA T7: Crear SDK Universal JS
- TAREA T8: Pruebas de Penetración y Seguridad
- Pruebas de usuario final

### Sprint 5 (Semanas 9-10): Optimización y Despliegue
- Optimización de rendimiento
- Documentación final
- Despliegue en producción
- Monitoreo y ajustes

## 🏁 Entregables

1. **Meta-Agent Service** con autenticación multi-tenant
2. **SDK Universal JS** para integración en sitios externos
3. **Tenant Context Store** para aislamiento de datos
4. **Front-Desk V2** actualizado como gateway inteligente
5. **AI Decision Engine** con soporte multi-tenant
6. **Documentación técnica** completa
7. **Pruebas de seguridad** y penetración
8. **Monitoreo y alertas** por tenant