# 🧩 MisyBot-2: Sprint 1 Implementation Plan
## Normalización de endpoints + seguridad

### Objetivo
Implementar la normalización de endpoints con versionado v1 y blindaje de seguridad del sistema de autenticación.

### Duración
2 semanas

### Entregables
- `/api/v1/*` endpoints completamente implementados
- Sistema de autenticación blindado con tokens en cookies seguras

## Tareas del Sprint

### Tarea 1: Implementar estructura de API v1

#### Descripción
Crear la estructura base para los endpoints versionados v1 y migrar los endpoints existentes.

#### Subtareas:
1. Actualizar [main.ts](file:///d:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/main.ts) para usar prefijo `/api/v1`
2. Crear estructura de directorios para versiones de API
3. Migrar controladores existentes a la nueva estructura

#### Implementación:

1. **Actualizar main.ts**:
   - Cambiar `app.setGlobalPrefix('api')` a `app.setGlobalPrefix('api/v1')`
   - Agregar middleware de versionado

2. **Crear estructura de directorios**:
   ```
   src/
   ├── api/
   │   ├── v1/
   │   │   ├── agents/
   │   │   ├── orchestrator/
   │   │   ├── colombiatic/
   │   │   └── controllers/
   │   └── v2/ (futuro)
   ```

#### Archivos a modificar:
- [src/main.ts](file:///d:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/main.ts)

### Tarea 2: Normalizar rutas de agentes

#### Descripción
Reestructurar las rutas de los agentes para seguir el estándar `/api/v1/agents/{agentName}`

#### Subtareas:
1. Migrar [AgentTrendScannerController](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-trend-scanner/controllers/agent-trend-scanner.controller.ts)
2. Migrar [AgentVideoScriptorController](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-video-scriptor/controllers/agent-video-scriptor.controller.ts)
3. Migrar [AgentFaqResponderController](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-faq-responder/controllers/agent-faq-responder.controller.ts)
4. Migrar [AgentPostSchedulerController](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-post-scheduler/controllers/agent-post-scheduler.controller.ts)
5. Migrar [AgentAnalyticsReporterController](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-analytics-reporter/controllers/agent-analytics-reporter.controller.ts)
6. Migrar [AdminOrchestratorController](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/admin/controllers/admin-orchestrator.controller.ts)
7. Migrar [ColombiaTICAgentController](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/services/colombiatic-agent.controller.ts)
8. Migrar [MetaMetricsController](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/meta-metrics/controllers/meta-metrics.controller.ts)

#### Implementación:
1. Actualizar decoradores `@Controller` para seguir el estándar
2. Verificar que todas las rutas estén correctamente versionadas
3. Actualizar documentación Swagger

#### Archivos a modificar:
- [src/agents/agent-trend-scanner/controllers/agent-trend-scanner.controller.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-trend-scanner/controllers/agent-trend-scanner.controller.ts)
- [src/agents/agent-video-scriptor/controllers/agent-video-scriptor.controller.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-video-scriptor/controllers/agent-video-scriptor.controller.ts)
- [src/agents/agent-faq-responder/controllers/agent-faq-responder.controller.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-faq-responder/controllers/agent-faq-responder.controller.ts)
- [src/agents/agent-post-scheduler/controllers/agent-post-scheduler.controller.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-post-scheduler/controllers/agent-post-scheduler.controller.ts)
- [src/agents/agent-analytics-reporter/controllers/agent-analytics-reporter.controller.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/agent-analytics-reporter/controllers/agent-analytics-reporter.controller.ts)
- [src/agents/admin/controllers/admin-orchestrator.controller.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/admin/controllers/admin-orchestrator.controller.ts)
- [src/services/colombiatic-agent.controller.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/services/colombiatic-agent.controller.ts)
- [src/agents/meta-metrics/controllers/meta-metrics.controller.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/agents/meta-metrics/controllers/meta-metrics.controller.ts)

### Tarea 3: Implementar middleware de validación

#### Descripción
Crear un middleware "Request Validator" basado en Zod para validar todas las solicitudes.

#### Subtareas:
1. Instalar dependencias de Zod
2. Crear middleware de validación
3. Implementar esquemas de validación para endpoints críticos

#### Implementación:
1. Ejecutar `npm install zod`
2. Crear directorio `src/common/validation`
3. Crear middleware de validación
4. Definir esquemas Zod para DTOs existentes

#### Archivos a crear:
- `src/common/validation/validation.middleware.ts`
- `src/common/validation/schemas/*`

### Tarea 4: Mover tokens a HttpOnly Secure Cookies

#### Descripción
Implementar autenticación segura usando HttpOnly Secure Cookies en lugar de tokens accesibles desde el frontend.

#### Subtareas:
1. Crear servicio de gestión de cookies
2. Actualizar middleware de autenticación
3. Modificar endpoints de login/logout
4. Implementar rotación de tokens

#### Implementación:
1. Crear `src/common/auth/cookie.service.ts`
2. Actualizar `src/common/auth/auth.middleware.ts`
3. Modificar controladores de autenticación
4. Implementar mecanismo de renovación de sesiones

#### Archivos a crear/modificar:
- `src/common/auth/cookie.service.ts`
- `src/common/auth/auth.middleware.ts`
- Controladores de autenticación existentes

### Tarea 5: Implementar rate limiting global

#### Descripción
Agregar rate limiting global y por endpoint para proteger el sistema de abusos.

#### Subtareas:
1. Instalar `@nestjs/throttler`
2. Configurar rate limiting global
3. Personalizar rate limits por endpoint
4. Implementar logging de solicitudes bloqueadas

#### Implementación:
1. Ejecutar `npm install @nestjs/throttler`
2. Configurar ThrottlerModule en [AppModule](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/app.module.ts)
3. Agregar decoradores `@Throttle` a endpoints críticos
4. Implementar logging de solicitudes throttled

#### Archivos a modificar:
- [src/app.module.ts](file:///D:/MisyBot/Misy-Agent/meta-agent/backend-refactor/src/app.module.ts)
- Controladores que necesiten rate limiting específico

### Tarea 6: Implementar verificación de sesión en Redis

#### Descripción
Mover la gestión de sesiones a Redis para mejor escalabilidad y seguridad.

#### Subtareas:
1. Crear servicio de gestión de sesiones en Redis
2. Actualizar middleware de autenticación
3. Implementar expiración de sesiones
4. Agregar funcionalidad de invalidación de sesiones

#### Implementación:
1. Crear `src/common/session/session.service.ts`
2. Actualizar servicios de autenticación para usar Redis
3. Implementar TTL para sesiones
4. Agregar endpoints para administración de sesiones

#### Archivos a crear/modificar:
- `src/common/session/session.service.ts`
- Servicios de autenticación existentes

### Tarea 7: Crear auditoría de intentos de login

#### Descripción
Implementar registro detallado de todos los intentos de login, exitosos y fallidos.

#### Subtareas:
1. Crear entidad de log de autenticación
2. Implementar servicio de logging
3. Agregar hooks a procesos de autenticación
4. Crear endpoints para consulta de logs

#### Implementación:
1. Crear entidad `AuthLog` en `src/entities`
2. Crear servicio `AuthLogService`
3. Agregar logging en procesos de login/logout
4. Crear controlador para consulta de logs

#### Archivos a crear:
- `src/entities/auth-log.entity.ts`
- `src/services/auth-log.service.ts`
- `src/controllers/auth-log.controller.ts`

### Tarea 8: Integrar Application Insights logging detallado

#### Descripción
Agregar trazabilidad completa a Application Insights para monitoreo y debugging.

#### Subtareas:
1. Configurar Application Insights
2. Agregar tracing a operaciones críticas
3. Implementar correlación de solicitudes
4. Agregar métricas personalizadas

#### Implementación:
1. Instalar `applicationinsights`
2. Configurar cliente de Application Insights
3. Agregar middleware de tracing
4. Instrumentar servicios y controladores

#### Archivos a crear/modificar:
- `src/common/logging/app-insights.config.ts`
- Middleware y servicios existentes

## Criterios de Aceptación

### Endpoints
- [ ] Todos los endpoints usan prefijo `/api/v1/`
- [ ] Rutas siguen el estándar `/api/v1/{module}/{entity}`
- [ ] No existen endpoints duplicados
- [ ] Todos los endpoints tienen documentación Swagger

### Seguridad
- [ ] Tokens se almacenan en HttpOnly Secure Cookies
- [ ] No hay tokens accesibles desde el frontend
- [ ] Sistema resiste XSS, CSRF y token theft
- [ ] Rate limiting implementado globalmente
- [ ] Sesiones almacenadas en Redis con expiración
- [ ] Auditoría de login implementada

### Validación
- [ ] Middleware de validación Zod implementado
- [ ] Todos los endpoints críticos tienen validación
- [ ] Respuestas de error estandarizadas

### Observabilidad
- [ ] Application Insights recibe trazabilidad completa
- [ ] Logs de autenticación disponibles
- [ ] Métricas de rate limiting implementadas

## Pruebas

### Pruebas Unitarias
- [ ] Validación de esquemas Zod
- [ ] Funcionalidad de cookies seguras
- [ ] Rate limiting por endpoint
- [ ] Gestión de sesiones en Redis

### Pruebas de Integración
- [ ] Migración de endpoints existentes
- [ ] Flujo completo de autenticación
- [ ] Validación de solicitudes
- [ ] Funcionalidad de logging

### Pruebas de Seguridad
- [ ] Protección contra XSS
- [ ] Protección contra CSRF
- [ ] Prevención de token theft
- [ ] Rate limiting bajo carga

## Entregables Finales

1. **Código Fuente**
   - Endpoints versionados en `/api/v1/`
   - Middleware de validación implementado
   - Sistema de autenticación seguro
   - Rate limiting global y por endpoint
   - Gestión de sesiones en Redis
   - Auditoría de login
   - Integración con Application Insights

2. **Documentación**
   - Documentación Swagger actualizada
   - Guía de migración de endpoints
   - Manual de seguridad
   - Especificaciones de validación

3. **Pruebas**
   - Suite de pruebas unitarias
   - Suite de pruebas de integración
   - Reporte de pruebas de seguridad
   - Resultados de pruebas de carga

## Riesgos e Identificación

### Riesgos Técnicos
1. **Incompatibilidad con clientes existentes**
   - Mitigación: Implementar redirecciones temporales
   - Plan B: Mantener endpoints v0 durante transición

2. **Problemas de rendimiento con Redis**
   - Mitigación: Configurar clúster de Redis
   - Plan B: Implementar fallback a almacenamiento en memoria

3. **Complejidad de migración de autenticación**
   - Mitigación: Implementar en paralelo ambos sistemas
   - Plan B: Migración gradual por módulo

### Riesgos de Seguridad
1. **Vulnerabilidades en nueva implementación**
   - Mitigación: Pruebas de penetración exhaustivas
   - Plan B: Revisión de seguridad por terceros

2. **Exposición accidental de tokens**
   - Mitigación: Revisión de código rigurosa
   - Plan B: Escaneo automático de seguridad

## Métricas de Éxito

1. **Disponibilidad**: 99.9% uptime
2. **Seguridad**: 0 vulnerabilidades críticas
3. **Rendimiento**: <100ms latencia adicional por validación
4. **Cobertura de pruebas**: >85% código cubierto
5. **Satisfacción del cliente**: >4.5/5 en encuesta post-migración

## Recursos Necesarios

### Humanos
- 2 Desarrolladores Backend
- 1 Ingeniero de DevOps
- 1 Especialista en Seguridad
- 1 QA Engineer

### Técnicos
- Instancia de Redis
- Application Insights
- Herramientas de prueba de carga
- Herramientas de análisis de seguridad

## Cronograma Detallado

### Semana 1
- Día 1-2: Implementar estructura de API v1
- Día 3-4: Normalizar rutas de agentes
- Día 5: Implementar middleware de validación

### Semana 2
- Día 6-7: Implementar autenticación con cookies seguras
- Día 8-9: Implementar rate limiting y gestión de sesiones
- Día 10: Auditoría de login y Application Insights

## Criterios de Finalización

El sprint se considerará completo cuando:
1. Todos los endpoints estén migrados a `/api/v1/`
2. El sistema de autenticación esté completamente blindado
3. Todas las pruebas unitarias e integración pasen
4. La documentación esté actualizada
5. Se haya realizado revisión de seguridad