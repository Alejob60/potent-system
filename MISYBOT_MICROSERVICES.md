# 🖥️ DISEÑO DE MICROSERVICIOS

### 1. tenant-manager
**Responsabilidades:**
- Gestión de tenants (creación, actualización, eliminación)
- Generación y rotación de credenciales
- Validación de dominios y orígenes
- Gestión de límites y cuotas por tenant

**Endpoints principales:**
- `POST /tenants` - Crear nuevo tenant
- `GET /tenants/{id}` - Obtener información de tenant
- `PUT /tenants/{id}` - Actualizar tenant
- `DELETE /tenants/{id}` - Eliminar tenant
- `POST /tenants/{id}/credentials` - Generar credenciales
- `POST /tenants/{id}/rotate` - Rotar credenciales

**JWT claims:**
- `tenantId` - Identificador del tenant
- `permissions` - Permisos asignados
- `origin` - Origen permitido
- `exp` - Expiración del token

**Eventos que emite:**
- `tenant.created` - Nuevo tenant creado
- `tenant.updated` - Tenant actualizado
- `tenant.deleted` - Tenant eliminado
- `credentials.generated` - Nuevas credenciales generadas
- `credentials.rotated` - Credenciales rotadas

**Bases de datos/tables:**
- `tenants` - Información de tenants
- `tenant_credentials` - Credenciales de tenants
- `tenant_domains` - Dominios permitidos
- `tenant_limits` - Límites y cuotas

### 2. front-desk
**Responsabilidades:**
- Validación de seguridad (TAT, HMAC, CORS)
- Enrutamiento inicial de solicitudes
- Gestión de sesiones
- Control de rate limiting
- Primer nivel de procesamiento de mensajes

**Endpoints principales:**
- `POST /validate` - Validar solicitud entrante
- `POST /route` - Enrutar solicitud a agente apropiado
- `POST /session` - Crear/gestionar sesión
- `GET /session/{id}` - Obtener información de sesión

**JWT claims:**
- `tenantId` - Identificador del tenant
- `sessionId` - Identificador de sesión
- `channel` - Canal de comunicación
- `permissions` - Permisos del tenant

**Eventos que emite:**
- `request.validated` - Solicitud validada
- `request.routed` - Solicitud enroutada
- `session.created` - Nueva sesión creada
- `session.updated` - Sesión actualizada
- `rate.limit.exceeded` - Límite de rate limit excedido

**Bases de datos/tables:**
- `sessions` - Información de sesiones
- `session_context` - Contexto de sesiones
- `validation_logs` - Logs de validación
- `rate_limits` - Configuración de rate limits

### 3. meta-agent-orchestrator
**Responsabilidades:**
- Orquestación de agentes especializados
- Coordinación de flujos de trabajo complejos
- Gestión de dependencias entre agentes
- Monitoreo del estado de agentes
- Manejo de errores y reintentos

**Endpoints principales:**
- `POST /orchestrate` - Iniciar orquestación
- `GET /workflows/{id}` - Obtener estado de workflow
- `POST /workflows/{id}/cancel` - Cancelar workflow
- `GET /agents` - Listar agentes disponibles

**JWT claims:**
- `tenantId` - Identificador del tenant
- `workflowId` - Identificador de workflow
- `agentId` - Identificador de agente
- `permissions` - Permisos de orquestación

**Eventos que emite:**
- `workflow.started` - Workflow iniciado
- `workflow.completed` - Workflow completado
- `workflow.failed` - Workflow fallido
- `agent.assigned` - Agente asignado
- `agent.completed` - Agente completado

**Bases de datos/tables:**
- `workflows` - Información de workflows
- `workflow_steps` - Pasos de workflows
- `agent_assignments` - Asignaciones de agentes
- `orchestration_logs` - Logs de orquestación

### 4. customer-support-agent (per tenant)
**Responsabilidades:**
- Atención al cliente especializada por tenant
- Procesamiento de consultas comunes
- Escalación a agentes especializados
- Mantenimiento de contexto de conversación
- Generación de respuestas personalizadas

