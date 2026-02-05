# 🧠 Misybot Multitenant System Architecture

## 🎯 OBJETIVO GENERAL DEL PROYECTO

Diseñar y entregar un sistema multitenant para Misybot que permita:

- Crear automáticamente un tenant separado por cada cliente afiliado (empresas, sitios web, marcas, integradores)
- Garantizar aislamiento total de datos, cumplimiento de leyes de protección de datos (GDPR, Habeas Data, CCPA, Ley 1581 en Colombia)
- Proveer omnichannel AI (webchat, WhatsApp, Meta, Messenger, IG DMs, correo, API externa)
- Para cada tenant:
  - Generar contexto dinámico por usuario final
  - Mantener memoria local del negocio
  - Sincronizar datos hacia un contexto global controlado y anónimo
- Permitir aprendizaje autónomo: cada tenant alimenta el contexto global solo con información autorizada y anonimizada
- Atender clientes mediante agentes dedicados por tenant y un Meta-Agente global
- Cumplir principios de seguridad: Zero Trust, RLS, HMAC signing, JWT mutuo, mTLS, auditoría, trazabilidad, secreto mínimo, revocación de credenciales, control de consentimiento
- Incluir un Front Desk Service que valide seguridad, tokens, firma y consentimiento
- Permitir que cada tenant gestione sus propios canales, APIs, flujos, branding e integraciones

## 📚 ÉPICAS DEL SISTEMA

### ÉPICA 1: Seguridad y Autenticación Multitenant
Implementar mecanismos de seguridad robustos que permitan autenticación segura, autorización basada en roles, y protección de datos para cada tenant.

### ÉPICA 2: Aislamiento de Contexto por Tenant
Diseñar e implementar un sistema de almacenamiento y gestión de contexto que garantice el aislamiento total de datos entre tenants.

### ÉPICA 3: Front Desk Service como Gateway Inteligente
Crear un servicio de entrada que actúe como punto de control para todas las solicitudes, validando seguridad, tokens, firma y consentimiento.

### ÉPICA 4: Sistema Omnichannel
Implementar soporte para múltiples canales de comunicación (webchat, WhatsApp, Meta, Messenger, IG DMs, correo, API externa).

### ÉPICA 5: SDK para Sitios Externos
Desarrollar un SDK universal que permita la integración fácil y segura en sitios web externos.

### ÉPICA 6: Agentes IA Especializados por Tenant
Crear agentes inteligentes especializados que operen dentro del contexto de cada tenant.

### ÉPICA 7: Meta-Agente Global Orquestador
Implementar un agente global que coordine y orqueste los agentes especializados por tenant.

### ÉPICA 8: Sistema de Consentimiento y Privacidad
Diseñar e implementar un sistema de gestión de consentimiento que cumpla con regulaciones internacionales de privacidad.

### ÉPICA 9: Aprendizaje Autónomo Regulado
Crear un sistema que permita el aprendizaje autónomo regulado, donde cada tenant contribuya al contexto global de manera controlada y anónima.

### ÉPICA 10: Sistema de Auditoría y Trazabilidad
Implementar un sistema completo de auditoría y trazabilidad para todas las operaciones del sistema.

### ÉPICA 11: Gestión de Contexto Local y Global
Diseñar e implementar un sistema de gestión de contexto que mantenga memoria local del negocio y sincronice datos hacia un contexto global controlado.

### ÉPICA 12: Microservicios de Infraestructura
Crear microservicios especializados para autenticación, gestión de contexto, análisis y auditoría.

### ÉPICA 13: Sistema de Monitoreo y Métricas
Implementar un sistema de monitoreo y métricas que permita el seguimiento del rendimiento y la salud del sistema.

### ÉPICA 14: Escalabilidad y Alta Disponibilidad
Diseñar e implementar una arquitectura que permita escalar horizontalmente y garantizar alta disponibilidad.

### ÉPICA 15: Sistema de Despliegue y CI/CD
Crear un sistema de despliegue automatizado y pipelines de CI/CD para facilitar el desarrollo y mantenimiento del sistema.

## 👤 HISTORIAS DE USUARIO

### ÉPICA 1: Seguridad y Autenticación Multitenant

#### HU-1.1: Como sitio afiliado necesito un token seguro para usar el sistema
**Para que** mis clientes puedan interactuar sin comprometer datos del backend principal.

**Criterios de aceptación (Gherkin):**
```
Given un sitio afiliado registrado en el sistema
When solicita un Tenant Access Token (TAT)
Then el sistema genera un JWT firmado con tenantId, siteId, origin y permissions
And el token expira en 24 horas
And el token no contiene información de usuario final
And se registra la generación del token en el sistema de auditoría
```

**Consideraciones de seguridad y privacidad:**
- El token debe ser firmado criptográficamente
- No debe contener información personal identificable
- Debe tener un tiempo de expiración corto
- Se debe registrar en el sistema de auditoría

**Reglas del contexto local vs global:**
- El token solo tiene validez dentro del contexto del tenant
- No permite acceso al contexto global

#### HU-1.2: Como tenant necesito validar solicitudes firmadas para proteger mis datos
**Para que** solo solicitudes auténticas puedan acceder a mis servicios.

**Criterios de aceptación (Gherkin):**
```
Given una solicitud entrante a un tenant específico
When la solicitud incluye una firma HMAC válida
Then el sistema valida la firma contra el tenant secret
And permite el procesamiento de la solicitud
When la solicitud no incluye firma HMAC
Then el sistema rechaza la solicitud con error 401
When la firma HMAC no es válida
Then el sistema rechaza la solicitud con error 401
And se registra el intento fallido en el sistema de auditoría
```

**Consideraciones de seguridad y privacidad:**
- Validación criptográfica de todas las solicitudes
- Prevención de ataques de repetición con timestamps
- Registro de intentos fallidos
- Protección contra ataques de fuerza bruta

**Reglas del contexto local vs global:**
- Cada tenant tiene su propio secreto para firmas
- Las firmas solo son válidas para el tenant específico

