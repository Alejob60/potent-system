# 🔒 ESQUEMA DE SEGURIDAD COMPLETO

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
   - Se implementa encriptación de logs sensibles
   - Se configuran retenciones según regulaciones

3. **Almacenamiento seguro**
   - Se utilizan sistemas de almacenamiento inmutables
   - Se implementa replicación geográfica
   - Se configuran controles de acceso estrictos
   - Se aplican políticas de retención

4. **Análisis y reportes**
   - Se implementan dashboards de auditoría
   - Se configuran alertas para actividades sospechosas
   - Se generan reportes automáticos
   - Se integran con sistemas SIEM