**Endpoints principales:**
- `POST /process` - Procesar mensaje de cliente
- `GET /context/{sessionId}` - Obtener contexto de sesión
- `POST /escalate` - Escalar a agente especializado
- `POST /feedback` - Recibir feedback de cliente

**JWT claims:**
- `tenantId` - Identificador del tenant
- `sessionId` - Identificador de sesión
- `userId` - Identificador de usuario
- `permissions` - Permisos del agente

**Eventos que emite:**
- `message.processed` - Mensaje procesado
- `context.updated` - Contexto actualizado
- `escalation.requested` - Escalación solicitada
- `feedback.received` - Feedback recibido

**Bases de datos/tables:**
- `conversations` - Conversaciones con clientes
- `conversation_context` - Contexto de conversaciones
- `knowledge_base` - Base de conocimiento del tenant
- `support_logs` - Logs de soporte

### 5. federated-context-agent
**Responsabilidades:**
- Gestión de contexto federado
- Sincronización de contexto local y global
- Anonimización de datos para contexto global
- Validación de consentimientos para compartir datos
- Aprendizaje distribuido

**Endpoints principales:**
- `POST /sync` - Sincronizar contexto
- `POST /anonymize` - Anonimizar datos
- `GET /context/{scope}` - Obtener contexto (local/global)
- `POST /contribute` - Contribuir al contexto global

**JWT claims:**
- `tenantId` - Identificador del tenant
- `scope` - Alcance del contexto (local/global)
- `consentId` - Identificador de consentimiento
- `permissions` - Permisos de contexto

**Eventos que emite:**
- `context.synced` - Contexto sincronizado
- `data.anonymized` - Datos anonimizados
- `contribution.made` - Contribución realizada
- `consent.verified` - Consentimiento verificado

**Bases de datos/tables:**
- `local_context` - Contexto local por tenant
- `global_context` - Contexto global anonimizado
- `consent_records` - Registros de consentimientos
- `contribution_logs` - Logs de contribuciones

### 6. omnichannel-router
**Responsabilidades:**
- Enrutamiento por canal de comunicación
- Adaptación de mensajes por canal
- Gestión de sesiones por canal
- Integración con APIs externas
- Manejo de multimedia por canal

**Endpoints principales:**
- `POST /route` - Enrutar mensaje por canal
- `POST /format` - Formatear mensaje para canal
- `GET /channels` - Listar canales disponibles
- `POST /media` - Procesar multimedia

**JWT claims:**
- `tenantId` - Identificador del tenant
- `channel` - Canal de comunicación
- `messageId` - Identificador de mensaje
- `permissions` - Permisos de enrutamiento

**Eventos que emite:**
- `message.routed` - Mensaje enroutado
- `message.formatted` - Mensaje formateado
- `channel.connected` - Canal conectado
- `media.processed` - Multimedia procesado

**Bases de datos/tables:**
- `channel_configs` - Configuración por canal
- `message_routes` - Rutas de mensajes
- `media_attachments` - Archivos multimedia
- `channel_logs` - Logs de canales

### 7. auth-service
**Responsabilidades:**
- Generación y validación de TAT
- Validación de firmas HMAC
- Gestión de sesiones
- Control de acceso basado en roles
- Auditoría de seguridad

**Endpoints principales:**
- `POST /token` - Generar TAT
- `POST /validate` - Validar token/firma
- `POST /session` - Crear sesión
- `DELETE /session/{id}` - Terminar sesión

**JWT claims:**
- `sub` - Sujeto del token
- `tenantId` - Identificador del tenant
- `permissions` - Permisos del sujeto
- `exp` - Expiración del token

**Eventos que emite:**
- `token.generated` - Token generado
- `token.validated` - Token validado
- `session.created` - Sesión creada
- `session.terminated` - Sesión terminada

**Bases de datos/tables:**
- `auth_tokens` - Tokens de autenticación
- `session_store` - Almacenamiento de sesiones
- `access_logs` - Logs de acceso
- `security_audits` - Auditorías de seguridad

### 8. consent-service
**Responsabilidades:**
- Gestión de consentimientos de usuarios
- Validación de consentimientos para operaciones
- Generación de reportes de cumplimiento
- Notificaciones de cambios en regulaciones
- Auditoría de consentimientos