#### HU-1.3: Como administrador necesito controlar el acceso basado en roles
**Para que** los usuarios solo puedan acceder a las funciones permitidas por su rol.

**Criterios de aceptación (Gherkin):**
```
Given un usuario autenticado con un rol específico
When intenta acceder a una función protegida
Then el sistema verifica si el rol tiene permiso para esa función
And permite el acceso si tiene permiso
And deniega el acceso si no tiene permiso
And registra el intento de acceso en el sistema de auditoría
```

**Consideraciones de seguridad y privacidad:**
- Implementación de RBAC (Role-Based Access Control)
- Validación en cada punto de acceso
- Registro de intentos de acceso denegados
- Mecanismos de revocación de permisos

**Reglas del contexto local vs global:**
- Los roles se definen por tenant
- No hay roles globales que trasciendan tenants

### ÉPICA 2: Aislamiento de Contexto por Tenant

#### HU-2.1: Como tenant necesito que mis datos estén completamente aislados de otros tenants
**Para que** mi información confidencial no pueda ser accedida por otros clientes.

**Criterios de aceptación (Gherkin):**
```
Given un tenant A con datos almacenados
When otro tenant B intenta acceder a esos datos
Then el sistema deniega el acceso
And registra el intento en el sistema de auditoría
When el tenant A accede a sus propios datos
Then el sistema permite el acceso
```

**Consideraciones de seguridad y privacidad:**
- Aislamiento total a nivel de base de datos
- Validación de tenantId en todas las consultas
- Encriptación de datos sensibles
- Prevención de inyección SQL

**Reglas del contexto local vs global:**
- Cada tenant tiene su propio espacio de almacenamiento
- Los datos no se comparten entre tenants sin consentimiento explícito

#### HU-2.2: Como sistema necesito mantener contexto dinámico por usuario final
**Para que** cada interacción sea personalizada y contextualizada.

**Criterios de aceptación (Gherkin):**
```
Given un usuario final interactuando con un tenant
When el usuario envía múltiples mensajes en una sesión
Then el sistema mantiene el contexto de la conversación
And utiliza ese contexto para personalizar las respuestas
When la sesión expira
Then el sistema limpia el contexto del usuario
```

**Consideraciones de seguridad y privacidad:**
- Protección del contexto del usuario
- Expiración automática del contexto
- Anonimización cuando sea necesario
- Consentimiento para mantener contexto

**Reglas del contexto local vs global:**
- El contexto del usuario es local al tenant
- Solo se sincroniza información anónima al contexto global

### ÉPICA 3: Front Desk Service como Gateway Inteligente

#### HU-3.1: Como gateway necesito validar todas las solicitudes entrantes
**Para que** solo solicitudes válidas y seguras puedan acceder al sistema.

**Criterios de aceptación (Gherkin):**
```
Given una solicitud entrante al sistema
When la solicitud pasa por el Front Desk Service
Then el sistema valida el token de acceso
And valida la firma HMAC
And verifica los permisos del tenant
And verifica el consentimiento del usuario
And permite el acceso si todas las validaciones pasan
And deniega el acceso si alguna validación falla
```

**Consideraciones de seguridad y privacidad:**
- Validación en múltiples capas
- Prevención de ataques DDoS con rate limiting
- Registro detallado de todas las solicitudes
- Respuestas seguras en caso de errores

**Reglas del contexto local vs global:**
- El Front Desk Service opera en el contexto del tenant
- No tiene acceso directo al contexto global

#### HU-3.2: Como gateway necesito enrutar solicitudes al agente adecuado
**Para que** cada solicitud sea atendida por el agente especializado correcto.

**Criterios de aceptación (Gherkin):**
```
Given una solicitud validada por el Front Desk Service
When el sistema analiza el contenido de la solicitud
Then determina el agente más adecuado para procesarla
And enruta la solicitud al agente correspondiente
And mantiene el contexto del tenant durante el enrutamiento
```

**Consideraciones de seguridad y privacidad:**
- Enrutamiento basado en contexto seguro
- Prevención de acceso no autorizado a agentes
- Registro del enrutamiento para auditoría
- Manejo seguro de datos durante el enrutamiento

**Reglas del contexto local vs global:**
- El enrutamiento se basa en el contexto local del tenant
- Los agentes globales solo se usan cuando es apropiado

### ÉPICA 4: Sistema Omnichannel

#### HU-4.1: Como usuario final quiero interactuar desde cualquier canal
**Para que** pueda comunicarme de la manera más conveniente para mí.

**Criterios de aceptación (Gherkin):**
```
Given un usuario final usando cualquier canal soportado
When el usuario envía un mensaje
Then el sistema recibe el mensaje independientemente del canal
And procesa el mensaje de la misma manera
And responde en el mismo canal
And mantiene el contexto de la conversación
```

**Consideraciones de seguridad y privacidad:**
- Validación de seguridad en todos los canales
- Protección de datos en tránsito
- Consentimiento por canal cuando sea necesario
- Registro de interacciones por canal

**Reglas del contexto local vs global:**
- El contexto se mantiene independientemente del canal
- Las preferencias por canal se almacenan localmente

#### HU-4.2: Como tenant quiero personalizar la experiencia por canal
**Para que** pueda adaptar mis respuestas al canal específico.

**Criterios de aceptación (Gherkin):**
```
Given un tenant con configuraciones por canal
When un usuario interactúa desde un canal específico
Then el sistema adapta las respuestas al formato del canal
And aplica las reglas de negocio del tenant para ese canal
And mantiene la coherencia del mensaje
```

**Consideraciones de seguridad y privacidad:**
- Configuraciones seguras por canal
- Validación de personalizaciones
- Protección de configuraciones sensibles
- Auditoría de cambios en configuraciones

**Reglas del contexto local vs global:**
- Las personalizaciones son locales al tenant
- No se comparten configuraciones entre tenants

### ÉPICA 5: SDK para Sitios Externos

#### HU-5.1: Como desarrollador quiero integrar fácilmente el SDK en mi sitio web
**Para que** pueda ofrecer funcionalidades de Misybot a mis usuarios rápidamente.

**Criterios de aceptación (Gherkin):**
```
Given un desarrollador con un sitio web
When integra el SDK de Misybot
Then puede inicializar el SDK con configuración mínima
And conectar el chat con una sola línea de código
And recibir eventos del chat
And enviar mensajes al sistema
```

**Consideraciones de seguridad y privacidad:**
- SDK seguro que no expone credenciales
- Validación de origen de las solicitudes
- Protección contra XSS y CSRF
- Minimización de datos expuestos

**Reglas del contexto local vs global:**
- El SDK opera en el contexto del tenant específico
- No tiene acceso al contexto global

#### HU-5.2: Como usuario final quiero una experiencia de chat consistente
**Para que** tenga una experiencia fluida e intuitiva.

**Criterios de aceptación (Gherkin):**
```
Given un usuario final usando el chat del SDK
When interactúa con el chat
Then recibe respuestas consistentes
And puede ver el historial de la conversación
And puede cambiar entre diferentes tipos de contenido
And recibe notificaciones en tiempo real
```

**Consideraciones de seguridad y privacidad:**
- Protección de datos del usuario en el frontend
- Validación de contenido antes de mostrarlo
- Prevención de inyección de scripts
- Consentimiento para almacenamiento local

**Reglas del contexto local vs global:**
- La experiencia es consistente dentro del contexto del tenant
- No se muestran datos de otros tenants

### ÉPICA 6: Agentes IA Especializados por Tenant

#### HU-6.1: Como tenant quiero agentes especializados para mis necesidades
**Para que** pueda automatizar procesos específicos de mi negocio.

**Criterios de aceptación (Gherkin):**
```
Given un tenant con necesidades específicas
When configura agentes especializados
Then los agentes pueden procesar solicitudes relacionadas
And aplican reglas de negocio del tenant
And mantienen contexto durante la interacción
And se comunican con otros servicios cuando es necesario
```

**Consideraciones de seguridad y privacidad:**
- Agentes con permisos limitados
- Validación de acciones de los agentes
- Registro de actividades de los agentes
- Protección de datos procesados por agentes

**Reglas del contexto local vs global:**
- Los agentes operan dentro del contexto del tenant
- Solo acceden a datos autorizados
- Pueden contribuir al contexto global de manera controlada

#### HU-6.2: Como administrador quiero monitorear el rendimiento de los agentes
**Para que** pueda optimizar su funcionamiento.

**Criterios de aceptación (Gherkin):**
```
Given un administrador del sistema
When accede al panel de monitoreo de agentes
Then puede ver métricas de rendimiento por agente
And puede ver tasas de éxito y error
And puede ver tiempos de respuesta
And puede identificar cuellos de botella
```

**Consideraciones de seguridad y privacidad:**
- Acceso restringido a métricas
- Anonimización de datos sensibles en métricas
- Protección contra acceso no autorizado a métricas
- Registro de acceso a información de monitoreo

**Reglas del contexto local vs global:**
- Las métricas son específicas por tenant
- Algunas métricas agregadas pueden ser globales (anonimizadas)

### ÉPICA 7: Meta-Agente Global Orquestador

#### HU-7.1: Como sistema necesito un orquestador global para coordinar agentes
**Para que** los agentes trabajen de manera coordinada y eficiente.

**Criterios de aceptación (Gherkin):**
```
Given múltiples agentes especializados
When se requiere una tarea compleja
Then el Meta-Agente coordina la ejecución de múltiples agentes
And gestiona las dependencias entre agentes
And maneja errores y reintentos
And asegura la consistencia de los resultados
```

**Consideraciones de seguridad y privacidad:**
- Orquestación segura entre agentes
- Validación de resultados de agentes
- Protección de datos durante la coordinación
- Registro de actividades del orquestador

**Reglas del contexto local vs global:**
- El Meta-Agente opera en el contexto global
- Solo accede a información autorizada y anónima
- Coordina actividades entre diferentes tenants cuando es apropiado

#### HU-7.2: Como tenant quiero que el Meta-Agente respete mis límites y configuraciones
**Para que** el sistema se adapte a mis necesidades específicas.

**Criterios de aceptación (Gherkin):**
```
Given un tenant con configuraciones específicas
When el Meta-Agente coordina actividades para ese tenant
Then respeta los límites de uso configurados
And aplica las reglas de negocio del tenant
And utiliza las preferencias del tenant
And notifica al tenant de actividades relevantes
```

**Consideraciones de seguridad y privacidad:**
- Respeto de configuraciones de privacidad
- Validación de límites de uso
- Protección de configuraciones sensibles
- Registro de actividades del Meta-Agente por tenant

**Reglas del contexto local vs global:**
- El Meta-Agente adapta su comportamiento al contexto local
- Mantiene separación entre tenants
- Solo comparte información autorizada

### ÉPICA 8: Sistema de Consentimiento y Privacidad

#### HU-8.1: Como usuario final quiero controlar mis datos y consentimientos
**Para que** tenga control sobre mi información personal.

**Criterios de aceptación (Gherkin):**
```
Given un usuario final
When accede a la gestión de consentimientos
Then puede ver qué datos se recopilan
And puede otorgar o revocar consentimientos específicos
And puede solicitar la eliminación de sus datos
And recibe confirmación de acciones tomadas
```

**Consideraciones de seguridad y privacidad:**
- Interfaz segura para gestión de consentimientos
- Validación de identidad del usuario
- Protección contra modificaciones no autorizadas
- Registro de cambios en consentimientos

**Reglas del contexto local vs global:**
- Los consentimientos son específicos por tenant
- Algunos consentimientos pueden tener alcance global (anonimizados)
- El sistema respeta las decisiones del usuario en todos los contextos

#### HU-8.2: Como tenant quiero cumplir con regulaciones de privacidad
**Para que** pueda operar legalmente en diferentes jurisdicciones.

**Criterios de aceptación (Gherkin):**
```
Given un tenant operando en una jurisdicción específica
When el sistema procesa datos de usuarios
Then aplica las regulaciones de privacidad correspondientes
And proporciona mecanismos de cumplimiento
And genera reportes de cumplimiento cuando se requieren
And notifica al tenant de obligaciones legales
```