**Endpoints principales:**
- `POST /consent` - Registrar consentimiento
- `GET /consent/{id}` - Obtener consentimiento
- `PUT /consent/{id}` - Actualizar consentimiento
- `GET /compliance` - Generar reporte de cumplimiento

**JWT claims:**
- `userId` - Identificador de usuario
- `consentId` - Identificador de consentimiento
- `tenantId` - Identificador del tenant
- `permissions` - Permisos de consentimiento

**Eventos que emite:**
- `consent.granted` - Consentimiento otorgado
- `consent.revoked` - Consentimiento revocado
- `consent.updated` - Consentimiento actualizado
- `compliance.reported` - Reporte de cumplimiento generado

**Bases de datos/tables:**
- `user_consent` - Consentimientos de usuarios
- `consent_templates` - Plantillas de consentimiento
- `compliance_reports` - Reportes de cumplimiento
- `consent_audits` - Auditorías de consentimientos

### 9. context-db-layer
**Responsabilidades:**
- Abstracción de acceso a datos de contexto
- Implementación de RLS para multitenancy
- Gestión de conexiones a bases de datos
- Caching de datos de contexto
- Backup y recuperación de contexto

**Endpoints principales:**
- `POST /context` - Almacenar contexto
- `GET /context/{id}` - Obtener contexto
- `PUT /context/{id}` - Actualizar contexto
- `DELETE /context/{id}` - Eliminar contexto

**JWT claims:**
- `tenantId` - Identificador del tenant
- `contextId` - Identificador de contexto
- `scope` - Alcance del contexto
- `permissions` - Permisos de contexto

**Eventos que emite:**
- `context.stored` - Contexto almacenado
- `context.retrieved` - Contexto recuperado
- `context.updated` - Contexto actualizado
- `context.deleted` - Contexto eliminado

**Bases de datos/tables:**
- `tenant_context` - Contexto por tenant
- `context_versions` - Versiones de contexto
- `context_cache` - Cache de contexto
- `context_backups` - Backups de contexto

### 10. analytics & audit log service
**Responsabilidades:**
- Recopilación y análisis de métricas
- Generación de logs de auditoría
- Monitoreo de actividad del sistema
- Detección de anomalías
- Generación de reportes

**Endpoints principales:**
- `POST /metrics` - Registrar métricas
- `GET /analytics` - Obtener análisis
- `POST /audit` - Registrar evento de auditoría
- `GET /reports` - Generar reportes

**JWT claims:**
- `tenantId` - Identificador del tenant
- `userId` - Identificador de usuario
- `eventType` - Tipo de evento
- `permissions` - Permisos de análisis

**Eventos que emite:**
- `metric.recorded` - Métrica registrada
- `anomaly.detected` - Anomalía detectada
- `audit.logged` - Evento de auditoría registrado
- `report.generated` - Reporte generado

**Bases de datos/tables:**
- `system_metrics` - Métricas del sistema
- `audit_logs` - Logs de auditoría
- `anomaly_reports` - Reportes de anomalías
- `analytics_data` - Datos de análisis

### 11. llm-service
**Responsabilidades:**
- Integración con proveedores de LLM
- Gestión de prompts y templates
- Procesamiento de solicitudes de IA
- Caching de respuestas
- Monitoreo de uso y costos

**Endpoints principales:**
- `POST /generate` - Generar respuesta de IA
- `POST /embed` - Generar embeddings
- `GET /models` - Listar modelos disponibles
- `POST /moderate` - Moderar contenido

**JWT claims:**
- `tenantId` - Identificador del tenant
- `modelId` - Identificador de modelo
- `requestId` - Identificador de solicitud
- `permissions` - Permisos de IA

**Eventos que emite:**
- `ai.requested` - Solicitud de IA realizada
- `ai.generated` - Respuesta de IA generada
- `embedding.created` - Embedding creado
- `content.moderated` - Contenido moderado

**Bases de datos/tables:**
- `llm_requests` - Solicitudes de IA
- `llm_responses` - Respuestas de IA
- `embedding_store` - Almacenamiento de embeddings
- `usage_logs` - Logs de uso