**Consideraciones de seguridad y privacidad:**
- Implementación de múltiples marcos regulatorios
- Validación continua de cumplimiento
- Protección de datos sensibles de cumplimiento
- Registro de actividades de cumplimiento

**Reglas del contexto local vs global:**
- Las regulaciones se aplican por tenant según su jurisdicción
- Algunas prácticas de cumplimiento son globales
- El sistema se adapta a requisitos locales específicos

### ÉPICA 9: Aprendizaje Autónomo Regulado

#### HU-9.1: Como tenant quiero contribuir al conocimiento global de manera controlada
**Para que** pueda beneficiarme del aprendizaje colectivo sin comprometer mis datos.

**Criterios de aceptación (Gherkin):**
```
Given un tenant con datos locales valiosos
When el sistema identifica información que puede contribuir al conocimiento global
Then solicita consentimiento para compartir información anónima
And anonimiza los datos antes de compartir
And contribuye solo información autorizada
And mantiene mis datos sensibles privados
```

**Consideraciones de seguridad y privacidad:**
- Anonimización robusta de datos
- Validación de consentimiento explícito
- Protección de datos sensibles durante el proceso
- Registro de contribuciones al conocimiento global

**Reglas del contexto local vs global:**
- Solo se comparte información anónima y autorizada
- El tenant mantiene control total sobre sus datos
- El conocimiento global se construye de manera segura

#### HU-9.2: Como sistema quiero aprender de las interacciones de manera segura
**Para que** pueda mejorar continuamente la calidad del servicio.

**Criterios de aceptación (Gherkin):**
```
Given interacciones de usuarios con el sistema
When se procesan estas interacciones
Then el sistema extrae conocimiento útil de manera segura
And anonimiza los datos antes de cualquier análisis
And respeta los consentimientos de los usuarios
And mejora los modelos de IA con información autorizada
```

**Consideraciones de seguridad y privacidad:**
- Aprendizaje solo con datos autorizados
- Anonimización antes de cualquier procesamiento
- Validación de consentimientos
- Protección de modelos de aprendizaje

**Reglas del contexto local vs global:**
- El aprendizaje local mejora los servicios del tenant
- El aprendizaje global beneficia a todos los tenants
- Todo aprendizaje respeta la privacidad de los usuarios

### ÉPICA 10: Sistema de Auditoría y Trazabilidad

#### HU-10.1: Como administrador quiero auditoría completa de todas las operaciones
**Para que** pueda garantizar la seguridad y el cumplimiento.

**Criterios de aceptación (Gherkin):**
```
Given un administrador del sistema
When accede al sistema de auditoría
Then puede ver todas las operaciones realizadas
And puede filtrar por tenant, usuario, fecha, tipo de operación
And puede ver detalles de cada operación
And puede generar reportes de auditoría
```

**Consideraciones de seguridad y privacidad:**
- Protección del sistema de auditoría
- Validación de acceso a registros de auditoría
- Anonimización de datos sensibles en auditorías
- Registro de acceso al sistema de auditoría

**Reglas del contexto local vs global:**
- Auditoría detallada por tenant
- Algunos registros pueden ser globales (anonimizados)
- El sistema mantiene integridad de registros

#### HU-10.2: Como sistema quiero trazabilidad completa de solicitudes
**Para que** pueda diagnosticar problemas y optimizar el rendimiento.

**Criterios de aceptación (Gherkin):**
```
Given una solicitud entrante al sistema
When se procesa la solicitud
Then se genera un ID de trazabilidad único
And se registran todos los pasos del procesamiento
And se asocian métricas de rendimiento
And se pueden consultar los registros con el ID de trazabilidad
```

**Consideraciones de seguridad y privacidad:**
- Protección de información de trazabilidad
- Validación de acceso a registros de trazabilidad
- Anonimización cuando sea necesario
- Retención controlada de registros

**Reglas del contexto local vs global:**
- Trazabilidad completa dentro del contexto del tenant
- Algunos registros pueden cruzar contextos (anonimizados)
- El sistema mantiene consistencia en la trazabilidad

## 🛠️ TAREAS TÉCNICAS DETALLADAS

### ÉPICA 1: Seguridad y Autenticación Multitenant

#### HU-1.1: Como sitio afiliado necesito un token seguro para usar el sistema

1. **Diseñar estructura del Tenant Access Token (TAT)**
   - Definir campos requeridos: tenantId, siteId, origin, permissions, iat, exp
   - Seleccionar algoritmo de firma: RS256 para mayor seguridad
   - Definir tiempo de expiración: 24 horas
   - Implementar validaciones de estructura

2. **Implementar servicio de generación de TAT**
   - Crear TenantAccessTokenService
   - Implementar generación de tokens JWT firmados
   - Agregar almacenamiento seguro de claves
   - Implementar rotación de claves

3. **Implementar servicio de validación de TAT**
   - Crear método para verificar firma de tokens
   - Implementar validación de expiración
   - Agregar validación de campos requeridos
   - Implementar manejo de errores de validación

4. **Integrar TAT con base de datos de tenants**
   - Crear esquema de almacenamiento para tenants
   - Implementar CRUD de tenants
   - Agregar relación entre tenants y claves
   - Implementar migración de datos existentes

5. **Implementar endpoint de generación de TAT**
   - Crear controlador REST para generación de tokens
   - Agregar autenticación para acceso al endpoint
   - Implementar rate limiting para prevenir abusos
   - Agregar logging de generación de tokens

6. **Agregar revocación de tokens**
   - Implementar lista negra de tokens revocados
   - Agregar endpoint para revocar tokens
   - Implementar limpieza automática de tokens expirados
   - Agregar notificaciones de revocación

7. **Implementar refresh de tokens**
   - Diseñar mecanismo de refresh seguro
   - Implementar endpoint de refresh
   - Agregar validaciones de seguridad para refresh
   - Implementar expiración de refresh tokens

8. **Agregar pruebas unitarias para TAT**
   - Crear pruebas para generación de tokens
   - Agregar pruebas para validación de tokens
   - Implementar pruebas de integración
   - Agregar pruebas de seguridad

9. **Agregar pruebas de penetración para TAT**
   - Probar token tampering
   - Verificar protección contra replay attacks
   - Validar manejo de tokens expirados
   - Probar límites de rate limiting

10. **Documentar API de TAT**
    - Crear documentación de endpoints
    - Agregar ejemplos de uso
    - Documentar códigos de error
    - Incluir guía de seguridad

11. **Implementar monitoreo de TAT**
    - Agregar métricas de uso de tokens
    - Implementar alertas para uso anormal
    - Agregar dashboard de monitoreo
    - Implementar logging detallado

12. **Agregar auditoría de TAT**
    - Registrar generación de tokens
    - Registrar validación de tokens
    - Registrar revocaciones
    - Implementar retención de registros

#### HU-1.2: Como tenant necesito validar solicitudes firmadas para proteger mis datos

1. **Diseñar estructura de firma HMAC**
   - Definir formato de header para firma
   - Seleccionar algoritmo HMAC-SHA256
   - Definir campos a incluir en la firma
   - Agregar timestamp para prevención de replay

2. **Implementar generador de firmas HMAC**
   - Crear HmacSignatureService
   - Implementar generación de firmas para requests
   - Agregar almacenamiento seguro de secrets
   - Implementar rotación de secrets

3. **Implementar validador de firmas HMAC**
   - Crear método para verificar firmas
   - Agregar validación de timestamp
   - Implementar protección contra timing attacks
   - Agregar manejo de errores de validación

4. **Integrar HMAC con base de datos de secrets**
   - Crear esquema de almacenamiento para secrets
   - Implementar CRUD de secrets
   - Agregar encriptación de secrets en base de datos
   - Implementar migración de secrets existentes

5. **Implementar middleware de validación HMAC**
   - Crear middleware para NestJS
   - Agregar validación automática de firmas
   - Implementar rate limiting por tenant
   - Agregar logging de validaciones

6. **Agregar generación automática de secrets**
   - Implementar generador de secrets criptográficamente seguros
   - Agregar endpoint para rotación de secrets
   - Implementar notificaciones de rotación
   - Agregar mecanismo de fallback

7. **Implementar validación de timestamp**
   - Agregar verificación de frescura de requests
   - Definir ventana de tolerancia (5 minutos)
   - Implementar protección contra clock skew
   - Agregar logging de timestamps inválidos

8. **Agregar pruebas unitarias para HMAC**
   - Crear pruebas para generación de firmas
   - Agregar pruebas para validación de firmas
   - Implementar pruebas de integración
   - Agregar pruebas de seguridad

9. **Agregar pruebas de penetración para HMAC**
   - Probar HMAC spoofing
   - Verificar protección contra replay attacks
   - Validar manejo de timestamps inválidos
   - Probar límites de rate limiting

10. **Documentar uso de HMAC**
    - Crear documentación de implementación
    - Agregar ejemplos de generación de firmas
    - Documentar errores comunes
    - Incluir guía de seguridad

11. **Implementar monitoreo de HMAC**
    - Agregar métricas de validación de firmas
    - Implementar alertas para fallos de validación
    - Agregar dashboard de monitoreo
    - Implementar logging detallado

12. **Agregar auditoría de HMAC**
    - Registrar validaciones exitosas
    - Registrar fallos de validación
    - Registrar rotaciones de secret
    - Implementar retención de registros

#### HU-1.3: Como administrador necesito controlar el acceso basado en roles

1. **Diseñar modelo de roles y permisos**
   - Definir roles predefinidos: admin, operador, auditor
   - Crear sistema de permisos granular
   - Implementar jerarquía de roles
   - Agregar permisos personalizables

2. **Implementar servicio de gestión de roles**
   - Crear RoleManagementService
   - Implementar CRUD de roles
   - Agregar asignación de permisos a roles
   - Implementar herencia de roles

3. **Implementar servicio de gestión de usuarios**
   - Crear UserManagementService
   - Implementar CRUD de usuarios
   - Agregar asignación de roles a usuarios
   - Implementar autenticación de usuarios

4. **Integrar RBAC con base de datos**
   - Crear esquema de almacenamiento para roles
   - Crear esquema de almacenamiento para usuarios
   - Implementar relaciones entre usuarios y roles
   - Agregar índices para búsquedas eficientes

5. **Implementar middleware de autorización**
   - Crear middleware para NestJS
   - Agregar validación automática de permisos
   - Implementar cache de permisos
   - Agregar logging de accesos

6. **Agregar gestión de sesiones**
   - Implementar almacenamiento seguro de sesiones
   - Agregar expiración automática de sesiones
   - Implementar invalidación de sesiones
   - Agregar mecanismo de refresh de sesiones

7. **Implementar control de acceso a nivel de endpoint**
   - Agregar decoradores para permisos en controladores
   - Implementar validación de permisos en métodos
   - Agregar protección contra acceso no autorizado
   - Agregar logging de intentos de acceso

8. **Agregar pruebas unitarias para RBAC**
   - Crear pruebas para gestión de roles
   - Agregar pruebas para gestión de usuarios
   - Implementar pruebas de autorización
   - Agregar pruebas de integración

9. **Agregar pruebas de penetración para RBAC**
   - Probar escalación de privilegios
   - Verificar protección contra fuerza bruta
   - Validar manejo de sesiones inválidas
   - Probar bypass de controles de acceso

10. **Documentar sistema RBAC**
    - Crear documentación de roles y permisos
    - Agregar guía de administración
    - Documentar API de gestión
    - Incluir ejemplos de uso

11. **Implementar monitoreo de RBAC**
    - Agregar métricas de acceso por rol
    - Implementar alertas para accesos sospechosos
    - Agregar dashboard de monitoreo
    - Implementar logging detallado

12. **Agregar auditoría de RBAC**
    - Registrar cambios en roles y permisos
    - Registrar accesos a funciones protegidas
    - Registrar intentos de acceso fallidos
    - Implementar retención de registros

### ÉPICA 2: Aislamiento de Contexto por Tenant

#### HU-2.1: Como tenant necesito que mis datos estén completamente aislados de otros tenants

1. **Diseñar modelo de datos multitenant**
   - Definir campo tenantId obligatorio en todas las tablas
   - Crear esquema de particionamiento por tenant
   - Implementar políticas de seguridad a nivel de fila (RLS)
   - Agregar índices para optimizar consultas por tenant

2. **Implementar RLS en base de datos**
   - Crear políticas de seguridad para PostgreSQL
   - Agregar triggers para validación automática
   - Implementar funciones de validación de tenant
   - Agregar tests de seguridad para RLS

3. **Integrar tenantId en todos los servicios**
   - Modificar servicios existentes para incluir tenantId
   - Agregar validación automática de tenantId
   - Implementar middleware para inyección de tenantId
   - Agregar logging de operaciones por tenant

4. **Implementar almacenamiento por tenant**
   - Crear mecanismo de particionamiento de datos
   - Agregar encriptación de datos sensibles
   - Implementar backup por tenant
   - Agregar recuperación de datos por tenant

5. **Agregar validación de aislamiento**
   - Implementar tests de penetración para aislamiento
   - Agregar monitoreo de accesos cruzados
   - Implementar alertas para accesos no autorizados
   - Agregar auditoría de acceso a datos

6. **Implementar cache por tenant**
   - Modificar RedisService para usar namespaces por tenant
   - Agregar invalidación de cache por tenant
   - Implementar expiración de cache por tenant
   - Agregar monitoreo de uso de cache

7. **Agregar encriptación de datos en tránsito y reposo**
   - Implementar TLS 1.3 para todas las comunicaciones
   - Agregar encriptación de campos sensibles en base de datos
   - Implementar gestión de claves de encriptación
   - Agregar rotación automática de claves

8. **Implementar logging seguro por tenant**
   - Agregar tenantId a todos los registros de log
   - Implementar encriptación de logs sensibles
   - Agregar retención de logs por tenant
   - Implementar acceso controlado a logs

9. **Agregar pruebas unitarias para aislamiento**
   - Crear tests para validación de tenantId
   - Agregar tests para RLS
   - Implementar tests de integración multitenant
   - Agregar tests de seguridad

10. **Agregar pruebas de penetración para aislamiento**
    - Probar acceso a datos de otros tenants
    - Verificar efectividad de RLS
    - Validar encriptación de datos
    - Probar bypass de controles de aislamiento

11. **Documentar arquitectura multitenant**
    - Crear documentación de modelo de datos
    - Agregar guía de implementación de RLS
    - Documentar prácticas de seguridad
    - Incluir ejemplos de uso

12. **Implementar monitoreo de aislamiento**
    - Agregar métricas de acceso por tenant
    - Implementar alertas para accesos anómalos
    - Agregar dashboard de monitoreo multitenant
    - Implementar logging detallado

#### HU-2.2: Como sistema necesito mantener contexto dinámico por usuario final

1. **Diseñar modelo de contexto de usuario**
   - Definir estructura de contexto de sesión
   - Crear mecanismo de almacenamiento de contexto
   - Agregar versionado de contexto
   - Implementar compresión de contexto

2. **Implementar servicio de gestión de contexto**
   - Crear ContextManagementService
   - Implementar CRUD de contexto de usuario
   - Agregar mecanismo de actualización incremental
   - Implementar expiración automática de contexto

3. **Integrar contexto con almacenamiento**
   - Modificar RedisService para almacenamiento de contexto
   - Agregar persistencia de contexto en base de datos
   - Implementar sincronización entre cache y base de datos
   - Agregar backup de contexto

4. **Agregar compresión de contexto**
   - Implementar algoritmos de compresión eficientes
   - Agregar descompresión automática
   - Agregar límites de tamaño de contexto
   - Implementar fragmentación de contexto grande

5. **Implementar versionado de contexto**
   - Agregar control de versiones de contexto
   - Implementar historial de cambios de contexto
   - Agregar rollback de contexto
   - Implementar merge de contextos

6. **Agregar encriptación de contexto**
   - Implementar encriptación de contexto sensible
   - Agregar gestión de claves de encriptación
   - Implementar rotación de claves de contexto
   - Agregar desencriptación automática

7. **Implementar sincronización de contexto**
   - Crear mecanismo de sincronización en tiempo real
   - Agregar notificaciones de cambios de contexto
   - Implementar resolución de conflictos
   - Agregar consistencia eventual

8. **Agregar pruebas unitarias para contexto**
   - Crear tests para gestión de contexto
   - Agregar tests para compresión de contexto
   - Implementar tests de integración de contexto
   - Agregar tests de seguridad de contexto

9. **Agregar pruebas de rendimiento para contexto**
   - Probar tiempos de carga de contexto
   - Verificar eficiencia de compresión
   - Validar uso de memoria
   - Probar escalabilidad de contexto

10. **Documentar sistema de contexto**
    - Crear documentación de modelo de contexto
    - Agregar guía de uso de contexto
    - Documentar API de gestión de contexto
    - Incluir ejemplos de implementación

11. **Implementar monitoreo de contexto**
    - Agregar métricas de uso de contexto
    - Implementar alertas para contextos anómalos
    - Agregar dashboard de monitoreo de contexto
    - Implementar logging detallado

12. **Agregar auditoría de contexto**
    - Registrar cambios en contexto de usuarios
    - Registrar accesos a contexto
    - Registrar operaciones de contexto
    - Implementar retención de registros

## 🖥️ DISEÑO DE MICROSERVICIOS

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

## 📊 MODELO DE DATOS MULTITENANT

### Tablas relacionales

#### tenants
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(75) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    website_url VARCHAR(500),
    business_industry VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### tenant_credentials
```sql
CREATE TABLE tenant_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    client_id VARCHAR(100) UNIQUE NOT NULL,
    client_secret_encrypted TEXT NOT NULL,
    hmac_secret_encrypted TEXT NOT NULL,
    jwt_public_key TEXT,
    jwt_private_key_encrypted TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    rotated_at TIMESTAMP
);
```

#### tenant_domains
```sql
CREATE TABLE tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    domain VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### tenant_limits
```sql
CREATE TABLE tenant_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    agent_usage_limit INTEGER DEFAULT 1000,
    requests_per_minute INTEGER DEFAULT 100,
    requests_per_hour INTEGER DEFAULT 5000,
    storage_limit_mb INTEGER DEFAULT 1000,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### sessions
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    channel VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    context JSONB
) WITH (tenant_id);
```

#### conversations
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    session_id UUID,
    user_id VARCHAR(100),
    message TEXT,
    response TEXT,
    agent_name VARCHAR(100),
    sentiment VARCHAR(20),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) WITH (tenant_id);
```

#### workflows
```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    workflow_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
) WITH (tenant_id);
```

#### workflow_steps
```sql
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    workflow_id UUID,
    step_name VARCHAR(100),
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    input_data JSONB,
    output_data JSONB
) WITH (tenant_id);
```

#### local_context
```sql
CREATE TABLE local_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    context_key VARCHAR(255),
    context_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) WITH (tenant_id);
```

#### global_context
```sql
CREATE TABLE global_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_key VARCHAR(255),
    context_value JSONB,
    source_tenant_id UUID,
    anonymized BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### user_consent
```sql
CREATE TABLE user_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id VARCHAR(100),
    consent_type VARCHAR(100),
    granted BOOLEAN DEFAULT false,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    consent_details JSONB
) WITH (tenant_id);
```

### RLS policies

#### Política para tabla tenants
```sql
CREATE POLICY tenant_isolation_policy ON tenants
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla tenant_credentials
```sql
CREATE POLICY tenant_credentials_policy ON tenant_credentials
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla sessions
```sql
CREATE POLICY sessions_policy ON sessions
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla conversations
```sql
CREATE POLICY conversations_policy ON conversations
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla workflows
```sql
CREATE POLICY workflows_policy ON workflows
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla workflow_steps
```sql
CREATE POLICY workflow_steps_policy ON workflow_steps
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla local_context
```sql
CREATE POLICY local_context_policy ON local_context
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Política para tabla user_consent
```sql
CREATE POLICY user_consent_policy ON user_consent
FOR ALL TO authenticated
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Campos obligatorios

1. **tenantId** - Identificador único del tenant en todas las tablas
2. **contextScope** - Indicador de alcance del contexto (local/global)
3. **consentFlag** - Indicador de consentimiento para procesamiento de datos
4. **createdAt** - Timestamp de creación del registro
5. **updatedAt** - Timestamp de última actualización
6. **createdBy** - Identificador del usuario/tenant que creó el registro
7. **updatedBy** - Identificador del usuario/tenant que actualizó el registro

### Estructuras JSON para memoria, embeddings y aprendizajes

#### Estructura de memoria de contexto
```json
{
  "sessionId": "uuid-string",
  "userId": "user-identifier",
  "conversationHistory": [
    {
      "timestamp": "ISO-timestamp",
      "role": "user|assistant",
      "content": "message-content",
      "metadata": {
        "channel": "web|whatsapp|etc",
        "sentiment": "positive|negative|neutral",
        "confidence": 0.95
      }
    }
  ],
  "userPreferences": {
    "language": "es|en|fr",
    "tone": "formal|casual|professional",
    "topics": ["topic1", "topic2"]
  },
  "businessContext": {
    "industry": "technology|healthcare|finance",
    "size": "small|medium|large",
    "location": "country-code"
  },
  "sessionMetadata": {
    "startTime": "ISO-timestamp",
    "lastActivity": "ISO-timestamp",
    "channel": "web|whatsapp|etc",
    "device": "mobile|desktop"
  }
}
```

#### Estructura de embeddings
```json
{
  "embeddingId": "uuid-string",
  "sourceText": "original text content",
  "vector": [0.123, 0.456, 0.789],
  "metadata": {
    "tenantId": "tenant-uuid",
    "contentType": "conversation|document|faq",
    "language": "es|en|fr",
    "timestamp": "ISO-timestamp",
    "tags": ["tag1", "tag2"],
    "consentVerified": true
  },
  "anonymized": true,
  "anonymizationMetadata": {
    "method": "masking|hashing|removal",
    "originalFields": ["field1", "field2"]
  }
}
```

#### Estructura de aprendizajes
```json
{
  "learningId": "uuid-string",
  "type": "pattern|insight|correlation",
  "sourceTenantId": "tenant-uuid",
  "isGlobal": true,
  "content": {
    "pattern": "description of pattern",
    "confidence": 0.85,
    "supportingData": [
      {
        "dataPoint": "data-point-description",
        "relevance": 0.92
      }
    ],
    "application": "how to apply this learning"
  },
  "metadata": {
    "createdAt": "ISO-timestamp",
    "updatedAt": "ISO-timestamp",
    "contributors": ["tenant-uuid-1", "tenant-uuid-2"],
    "anonymized": true,
    "validationStatus": "pending|validated|rejected"
  }
}
```

## 🔒 ESQUEMA DE SEGURIDAD COMPLETO

### Flujo de firma HMAC por sitio afiliado

1. **Registro del sitio afiliado**
   - El sitio se registra en el tenant-manager
   - Se genera un client_id y client_secret únicos
   - Se crea un hmac_secret específico para el tenant
   - Se configuran los dominios permitidos

2. **Generación de firma HMAC**
   - El cliente construye el payload de la solicitud
   - Crea un timestamp actual en formato ISO
   - Concatena el método HTTP, URL, timestamp y payload
   - Genera la firma HMAC-SHA256 usando el hmac_secret
   - Agrega los headers: X-Misy-Timestamp, X-Misy-Signature

3. **Envío de solicitud**
   - El cliente envía la solicitud al front-desk
   - Incluye los headers de autenticación y firma
   - El payload se envía como body de la solicitud

4. **Validación en front-desk**
   - Se extrae el tenant_id del client_id
   - Se recupera el hmac_secret del tenant
   - Se reconstruye el mensaje firmado
   - Se verifica la firma HMAC
   - Se valida que el timestamp sea reciente (< 5 minutos)
   - Se verifica que el origen esté en la lista de dominios permitidos

5. **Respuesta**
   - Si la validación es exitosa, se procesa la solicitud
   - Si falla, se devuelve error 401 Unauthorized
   - Se registra el intento en los logs de seguridad

### External Instance Credentials Rotation

1. **Rotación programada**
   - Se ejecuta automáticamente cada 90 días
   - Se genera un nuevo conjunto de credenciales
   - Las credenciales antiguas entran en período de gracia de 30 días
   - Se notifica al tenant sobre la rotación

2. **Rotación manual**
   - El tenant puede solicitar rotación inmediata
   - Se genera nuevo conjunto de credenciales
   - Las antiguas se desactivan inmediatamente
   - Se notifica al tenant sobre la rotación

3. **Manejo de transición**
   - Durante el período de gracia, ambas credenciales son válidas
   - Se registra el uso de credenciales antiguas
   - Se alerta si se detecta uso excesivo de credenciales antiguas
   - Al finalizar el período de gracia, se eliminan las credenciales antiguas

4. **Notificaciones**
   - Se envía notificación 30 días antes de la rotación automática
   - Se envía notificación inmediata después de la rotación
   - Se envía recordatorios semanales durante el período de gracia
   - Se envía alerta final 24 horas antes de la eliminación

### AgentInvocationToken (JWT RS256)

1. **Generación del token**
   - El meta-agent-orchestrator genera un JWT con RS256
   - Incluye claims: agentId, tenantId, workflowId, permissions, exp
   - Se firma con clave privada del sistema
   - Tiene corta expiración (5-10 minutos)

2. **Contenido del token**
   ```json
   {
     "agentId": "uuid-string",
     "tenantId": "uuid-string",
     "workflowId": "uuid-string",
     "permissions": ["read", "write", "execute"],
     "exp": 1234567890,
     "iat": 1234567880,
     "iss": "meta-agent-orchestrator"
   }
   ```

3. **Validación del token**
   - Los agentes verifican la firma con clave pública
   - Validan que el token no haya expirado
   - Verifican que los permisos sean suficientes para la operación
   - Validan que el tenantId coincida con el contexto

4. **Uso del token**
   - Se incluye en el header Authorization: Bearer <token>
   - Se utiliza para todas las llamadas entre agentes
   - Se regenera automáticamente cuando está cerca de expirar
   - Se invalida si se detecta actividad sospechosa

### Validación de consentimiento

1. **Obtención de consentimiento**
   - Se presenta al usuario una solicitud clara de consentimiento
   - Se explican los propósitos del procesamiento de datos
   - Se ofrecen opciones granulares de consentimiento
   - Se registra el consentimiento con timestamp y método

2. **Verificación de consentimiento**
   - Antes de procesar datos personales, se verifica consentimiento
   - Se comprueba que el consentimiento no haya sido revocado
   - Se valida que el propósito del procesamiento esté cubierto
   - Se registra la verificación en logs de auditoría

3. **Gestión de consentimiento**
   - Los usuarios pueden ver sus consentimientos actuales
   - Se permite la revocación parcial o total del consentimiento
   - Se notifica a los sistemas afectados de cambios en consentimiento
   - Se implementa el derecho al olvido cuando se revoca consentimiento

4. **Cumplimiento regulatorio**
   - Se adapta el proceso a GDPR, CCPA, Ley 1581, etc.
   - Se generan reportes de cumplimiento cuando se requieren
   - Se implementan retenciones de datos según regulaciones
   - Se notifican brechas de seguridad cuando se detectan

### Límites contextuales por tenant

1. **Límites de uso de agentes**
   - Se define número máximo de invocaciones por agente por día
   - Se implementa rate limiting por minuto y hora
   - Se monitorea el uso para detectar patrones anómalos
   - Se notifica cuando se alcanzan límites configurados

2. **Límites de almacenamiento**
   - Se establece cuota máxima de almacenamiento por tenant
   - Se monitorea el uso de almacenamiento en tiempo real
   - Se notifica cuando se alcanza el 80% de la cuota
   - Se previene la escritura cuando se excede la cuota

3. **Límites de procesamiento**
   - Se define tiempo máximo de ejecución por solicitud
   - Se limita el tamaño máximo de payloads
   - Se controla el número de solicitudes concurrentes
   - Se implementa cola de solicitudes cuando se alcanzan límites

4. **Límites de red**
   - Se establece ancho de banda máximo por tenant
   - Se limita el número de conexiones simultáneas
   - Se implementa throttling por IP de origen
   - Se monitorea el tráfico para detectar abusos

### Encriptación en tránsito y reposo

1. **Encriptación en tránsito**
   - Se implementa TLS 1.3 para todas las comunicaciones
   - Se utilizan certificados X.509 válidos
   - Se configuran cipher suites seguras
   - Se implementa rotación automática de certificados

2. **Encriptación en reposo**
   - Se encriptan datos sensibles en base de datos
   - Se utilizan claves de encriptación por tenant
   - Se implementa rotación de claves periódica
   - Se utilizan HSM para almacenamiento de claves maestras

3. **Gestión de claves**
   - Se implementa jerarquía de claves (maestras, de datos, de sesión)
   - Se utilizan servicios de gestión de claves (Azure Key Vault, AWS KMS)
   - Se implementa separación de responsabilidades en gestión de claves
   - Se auditan todas las operaciones con claves

4. **Protección de datos**
   - Se implementa masking de datos en logs y monitoreo
   - Se utilizan tokens para datos sensibles en APIs
   - Se implementa data loss prevention (DLP)
   - Se validan entradas y salidas para prevenir inyecciones

### Auditoría granular

1. **Registro de eventos**
   - Se registran todas las operaciones de autenticación
   - Se auditan accesos a datos sensibles
   - Se registran cambios en configuraciones
   - Se auditan operaciones de administración

2. **Formato de logs**
   - Se utiliza formato estructurado (JSON)
   - Se incluyen campos obligatorios: timestamp, userId, tenantId, action, resource
   - Se implement