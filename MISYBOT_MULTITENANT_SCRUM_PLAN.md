# 🧠 Misybot Multitenant System SCRUM Plan

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

## 🆕 NUEVAS ÉPICAS PARA COLOMBIATIC

### ÉPICA 16: Tenantización de Colombiatic
Configurar y registrar a Colombiatic como tenant propietario con privilegios especiales y acceso completo al sistema.

### ÉPICA 17: Modo Ventas Colombiatic
Implementar un modo especializado de ventas para Colombiatic que detecte intención de compra y guíe a los usuarios hacia la conversión.

### ÉPICA 18: Context Pack Inicial para Colombiatic
Crear y configurar un paquete de contexto inicial específico para Colombiatic que incluya su catálogo de servicios, beneficios y estrategias de venta.

### ÉPICA 19: Motor de Intención para Venta
Desarrollar un motor especializado de detección de intención de compra que identifique señales de interés y guíe a los usuarios hacia la conversión.

### ÉPICA 20: Flujo Omnicanal Básico para Ventas
Implementar un flujo básico de comunicación omnicanal que permita mantener conversaciones y transferir entre canales (web a WhatsApp).

### ÉPICA 21: Integración con Agentes Existententes para Ventas
Adaptar los agentes existentes para que funcionen en el contexto del modo ventas de Colombiatic y proporcionen respuestas especializadas.

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

### ÉPICA 16: Tenantización de Colombiatic

#### HU-16.1: Como sistema necesito registrar a Colombiatic como tenant propietario
**Para que** tenga acceso privilegiado a todos los agentes y funcionalidades del sistema.

**Criterios de aceptación (Gherkin):**
```
Given el sistema necesita registrar a Colombiatic como tenant propietario
When se ejecuta el proceso de registro con tenant_id = "colombiatic" y tipo = "propietario"
Then el sistema crea un tenant con acceso a todos los agentes internos
And asigna privilegios de sistema al tenant
And almacena las credenciales de forma segura
And registra el evento en el sistema de auditoría
```

**Consideraciones técnicas:**
- El tenant debe tener tenant_id = "colombiatic"
- El tenant debe tener tipo = "propietario"
- El tenant debe tener acceso a todos los agentes internos
- El tenant debe tener privilegios de sistema

**Validaciones de seguridad:**
- Las credenciales deben almacenarse de forma segura
- El proceso debe registrarse en el sistema de auditoría
- Solo procesos autorizados pueden crear tenants propietarios

**Manejo de errores:**
- Si ya existe un tenant con tenant_id = "colombiatic", se debe actualizar
- Si falla la creación del tenant, se debe registrar el error

**Ejemplos de inputs/outputs:**
- Input: tenant_id = "colombiatic", tipo = "propietario"
- Output: Tenant registrado con acceso completo al sistema

**Tests esperados:**
- Verificar que el tenant se crea con los parámetros correctos
- Verificar que el tenant tiene acceso a todos los agentes
- Verificar que el tenant tiene privilegios de sistema
- Verificar que se registran los eventos de auditoría

#### HU-16.2: Como administrador necesito configurar el Context Pack Inicial para Colombiatic
**Para que** el sistema tenga información sobre los servicios y estrategias de venta de Colombiatic.

**Criterios de aceptación (Gherkin):**
```
Given que Colombiatic está registrado como tenant propietario
When se configura el Context Pack Inicial
Then el sistema almacena la descripción de Colombiatic
And almacena el catálogo de servicios
And almacena los beneficios
And almacena los precios aproximados
And almacena el proceso de compra paso a paso
And almacena las estrategias recomendadas de venta
And almacena los enlaces directos (placeholder)
And registra la configuración en el sistema de auditoría
```

**Consideraciones técnicas:**
- El Context Pack debe incluir descripción de Colombiatic
- El Context Pack debe incluir catálogo de servicios
- El Context Pack debe incluir beneficios
- El Context Pack debe incluir precios aproximados
- El Context Pack debe incluir proceso de compra paso a paso
- El Context Pack debe incluir estrategias recomendadas de venta
- El Context Pack debe incluir enlaces directos (placeholder)

**Validaciones de seguridad:**
- La información debe almacenarse de forma segura
- El proceso debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la configuración del Context Pack, se debe registrar el error
- Si ya existe un Context Pack, se debe actualizar

**Ejemplos de inputs/outputs:**
- Input: Descripción, catálogo de servicios, beneficios, precios, proceso de compra, estrategias, enlaces
- Output: Context Pack almacenado en el sistema

**Tests esperados:**
- Verificar que el Context Pack se almacena correctamente
- Verificar que toda la información está presente
- Verificar que se registran los eventos de auditoría

#### HU-16.3: Como sistema necesito validar que solo Colombiatic tiene acceso privilegiado
**Para que** se mantenga la seguridad y se prevenga acceso no autorizado.

**Criterios de aceptación (Gherkin):**
```
Given un tenant intentando acceder a funcionalidades privilegiadas
When el tenant tiene tenant_id = "colombiatic"
Then el sistema permite el acceso
When el tenant no tiene tenant_id = "colombiatic"
Then el sistema deniega el acceso
And registra el intento en el sistema de auditoría
```

**Consideraciones técnicas:**
- Solo el tenant con tenant_id = "colombiatic" debe tener acceso privilegiado
- El sistema debe validar el tenant_id en cada solicitud
- El sistema debe registrar intentos de acceso denegado

**Validaciones de seguridad:**
- Validación criptográfica de todas las solicitudes
- Registro de intentos fallidos
- Protección contra ataques de fuerza bruta

**Manejo de errores:**
- Si falla la validación, se debe denegar el acceso
- Si se detecta un intento de acceso no autorizado, se debe registrar

**Ejemplos de inputs/outputs:**
- Input: tenant_id = "colombiatic" -> Output: Acceso permitido
- Input: tenant_id = "otro-tenant" -> Output: Acceso denegado

**Tests esperados:**
- Verificar que solo Colombiatic tiene acceso privilegiado
- Verificar que se registran intentos de acceso denegado
- Verificar que se protege contra ataques de fuerza bruta

### ÉPICA 17: Modo Ventas Colombiatic

#### HU-17.1: Como usuario visitante quiero que el sistema entienda los servicios de Colombiatic
**Para que** pueda identificar qué servicios están disponibles y cómo pueden ayudarme.

**Criterios de aceptación (Gherkin):**
```
Given un usuario visitante interactuando con el sistema
When el usuario menciona servicios de Colombiatic
Then el sistema identifica los servicios relevantes
And presenta información clara sobre cada servicio
And sugiere servicios basados en las necesidades del usuario
And registra la interacción en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe entender los servicios de Colombiatic
- El sistema debe presentar información clara sobre cada servicio
- El sistema debe sugerir servicios basados en las necesidades del usuario

**Validaciones de seguridad:**
- La información debe presentarse de forma segura
- La interacción debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si no se identifican servicios relevantes, se debe mostrar un mensaje apropiado
- Si falla la presentación de información, se debe registrar el error

**Ejemplos de inputs/outputs:**
- Input: "¿Qué servicios ofrecen?" -> Output: Lista de servicios de Colombiatic
- Input: "Necesito un sitio web" -> Output: Información sobre desarrollo de sitios web

**Tests esperados:**
- Verificar que el sistema identifica correctamente los servicios
- Verificar que la información se presenta de forma clara
- Verificar que se registran las interacciones

#### HU-17.2: Como usuario interesado quiero que el sistema detecte mi intención de compra
**Para que** pueda ser guiado hacia la conversión de manera efectiva.

**Criterios de aceptación (Gherkin):**
```
Given un usuario interactuando con el sistema
When el usuario muestra señales de interés en comprar
Then el sistema detecta la intención de compra
And activa el modo ventas especializado
And guía al usuario hacia la conversión
And registra la detección en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe detectar señales de interés en comprar
- El sistema debe activar el modo ventas especializado
- El sistema debe guiar al usuario hacia la conversión

**Validaciones de seguridad:**
- La detección debe realizarse de forma segura
- El evento debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la detección de intención, se debe registrar el error
- Si no se detecta intención, se debe continuar con el flujo normal

**Ejemplos de inputs/outputs:**
- Input: "Quiero contratar sus servicios" -> Output: Activación del modo ventas
- Input: "¿Cuánto cuesta?" -> Output: Activación del modo ventas

**Tests esperados:**
- Verificar que el sistema detecta correctamente la intención de compra
- Verificar que se activa el modo ventas especializado
- Verificar que se guía al usuario hacia la conversión
- Verificar que se registran los eventos

#### HU-17.3: Como usuario en proceso de compra quiero recibir links de pago según el servicio
**Para que** pueda completar la transacción de forma rápida y sencilla.

**Criterios de aceptación (Gherkin):**
```
Given un usuario en proceso de compra
When el usuario selecciona un servicio específico
Then el sistema genera un link de pago correspondiente
And presenta el link de forma clara al usuario
And registra la generación del link en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe generar links de pago según el servicio
- El sistema debe presentar los links de forma clara
- El sistema debe registrar la generación de links

**Validaciones de seguridad:**
- Los links de pago deben ser seguros
- La generación de links debe registrarse en el sistema de auditoría
- Los links deben expirar después de un tiempo

**Manejo de errores:**
- Si falla la generación del link, se debe registrar el error
- Si no se puede generar un link, se debe mostrar un mensaje apropiado

**Ejemplos de inputs/outputs:**
- Input: Selección de "Desarrollo de Sitios Web" -> Output: Link de pago para desarrollo web
- Input: Selección de "Marketing Digital" -> Output: Link de pago para marketing digital

**Tests esperados:**
- Verificar que se generan links de pago correctos
- Verificar que los links se presentan de forma clara
- Verificar que se registran las generaciones de links
- Verificar que los links son seguros

#### HU-17.4: Como usuario quiero poder cambiar de canal (WhatsApp, email)
**Para que** pueda continuar la conversación en mi canal preferido.

**Criterios de aceptación (Gherkin):**
```
Given un usuario en conversación con el sistema
When el usuario solicita cambiar de canal
Then el sistema permite la transferencia a WhatsApp o email
And mantiene la sesión y contexto de la conversación
And registra la transferencia en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe permitir transferencia a WhatsApp
- El sistema debe permitir transferencia a email
- El sistema debe mantener la sesión y contexto

**Validaciones de seguridad:**
- La transferencia debe realizarse de forma segura
- El evento debe registrarse en el sistema de auditoría
- El contexto debe protegerse durante la transferencia

**Manejo de errores:**
- Si falla la transferencia, se debe registrar el error
- Si no se puede realizar la transferencia, se debe mostrar un mensaje apropiado

**Ejemplos de inputs/outputs:**
- Input: "Prefiero continuar por WhatsApp" -> Output: Transferencia a WhatsApp
- Input: "Envíame la información por email" -> Output: Envío por email

**Tests esperados:**
- Verificar que se permite la transferencia a WhatsApp
- Verificar que se permite la transferencia a email
- Verificar que se mantiene la sesión y contexto
- Verificar que se registran las transferencias

### ÉPICA 18: Context Pack Inicial para Colombiatic

#### HU-18.1: Como sistema necesito almacenar la descripción de Colombiatic
**Para que** pueda proporcionar información contextualizada sobre la empresa.

**Criterios de aceptación (Gherkin):**
```
Given el sistema necesita almacenar información de Colombiatic
When se configura la descripción de la empresa
Then el sistema almacena la descripción en el Context Pack
And la información está disponible para los agentes
And se registra la acción en el sistema de auditoría
```

**Consideraciones técnicas:**
- La descripción debe ser clara y concisa
- La descripción debe estar disponible para todos los agentes
- La descripción debe poder actualizarse

**Validaciones de seguridad:**
- La información debe almacenarse de forma segura
- El acceso a la descripción debe estar controlado
- Las actualizaciones deben registrarse

**Manejo de errores:**
- Si falla el almacenamiento, se debe registrar el error
- Si no se puede acceder a la descripción, se debe mostrar un mensaje apropiado

**Ejemplos de inputs/outputs:**
- Input: Descripción de Colombiatic -> Output: Información almacenada y disponible

**Tests esperados:**
- Verificar que la descripción se almacena correctamente
- Verificar que está disponible para los agentes
- Verificar que se registran las acciones

#### HU-18.2: Como sistema necesito almacenar el catálogo de servicios
**Para que** pueda proporcionar información detallada sobre los servicios ofrecidos.

**Criterios de aceptación (Gherkin):**
```
Given el sistema necesita almacenar el catálogo de servicios
When se configura el catálogo de servicios de Colombiatic
Then el sistema almacena cada servicio con su descripción
And almacena los precios aproximados
And almacena los beneficios de cada servicio
And la información está disponible para los agentes
And se registra la acción en el sistema de auditoría
```

**Consideraciones técnicas:**
- Cada servicio debe tener descripción, precio y beneficios
- La información debe estar estructurada
- La información debe poder actualizarse

**Validaciones de seguridad:**
- La información debe almacenarse de forma segura
- El acceso al catálogo debe estar controlado
- Las actualizaciones deben registrarse

**Manejo de errores:**
- Si falla el almacenamiento, se debe registrar el error
- Si no se puede acceder al catálogo, se debe mostrar un mensaje apropiado

**Ejemplos de inputs/outputs:**
- Input: Lista de servicios con descripción, precio y beneficios -> Output: Catálogo almacenado

**Tests esperados:**
- Verificar que el catálogo se almacena correctamente
- Verificar que toda la información está presente
- Verificar que está disponible para los agentes
- Verificar que se registran las acciones

#### HU-18.3: Como sistema necesito almacenar estrategias recomendadas de venta
**Para que** los agentes puedan guiar efectivamente a los usuarios hacia la conversión.

**Criterios de aceptación (Gherkin):**
```
Given el sistema necesita almacenar estrategias de venta
When se configuran las estrategias recomendadas de venta
Then el sistema almacena cada estrategia con su descripción
And almacena los casos de uso recomendados
And la información está disponible para los agentes
And se registra la acción en el sistema de auditoría
```

**Consideraciones técnicas:**
- Cada estrategia debe tener descripción y casos de uso
- La información debe estar estructurada
- La información debe poder actualizarse

**Validaciones de seguridad:**
- La información debe almacenarse de forma segura
- El acceso a las estrategias debe estar controlado
- Las actualizaciones deben registrarse

**Manejo de errores:**
- Si falla el almacenamiento, se debe registrar el error
- Si no se puede acceder a las estrategias, se debe mostrar un mensaje apropiado

**Ejemplos de inputs/outputs:**
- Input: Lista de estrategias con descripción y casos de uso -> Output: Estrategias almacenadas

**Tests esperados:**
- Verificar que las estrategias se almacenan correctamente
- Verificar que toda la información está presente
- Verificar que está disponible para los agentes
- Verificar que se registran las acciones

### ÉPICA 19: Motor de Intención para Venta

#### HU-19.1: Como sistema necesito detectar señales de interés del usuario
**Para que** pueda activar el modo ventas y guiar al usuario hacia la conversión.

**Criterios de aceptación (Gherkin):**
```
Given un usuario interactuando con el sistema
When el usuario muestra señales de interés (palabras clave, preguntas específicas)
Then el sistema detecta las señales de interés
And activa el modo ventas especializado
And registra la detección en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe identificar palabras clave de interés
- El sistema debe reconocer preguntas específicas sobre servicios
- El sistema debe activar el modo ventas cuando se detecta interés

**Validaciones de seguridad:**
- La detección debe realizarse de forma segura
- El evento debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la detección, se debe registrar el error
- Si se detecta falsamente interés, se debe manejar apropiadamente

**Ejemplos de inputs/outputs:**
- Input: "Quiero contratar sus servicios" -> Output: Detección de interés
- Input: "¿Cuánto cuesta?" -> Output: Detección de interés

**Tests esperados:**
- Verificar que el sistema detecta correctamente las señales de interés
- Verificar que se activa el modo ventas
- Verificar que se registran las detecciones

#### HU-19.2: Como sistema necesito clasificar la intención del usuario
**Para que** pueda proporcionar respuestas y guía adecuadas según el estado de la conversación.

**Criterios de aceptación (Gherkin):**
```
Given un usuario en conversación con el sistema
When el sistema analiza la interacción del usuario
Then el sistema clasifica la intención en: interés, información, compra
And ajusta la respuesta según la intención clasificada
And registra la clasificación en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe clasificar en tres categorías: interés, información, compra
- El sistema debe ajustar las respuestas según la intención
- El sistema debe mantener contexto durante la clasificación

**Validaciones de seguridad:**
- La clasificación debe realizarse de forma segura
- El evento debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la clasificación, se debe registrar el error
- Si no se puede clasificar, se debe usar una categoría por defecto

**Ejemplos de inputs/outputs:**
- Input: "Estoy interesado en sus servicios" -> Output: Intención = interés
- Input: "¿Qué incluye el servicio?" -> Output: Intención = información
- Input: "Quiero contratar ahora" -> Output: Intención = compra

**Tests esperados:**
- Verificar que el sistema clasifica correctamente las intenciones
- Verificar que las respuestas se ajustan según la intención
- Verificar que se registran las clasificaciones

#### HU-19.3: Como sistema necesito persistir la intención detectada
**Para que** pueda mantener el contexto y guiar consistentemente al usuario hacia la conversión.

**Criterios de aceptación (Gherkin):**
```
Given un usuario con intención detectada
When el usuario continúa la conversación
Then el sistema mantiene la intención detectada
And utiliza la intención para guiar la conversación
And actualiza la intención si cambia el contexto
And registra los cambios en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe mantener la intención detectada durante la sesión
- El sistema debe utilizar la intención para guiar la conversación
- El sistema debe actualizar la intención si cambia el contexto

**Validaciones de seguridad:**
- La persistencia debe realizarse de forma segura
- Los cambios deben registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la persistencia, se debe registrar el error
- Si no se puede mantener la intención, se debe reiniciar el proceso

**Ejemplos de inputs/outputs:**
- Input: Intención = interés, continuación de conversación -> Output: Mantener intención
- Input: Cambio de contexto -> Output: Actualizar intención

**Tests esperados:**
- Verificar que el sistema mantiene la intención detectada
- Verificar que utiliza la intención para guiar la conversación
- Verificar que actualiza la intención cuando cambia el contexto
- Verificar que se registran los cambios

### ÉPICA 20: Flujo Omnicanal Básico para Ventas

#### HU-20.1: Como usuario quiero mantener la conversación en el canal web
**Para que** pueda interactuar de forma continua sin interrupciones.

**Criterios de aceptación (Gherkin):**
```
Given un usuario en conversación por web
When el usuario envía múltiples mensajes
Then el sistema mantiene la conversación en el mismo canal
And preserva el contexto de la conversación
And responde de forma coherente
And registra la interacción en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe mantener la conversación en el mismo canal
- El sistema debe preservar el contexto
- El sistema debe responder de forma coherente

**Validaciones de seguridad:**
- La conversación debe mantenerse segura
- La interacción debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si se pierde el contexto, se debe intentar recuperarlo
- Si falla la respuesta, se debe registrar el error

**Ejemplos de inputs/outputs:**
- Input: Serie de mensajes en web -> Output: Conversación continua en web

**Tests esperados:**
- Verificar que la conversación se mantiene en el mismo canal
- Verificar que se preserva el contexto
- Verificar que las respuestas son coherentes
- Verificar que se registran las interacciones

#### HU-20.2: Como usuario quiero poder transferir la conversación a WhatsApp
**Para que** pueda continuar la interacción en mi canal preferido.

**Criterios de aceptación (Gherkin):**
```
Given un usuario en conversación por web
When el usuario solicita transferencia a WhatsApp
Then el sistema permite la transferencia
And mantiene el contexto de la conversación
And envía un mensaje inicial a WhatsApp con el contexto
And registra la transferencia en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe permitir la transferencia a WhatsApp
- El sistema debe mantener el contexto durante la transferencia
- El sistema debe enviar un mensaje inicial con el contexto

**Validaciones de seguridad:**
- La transferencia debe realizarse de forma segura
- El contexto debe protegerse durante la transferencia
- La transferencia debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la transferencia, se debe registrar el error
- Si no se puede mantener el contexto, se debe informar al usuario

**Ejemplos de inputs/outputs:**
- Input: Solicitud de transferencia a WhatsApp -> Output: Transferencia con contexto

**Tests esperados:**
- Verificar que se permite la transferencia a WhatsApp
- Verificar que se mantiene el contexto
- Verificar que se envía el mensaje inicial
- Verificar que se registran las transferencias

#### HU-20.3: Como usuario quiero que el sistema mantenga la sesión y contexto durante la transferencia
**Para que** no tenga que repetir información al cambiar de canal.

**Criterios de aceptación (Gherkin):**
```
Given un usuario transfiriendo la conversación entre canales
When se realiza la transferencia
Then el sistema mantiene la sesión del usuario
And preserva el contexto de la conversación
And transfiere el historial de la conversación
And registra la transferencia en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe mantener la sesión del usuario
- El sistema debe preservar el contexto
- El sistema debe transferir el historial de la conversación

**Validaciones de seguridad:**
- La sesión debe mantenerse segura
- El contexto debe protegerse durante la transferencia
- La transferencia debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la transferencia de contexto, se debe registrar el error
- Si no se puede mantener la sesión, se debe informar al usuario

**Ejemplos de inputs/outputs:**
- Input: Transferencia entre canales -> Output: Sesión y contexto mantenidos

**Tests esperados:**
- Verificar que se mantiene la sesión del usuario
- Verificar que se preserva el contexto
- Verificar que se transfiere el historial
- Verificar que se registran las transferencias

### ÉPICA 21: Integración con Agentes Existententes para Ventas

#### HU-21.1: Como sistema necesito adaptar los agentes existentes para el modo ventas
**Para que** puedan proporcionar respuestas especializadas en el contexto de ventas de Colombiatic.

**Criterios de aceptación (Gherkin):**
```
Given el modo ventas de Colombiatic activado
When los agentes existentes procesan solicitudes
Then los agentes adaptan sus respuestas al contexto de ventas
And utilizan el Context Pack de Colombiatic
And enfocan las respuestas en la conversión
And registra la adaptación en el sistema de auditoría
```

**Consideraciones técnicas:**
- Los agentes deben adaptar sus respuestas al contexto de ventas
- Los agentes deben utilizar el Context Pack de Colombiatic
- Los agentes deben enfocar las respuestas en la conversión

**Validaciones de seguridad:**
- La adaptación debe realizarse de forma segura
- El evento debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la adaptación, se debe registrar el error
- Si no se puede adaptar, se debe usar el comportamiento por defecto

**Ejemplos de inputs/outputs:**
- Input: Modo ventas activado, solicitud a agente -> Output: Respuesta adaptada a ventas

**Tests esperados:**
- Verificar que los agentes adaptan sus respuestas
- Verificar que utilizan el Context Pack de Colombiatic
- Verificar que enfocan en la conversión
- Verificar que se registran las adaptaciones

#### HU-21.2: Como sistema necesito coordinar los agentes en el flujo de ventas
**Para que** proporcionen una experiencia coherente y efectiva al usuario.

**Criterios de aceptación (Gherkin):**
```
Given múltiples agentes participando en el flujo de ventas
When se procesan solicitudes en el modo ventas
Then el sistema coordina la participación de los agentes
And asegura una experiencia coherente para el usuario
And optimiza la interacción para la conversión
And registra la coordinación en el sistema de auditoría
```

**Consideraciones técnicas:**
- El sistema debe coordinar la participación de los agentes
- El sistema debe asegurar una experiencia coherente
- El sistema debe optimizar para la conversión

**Validaciones de seguridad:**
- La coordinación debe realizarse de forma segura
- El evento debe registrarse en el sistema de auditoría

**Manejo de errores:**
- Si falla la coordinación, se debe registrar el error
- Si no se puede coordinar, se debe usar un enfoque por defecto

**Ejemplos de inputs/outputs:**
- Input: Múltiples agentes en modo ventas -> Output: Coordinación efectiva

**Tests esperados:**
- Verificar que el sistema coordina la participación de los agentes
- Verificar que se asegura una experiencia coherente
- Verificar que se optimiza para la conversión
- Verificar que se registran las coordinaciones

## 🏗️ TAREAS TÉCNICAS DETALLADAS

### ÉPICA 16: Tenantización de Colombiatic

#### Tarea T-16.1: Registrar tenant propietario "colombiatic"
- **Análisis técnico**: Modificar el servicio de gestión de tenants para permitir la creación de tenants propietarios
- **Ajustes en el Meta-Agente**: Agregar lógica especial para tenants propietarios
- **Cambios en decision engine**: Añadir reglas para reconocer al tenant propietario
- **Ajustes en Redis session context**: Configurar contexto especial para el tenant propietario
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Añadir reconocimiento del tenant propietario
- **Formato JSON para tenant Colombiatic**: 
  ```json
  {
    "tenantId": "colombiatic",
    "siteId": "colombiatic-site",
    "tenantName": "Colombiatic",
    "contactEmail": "contacto@colombiatic.com",
    "websiteUrl": "https://colombiatic.com",
    "businessIndustry": "Tecnología",
    "allowedOrigins": ["https://colombiatic.com"],
    "permissions": ["read", "write", "admin", "system"],
    "tenantSecret": "[generado automáticamente]",
    "isActive": true,
    "tenantType": "propietario"
  }
  ```
- **Formato JSON del catálogo**: Definido en la ÉPICA 18
- **Pipeline de decisión Modo Ventas**: Activar cuando tenantId = "colombiatic" y siteType = "colombiatic"
- **Hooks para detección de intención**: Añadir hook para tenant propietario
- **Métricas y logging**: Registrar eventos especiales del tenant propietario
- **Ejemplos de prompts internos**: 
  ```
  Tenant propietario detectado: {tenantId}
  Activando modo administrador completo
  ```
- **Ajuste de roles y permisos**: Crear rol "propietario" con acceso completo
- **Validadores del tenant**: Añadir validador especial para tenants propietarios
- **Configuración del modo_ventas**: Activar automáticamente para tenant propietario

#### Tarea T-16.2: Configurar Context Pack Inicial
- **Análisis técnico**: Crear estructura de datos para el Context Pack de Colombiatic
- **Ajustes en el Meta-Agente**: Agregar almacenamiento del Context Pack
- **Cambios en decision engine**: Utilizar el Context Pack en decisiones
- **Ajustes en Redis session context**: Almacenar el Context Pack en contexto
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Utilizar información del Context Pack
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**:
  ```json
  {
    "servicios": [
      {
        "id": "desarrollo-web",
        "nombre": "Desarrollo de Sitios Web",
        "descripcion": "Creamos sitios web modernos y responsivos adaptados a tus necesidades",
        "beneficios": [
          "Diseño a medida",
          "Optimización para móviles",
          "Integración con redes sociales",
          "SEO básico incluido"
        ],
        "precioAproximado": "$500 - $5,000",
        "procesoCompra": [
          "Consulta inicial",
          "Propuesta de diseño",
          "Desarrollo",
          "Pruebas y ajustes",
          "Entrega y capacitación"
        ],
        "linkPago": "https://colombiatic.com/pagar/desarrollo-web"
      },
      {
        "id": "tienda-online",
        "nombre": "Tiendas Online",
        "descripcion": "Desarrollamos tiendas virtuales completas con pasarelas de pago",
        "beneficios": [
          "Catálogo de productos ilimitado",
          "Pasarelas de pago integradas",
          "Gestión de inventario",
          "Informes de ventas"
        ],
        "precioAproximado": "$1,000 - $10,000",
        "procesoCompra": [
          "Análisis de requerimientos",
          "Diseño de tienda",
          "Configuración de productos",
          "Integración de pagos",
          "Pruebas y lanzamiento"
        ],
        "linkPago": "https://colombiatic.com/pagar/tienda-online"
      }
    ]
  }
  ```
- **Pipeline de decisión Modo Ventas**: Utilizar catálogo en recomendaciones
- **Hooks para detección de intención**: Añadir hooks para servicios del catálogo
- **Métricas y logging**: Registrar uso del Context Pack
- **Ejemplos de prompts internos**: 
  ```
  Cargando Context Pack para Colombiatic
  Catálogo de servicios disponible: {numeroServicios} servicios
  ```
- **Ajuste de roles y permisos**: Permitir actualización del Context Pack
- **Validadores del tenant**: Validar integridad del Context Pack
- **Configuración del modo_ventas**: Integrar Context Pack en modo ventas

#### Tarea T-16.3: Implementar validación de acceso privilegiado
- **Análisis técnico**: Crear middleware de validación para acceso privilegiado
- **Ajustes en el Meta-Agente**: Agregar capa de validación de privilegios
- **Cambios en decision engine**: Añadir validación de privilegios
- **Ajustes en Redis session context**: Almacenar nivel de privilegios
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Validar privilegios antes de operaciones sensibles
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Validar privilegios en operaciones críticas
- **Hooks para detección de intención**: Añadir validación de privilegios
- **Métricas y logging**: Registrar intentos de acceso privilegiado
- **Ejemplos de prompts internos**: 
  ```
  Validando privilegios para tenant: {tenantId}
  Acceso privilegiado: {permitido|denegado}
  ```
- **Ajuste de roles y permisos**: Implementar sistema de privilegios
- **Validadores del tenant**: Añadir validador de privilegios
- **Configuración del modo_ventas**: Proteger operaciones del modo ventas

### ÉPICA 17: Modo Ventas Colombiatic

#### Tarea T-17.1: Implementar detección de servicios de Colombiatic
- **Análisis técnico**: Crear motor de reconocimiento de servicios en mensajes
- **Ajustes en el Meta-Agente**: Integrar motor de reconocimiento en flujo principal
- **Cambios en decision engine**: Añadir reglas para reconocimiento de servicios
- **Ajustes en Redis session context**: Almacenar servicios mencionados
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Añadir intención de consulta de servicios
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Activar cuando se mencionan servicios
- **Hooks para detección de intención**: Añadir hook para menciones de servicios
- **Métricas y logging**: Registrar detecciones de servicios
- **Ejemplos de prompts internos**: 
  ```
  Servicio detectado: {servicio}
  Cargando información detallada...
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar existencia de servicios mencionados
- **Configuración del modo_ventas**: Integrar reconocimiento de servicios

#### Tarea T-17.2: Implementar detección de intención de compra
- **Análisis técnico**: Crear motor de detección de señales de compra
- **Ajustes en el Meta-Agente**: Integrar motor de detección en flujo principal
- **Cambios en decision engine**: Añadir reglas para detección de intención de compra
- **Ajustes en Redis session context**: Almacenar estado de intención
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Añadir intención de compra
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Activar cuando se detecta intención de compra
- **Hooks para detección de intención**: Añadir hook para señales de compra
- **Métricas y logging**: Registrar detecciones de intención de compra
- **Ejemplos de prompts internos**: 
  ```
  Intención de compra detectada
  Activando modo ventas especializado
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar contexto para intención de compra
- **Configuración del modo_ventas**: Implementar estado de intención

#### Tarea T-17.3: Implementar generación de links de pago
- **Análisis técnico**: Crear servicio de generación de links de pago
- **Ajustes en el Meta-Agente**: Integrar servicio de links de pago
- **Cambios en decision engine**: Añadir reglas para generación de links
- **Ajustes en Redis session context**: Almacenar links generados
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Añadir intención de solicitud de pago
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Generar links cuando se selecciona servicio
- **Hooks para detección de intención**: Añadir hook para solicitudes de pago
- **Métricas y logging**: Registrar generaciones de links de pago
- **Ejemplos de prompts internos**: 
  ```
  Generando link de pago para: {servicio}
  Link generado: {url}
  ```
- **Ajuste de roles y permisos**: Proteger generación de links
- **Validadores del tenant**: Validar servicios para los que se generan links
- **Configuración del modo_ventas**: Integrar generación de links de pago

#### Tarea T-17.4: Implementar cambio de canal (WhatsApp, email)
- **Análisis técnico**: Crear mecanismo de transferencia entre canales
- **Ajustes en el Meta-Agente**: Integrar capacidad de transferencia
- **Cambios en decision engine**: Añadir reglas para transferencia de canal
- **Ajustes en Redis session context**: Mantener contexto durante transferencia
- **Ajustes en Service Bus**: Implementar cola para transferencias
- **Ajustes a motores de intención**: Añadir intención de cambio de canal
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Facilitar transferencia en modo ventas
- **Hooks para detección de intención**: Añadir hook para solicitudes de cambio de canal
- **Métricas y logging**: Registrar transferencias entre canales
- **Ejemplos de prompts internos**: 
  ```
  Solicitud de transferencia a: {canal}
  Preparando transferencia con contexto...
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar canales de destino
- **Configuración del modo_ventas**: Facilitar transferencias en modo ventas

### ÉPICA 18: Context Pack Inicial para Colombiatic

#### Tarea T-18.1: Implementar almacenamiento de descripción de Colombiatic
- **Análisis técnico**: Crear estructura de almacenamiento para descripción
- **Ajustes en el Meta-Agente**: Integrar almacenamiento de descripción
- **Cambios en decision engine**: Utilizar descripción en decisiones
- **Ajustes en Redis session context**: Almacenar descripción en contexto
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Utilizar descripción en respuestas
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Utilizar descripción en presentaciones
- **Hooks para detección de intención**: No requiere cambios
- **Métricas y logging**: Registrar accesos a descripción
- **Ejemplos de prompts internos**: 
  ```
  Cargando descripción de Colombiatic
  Descripción disponible: {longitud} caracteres
  ```
- **Ajuste de roles y permisos**: Proteger actualización de descripción
- **Validadores del tenant**: Validar formato de descripción
- **Configuración del modo_ventas**: Utilizar descripción en modo ventas

#### Tarea T-18.2: Implementar almacenamiento del catálogo de servicios
- **Análisis técnico**: Crear estructura de almacenamiento para catálogo
- **Ajustes en el Meta-Agente**: Integrar almacenamiento de catálogo
- **Cambios en decision engine**: Utilizar catálogo en decisiones
- **Ajustes en Redis session context**: Almacenar catálogo en contexto
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Utilizar catálogo en recomendaciones
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Utilizar catálogo en recomendaciones
- **Hooks para detección de intención**: Añadir hooks para servicios del catálogo
- **Métricas y logging**: Registrar accesos al catálogo
- **Ejemplos de prompts internos**: 
  ```
  Cargando catálogo de servicios
  Servicios disponibles: {numero} servicios
  ```
- **Ajuste de roles y permisos**: Proteger actualización del catálogo
- **Validadores del tenant**: Validar integridad del catálogo
- **Configuración del modo_ventas**: Utilizar catálogo en modo ventas

#### Tarea T-18.3: Implementar almacenamiento de estrategias recomendadas de venta
- **Análisis técnico**: Crear estructura de almacenamiento para estrategias
- **Ajustes en el Meta-Agente**: Integrar almacenamiento de estrategias
- **Cambios en decision engine**: Utilizar estrategias en decisiones
- **Ajustes en Redis session context**: Almacenar estrategias en contexto
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Utilizar estrategias en guía de ventas
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Utilizar estrategias en modo ventas
- **Hooks para detección de intención**: Añadir hooks para estrategias
- **Métricas y logging**: Registrar uso de estrategias
- **Ejemplos de prompts internos**: 
  ```
  Cargando estrategias de venta recomendadas
  Estrategias disponibles: {numero} estrategias
  ```
- **Ajuste de roles y permisos**: Proteger actualización de estrategias
- **Validadores del tenant**: Validar formato de estrategias
- **Configuración del modo_ventas**: Utilizar estrategias en modo ventas

### ÉPICA 19: Motor de Intención para Venta

#### Tarea T-19.1: Implementar detección de señales de interés
- **Análisis técnico**: Crear motor de procesamiento de lenguaje natural para señales de interés
- **Ajustes en el Meta-Agente**: Integrar motor de detección de señales
- **Cambios en decision engine**: Añadir reglas para procesamiento de señales
- **Ajustes en Redis session context**: Almacenar señales detectadas
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Añadir intención de detección de señales
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Activar detección en modo ventas
- **Hooks para detección de intención**: Añadir hook para señales de interés
- **Métricas y logging**: Registrar detecciones de señales
- **Ejemplos de prompts internos**: 
  ```
  Analizando señales de interés...
  Señal detectada: {tipoSeñal}
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar contexto para detección de señales
- **Configuración del modo_ventas**: Integrar detección de señales

#### Tarea T-19.2: Implementar clasificación de intención del usuario
- **Análisis técnico**: Crear clasificador de intención basado en contexto y mensajes
- **Ajustes en el Meta-Agente**: Integrar clasificador de intención
- **Cambios en decision engine**: Añadir reglas para clasificación de intención
- **Ajustes en Redis session context**: Almacenar clasificación de intención
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Añadir intención de clasificación
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Utilizar clasificación en modo ventas
- **Hooks para detección de intención**: Añadir hook para clasificación
- **Métricas y logging**: Registrar clasificaciones de intención
- **Ejemplos de prompts internos**: 
  ```
  Clasificando intención del usuario...
  Intención clasificada: {categoria}
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar categorías de intención
- **Configuración del modo_ventas**: Utilizar clasificación en modo ventas

#### Tarea T-19.3: Implementar persistencia de intención detectada
- **Análisis técnico**: Crear mecanismo de persistencia de estado de intención
- **Ajustes en el Meta-Agente**: Integrar persistencia de intención
- **Cambios en decision engine**: Utilizar intención persistida en decisiones
- **Ajustes en Redis session context**: Almacenar intención persistida
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Utilizar intención persistida
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Utilizar intención persistida
- **Hooks para detección de intención**: Añadir hook para actualización de intención
- **Métricas y logging**: Registrar cambios en intención
- **Ejemplos de prompts internos**: 
  ```
  Persistiendo intención detectada...
  Intención actual: {estado}
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar consistencia de intención
- **Configuración del modo_ventas**: Utilizar intención persistida

### ÉPICA 20: Flujo Omnicanal Básico para Ventas

#### Tarea T-20.1: Implementar mantenimiento de conversación en canal web
- **Análisis técnico**: Crear mecanismo de seguimiento de conversación en web
- **Ajustes en el Meta-Agente**: Integrar seguimiento de conversación web
- **Cambios en decision engine**: Mantener contexto en decisiones web
- **Ajustes en Redis session context**: Almacenar contexto de conversación web
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Utilizar contexto web en intenciones
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Mantener contexto web en modo ventas
- **Hooks para detección de intención**: Añadir hook para eventos web
- **Métricas y logging**: Registrar interacciones web
- **Ejemplos de prompts internos**: 
  ```
  Manteniendo conversación en canal web
  Sesión web: {sessionId}
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar sesiones web
- **Configuración del modo_ventas**: Mantener contexto web en modo ventas

#### Tarea T-20.2: Implementar transferencia de conversación a WhatsApp
- **Análisis técnico**: Crear mecanismo de transferencia a WhatsApp
- **Ajustes en el Meta-Agente**: Integrar capacidad de transferencia a WhatsApp
- **Cambios en decision engine**: Añadir reglas para transferencia a WhatsApp
- **Ajustes en Redis session context**: Mantener contexto durante transferencia
- **Ajustes en Service Bus**: Implementar cola para mensajes de WhatsApp
- **Ajustes a motores de intención**: Añadir intención de transferencia a WhatsApp
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Facilitar transferencia a WhatsApp
- **Hooks para detección de intención**: Añadir hook para solicitudes de WhatsApp
- **Métricas y logging**: Registrar transferencias a WhatsApp
- **Ejemplos de prompts internos**: 
  ```
  Preparando transferencia a WhatsApp...
  Contexto transferido: {tamaño} caracteres
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar números de WhatsApp
- **Configuración del modo_ventas**: Facilitar transferencia en modo ventas

#### Tarea T-20.3: Implementar mantenimiento de sesión y contexto durante transferencia
- **Análisis técnico**: Crear mecanismo de serialización de contexto para transferencia
- **Ajustes en el Meta-Agente**: Integrar serialización de contexto
- **Cambios en decision engine**: Mantener contexto en transferencias
- **Ajustes en Redis session context**: Serializar contexto para transferencia
- **Ajustes en Service Bus**: Utilizar contexto serializado
- **Ajustes a motores de intención**: Utilizar contexto transferido
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Mantener contexto en transferencias
- **Hooks para detección de intención**: Añadir hook para transferencias
- **Métricas y logging**: Registrar transferencias con contexto
- **Ejemplos de prompts internos**: 
  ```
  Serializando contexto para transferencia...
  Contexto serializado: {tamaño} bytes
  ```
- **Ajuste de roles y permisos**: Proteger contexto transferido
- **Validadores del tenant**: Validar integridad de contexto transferido
- **Configuración del modo_ventas**: Mantener contexto en transferencias

### ÉPICA 21: Integración con Agentes Existentes para Ventas

#### Tarea T-21.1: Adaptar agentes existentes para modo ventas
- **Análisis técnico**: Modificar agentes para reconocer y adaptarse al modo ventas
- **Ajustes en el Meta-Agente**: Integrar modo ventas en agentes
- **Cambios en decision engine**: Añadir reglas para modo ventas en agentes
- **Ajustes en Redis session context**: Proporcionar contexto de ventas a agentes
- **Ajustes en Service Bus**: No requiere cambios
- **Ajustes a motores de intención**: Adaptar intenciones para modo ventas
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Coordinar con agentes adaptados
- **Hooks para detección de intención**: Añadir hooks para agentes en modo ventas
- **Métricas y logging**: Registrar adaptaciones de agentes
- **Ejemplos de prompts internos**: 
  ```
  Adaptando agente {nombre} para modo ventas
  Contexto de ventas aplicado
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar adaptaciones de agentes
- **Configuración del modo_ventas**: Coordinar con agentes adaptados

#### Tarea T-21.2: Coordinar agentes en flujo de ventas
- **Análisis técnico**: Crear orquestador de agentes para el flujo de ventas
- **Ajustes en el Meta-Agente**: Integrar orquestador de agentes
- **Cambios en decision engine**: Añadir reglas para coordinación de agentes
- **Ajustes en Redis session context**: Almacenar estado de coordinación
- **Ajustes en Service Bus**: Utilizar para comunicación entre agentes
- **Ajustes a motores de intención**: Coordinar intenciones entre agentes
- **Formato JSON para tenant Colombiatic**: Ya definido
- **Formato JSON del catálogo**: Ya definido
- **Pipeline de decisión Modo Ventas**: Utilizar orquestador en modo ventas
- **Hooks para detección de intención**: Añadir hooks para coordinación
- **Métricas y logging**: Registrar coordinaciones de agentes
- **Ejemplos de prompts internos**: 
  ```
  Coordinando agentes para flujo de ventas...
  Agentes participantes: {numero}
  ```
- **Ajuste de roles y permisos**: No requiere cambios
- **Validadores del tenant**: Validar coordinaciones de agentes
- **Configuración del modo_ventas**: Utilizar orquestador en modo ventas

#### Criterios de Done
- [ ] Mantenimiento de conversación en canal web implementado
- [ ] Transferencia de conversación a WhatsApp funcionando
- [ ] Mantenimiento de sesión y contexto durante transferencia
- [ ] Agentes existentes adaptados para modo ventas
- [ ] Coordinación de agentes en flujo de ventas implementada
- [ ] Todas las pruebas unitarias pasan
- [ ] Código revisado y aprobado
- [ ] Documentación técnica actualizada

#### Riesgos
1. **Pérdida de contexto en transferencias**: Podría afectar la continuidad de la conversación
   - *Mitigación*: Implementar mecanismos de serialización robustos y pruebas exhaustivas
2. **Fallo en coordinación de agentes**: Podría llevar a respuestas inconsistentes
   - *Mitigación*: Implementar orquestador centralizado y validación de coordinación
3. **Problemas de compatibilidad entre canales**: Podría impedir transferencias efectivas
   - *Mitigación*: Crear adaptadores específicos por canal y pruebas de integración

#### Mitigaciones
- Implementar pruebas e2e para flujos omnicanal
- Crear monitoreo de transferencias y contexto
- Establecer procesos de fallback para fallos de transferencia
- Documentar todos los flujos de comunicación entre canales

#### Dependencias
- Sprint 2 completado
- Servicios de mensajería completamente configurados
- Agentes existentes funcionales

## ⚙️ HABILITADORES TÉCNICOS

### Esquema JSON del tenant Colombiatic
```json
{
  "tenantId": "colombiatic",
  "siteId": "colombiatic-site",
  "tenantName": "Colombiatic",
  "contactEmail": "contacto@colombiatic.com",
  "websiteUrl": "https://colombiatic.com",
  "businessIndustry": "Tecnología",
  "allowedOrigins": ["https://colombiatic.com"],
  "permissions": ["read", "write", "admin", "system"],
  "tenantSecret": "[generado automáticamente]",
  "isActive": true,
  "tenantType": "propietario"
}
```

### Esquema JSON del catálogo
```json
{
  "servicios": [
    {
      "id": "desarrollo-web",
      "nombre": "Desarrollo de Sitios Web",
      "descripcion": "Creamos sitios web modernos y responsivos adaptados a tus necesidades",
      "beneficios": [
        "Diseño a medida",
        "Optimización para móviles",
        "Integración con redes sociales",
        "SEO básico incluido"
      ],
      "precioAproximado": "$500 - $5,000",
      "procesoCompra": [
        "Consulta inicial",
        "Propuesta de diseño",
        "Desarrollo",
        "Pruebas y ajustes",
        "Entrega y capacitación"
      ],
      "linkPago": "https://colombiatic.com/pagar/desarrollo-web"
    },
    {
      "id": "tienda-online",
      "nombre": "Tiendas Online",
      "descripcion": "Desarrollamos tiendas virtuales completas con pasarelas de pago",
      "beneficios": [
        "Catálogo de productos ilimitado",
        "Pasarelas de pago integradas",
        "Gestión de inventario",
        "Informes de ventas"
      ],
      "precioAproximado": "$1,000 - $10,000",
      "procesoCompra": [
        "Análisis de requerimientos",
        "Diseño de tienda",
        "Configuración de productos",
        "Integración de pagos",
        "Pruebas y lanzamiento"
      ],
      "linkPago": "https://colombiatic.com/pagar/tienda-online"
    }
  ]
}
```

### Reglas del AIDecisionEngine para modo ventas
```typescript
// Reglas para activar modo ventas
const ventasRules = {
  tenantId: "colombiatic",
  siteType: "colombiatic",
  triggers: [
    {
      pattern: ["comprar", "contratar", "precio", "costo", "presupuesto", "cotizaci n", "venta", "sitio web", "desarrollo", "cuanto", "interesado", "necesito"],
      action: "activate_sales_mode",
      confidence: 0.8
    },
    {
      pattern: ["quiero", "deseo", "necesito", "me interesa"],
      context: ["servicio", "producto", "desarrollo", "tienda", "web"],
      action: "activate_sales_mode",
      confidence: 0.7
    }
  ]
};

// Reglas para detección de intención
const intentRules = {
  interest: {
    patterns: ["interesado", "informaci n", "saber m s", "detalles", "caracter stica", "beneficio"],
    confidence: 0.6
  },
  information: {
    patterns: ["qu es", "c mo funciona", "proceso", "pasos", "etapas"],
    confidence: 0.7
  },
  purchase: {
    patterns: ["comprar", "contratar", "precio", "costo", "presupuesto", "pagar", "ahora"],
    confidence: 0.9
  }
};
```

### Modificaciones al session_context
```typescript
interface SalesContext {
  tenantId: "colombiatic";
  siteType: "colombiatic";
  mode: "sales";
  intent: "interest" | "information" | "purchase";
  detectedAt: Date;
  servicesMentioned: string[];
  currentService: string | null;
  paymentLinkGenerated: boolean;
  channelTransferRequested: boolean;
  channelTransferTo: "whatsapp" | "email" | null;
  conversationHistory: Array<{
    channel: "web" | "whatsapp" | "email";
    message: string;
    timestamp: Date;
  }>;
}
```

### Pipeline de clasificación de intención
```
graph TD
    A[Usuario envía mensaje] --> B{Contiene palabras clave de venta?}
    B -->|Sí| C[Detección de intención]
    B -->|No| D[Flujo normal]
    C --> E{Intención = interés?}
    E -->|Sí| F[Activar modo ventas]
    E -->|No| G{Intención = información?}
    G -->|Sí| H[Proporcionar información detallada]
    G -->|No| I{Intención = compra?}
    I -->|Sí| J[Generar link de pago]
    I -->|No| K[Mantener conversación]
```

### Prompt interno para Modo Ventas
```
SYSTEM: Modo ventas activado para tenant propietario Colombiatic
CONTEXT: {contextPack}
CATALOG: {catalog}
USER_INTENT: {detectedIntent}
CURRENT_SERVICE: {currentService}

INSTRUCCIONES:
1. Si la intención es "interés", presenta servicios relevantes del catálogo
2. Si la intención es "información", proporciona detalles del servicio mencionado
3. Si la intención es "compra", genera link de pago y ofrece canales de contacto
4. Si el usuario solicita cambio de canal, facilita la transferencia manteniendo contexto
5. Mantén registro de la conversación en todos los canales
```

### Prompt interno para persistencia de intención
```
SYSTEM: Persistencia de intención de venta
USER_ID: {userId}
SESSION_ID: {sessionId}
CURRENT_INTENT: {currentIntent}
PREVIOUS_INTENT: {previousIntent}
TIMESTAMP: {timestamp}

INSTRUCCIONES:
1. Actualizar intención en contexto de sesión
2. Registrar cambio en historial de intenciones
3. Notificar a agentes coordinados del cambio
4. Validar coherencia con historial de conversación
5. Si hay cambio significativo, reiniciar flujo de ventas
```

### Parámetros para WhatsApp fallback
```typescript
interface WhatsAppConfig {
  phoneNumber: "+573001234567"; // Número de ColombiaTIC
  templateMessages: {
    salesInquiry: "¡Hola! Gracias por tu interés en nuestros servicios. ¿En qué puedo ayudarte hoy?";
    serviceDetails: "Te comparto información detallada sobre {serviceName}";
    paymentLink: "Aquí tienes el link para realizar el pago: {paymentLink}";
    contextTransfer: "Continuemos nuestra conversación aquí. El contexto de nuestra charla es: {contextSummary}";
  };
  apiKey: "[API_KEY_WHATSAPP]";
  businessAccountId: "[BUSINESS_ACCOUNT_ID]";
}
```

## 🏗️ ARCHITECTURE OUTPUT

### Diagrama descriptivo en texto

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              META-AGENT                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │    Modos        │  │  Context Loader │  │  Intent Engine  │             │
│  │  - Marketing    │  │                 │  │                 │             │
│  │  - Soporte      │  │  Carga contexto │  │  Detecta intención│             │
│  │  - Ventas       │  │  del tenant     │  │  de venta       │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                       │                 │                      │
│           ▼                       ▼                 ▼                      │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                    Routing & Orquestación                       │        │
│  │  - AIDecisionEngine                                             │        │
│  │  - AgentCoordinator                                             │        │
│  │  - ChannelManager                                               │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│           │                       │                 │                      │
│           ▼                       ▼                 ▼                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Web Channel    │  │WhatsApp Channel │  │  Email Channel  │             │
│  │                 │  │                 │  │                 │             │
│  │  FrontDesk V2   │  │  WhatsApp API   │  │  Email Service  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                       │                 │                      │
└─────────────────────────────────────────────────────────────────────────────┘
           │                       │                 │
           ▼                       ▼                 ▼
┌─────────────────┐    ┌─────────────────┐  ┌─────────────────┐
│     Redis       │    │   PostgreSQL    │  │   Service Bus   │
│  Session Store  │    │  Data Storage   │  │ Message Broker  │
│  Context Cache  │    │  Tenant Data    │  │ Agent Comms     │
└─────────────────┘    └─────────────────┘  └─────────────────┘
           │                       │                 │
           ▼                       ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Agentes Especializados                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │Trend Scanner V2 │  │Video Scriptor V2│  │FAQ Responder V2 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │Post Scheduler V2│  │Analytics Reporter│  │Creative Synth.  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📦 DELIVERABLE FINAL

El plan SCRUM detallado para ajustar el Meta-Agente para Colombiatic ha sido completado con:

### ✅ Épicas definidas:
1. Tenantización de Colombiatic
2. Modo Ventas Colombiatic
3. Context Pack Inicial para Colombiatic
4. Motor de Intención para Venta
5. Flujo Omnicanal Básico para Ventas
6. Integración con Agentes Existentes para Ventas

### ✅ Historias de usuario completas:
- 3 historias para la ÉPICA 16
- 4 historias para la ÉPICA 17
- 3 historias para la ÉPICA 18
- 3 historias para la ÉPICA 19
- 3 historias para la ÉPICA 20
- 2 historias para la ÉPICA 21

### ✅ Tareas técnicas detalladas:
- 3 tareas para la ÉPICA 16
- 4 tareas para la ÉPICA 17
- 3 tareas para la ÉPICA 18
- 3 tareas para la ÉPICA 19
- 3 tareas para la ÉPICA 20
- 2 tareas para la ÉPICA 21

### ✅ Plan de sprints:
1. **Sprint 1**: Tenantización + Context Pack
2. **Sprint 2**: Modo Ventas + Intención + Estrategias
3. **Sprint 3**: Omnicanalidad básica + Tests + QA

### ✅ Habilitadores técnicos:
- Esquemas JSON para tenant y catálogo
- Reglas del AIDecisionEngine
- Modificaciones al session_context
- Pipeline de clasificación de intención
- Prompts internos para Modo Ventas y persistencia
- Parámetros para WhatsApp fallback

### ✅ Arquitectura del sistema:
- Diagrama descriptivo de componentes
- Flujo de datos entre servicios
- Integración con agentes existentes

Este plan proporciona una hoja de ruta clara y detallada para implementar las capacidades solicitadas para Colombiatic como tenant propietario con modo ventas especializado, contexto inicial y flujo omnicanal básico.

#### Objetivo claro
Configurar y registrar a Colombiatic como tenant propietario y crear el Context Pack Inicial con toda la información necesaria para el modo ventas.

#### Historias del sprint
1. HU-16.1: Como sistema necesito registrar a Colombiatic como tenant propietario
2. HU-16.2: Como administrador necesito configurar el Context Pack Inicial para Colombiatic
3. HU-16.3: Como sistema necesito validar que solo Colombiatic tiene acceso privilegiado
4. HU-18.1: Como sistema necesito almacenar la descripción de Colombiatic
5. HU-18.2: Como sistema necesito almacenar el catálogo de servicios
6. HU-18.3: Como sistema necesito almacenar estrategias recomendadas de venta

#### Tareas técnicas
1. T-16.1: Registrar tenant propietario "colombiatic"
2. T-16.2: Configurar Context Pack Inicial
3. T-16.3: Implementar validación de acceso privilegiado
4. T-18.1: Implementar almacenamiento de descripción de Colombiatic
5. T-18.2: Implementar almacenamiento del catálogo de servicios
6. T-18.3: Implementar almacenamiento de estrategias recomendadas de venta

#### Criterios de Done
- [ ] Tenant "colombiatic" registrado con tipo "propietario"
- [ ] Tenant tiene acceso a todos los agentes internos
- [ ] Tenant tiene privilegios de sistema
- [ ] Context Pack Inicial almacenado con descripción
- [ ] Context Pack Inicial almacenado con catálogo de servicios
- [ ] Context Pack Inicial almacenado con estrategias de venta
- [ ] Validación de acceso privilegiado implementada
- [ ] Todas las pruebas unitarias pasan
- [ ] Código revisado y aprobado
- [ ] Documentación técnica actualizada

#### Riesgos
1. **Fallo en registro de tenant propietario**: Podría impedir el acceso privilegiado
   - *Mitigación*: Implementar proceso de registro fallback y validación exhaustiva
2. **Inconsistencia en Context Pack**: Podría llevar a información incorrecta
   - *Mitigación*: Implementar validadores de integridad y pruebas de datos
3. **Vulnerabilidad de seguridad en acceso privilegiado**: Podría permitir acceso no autorizado
   - *Mitigación*: Implementar múltiples capas de validación y auditoría

#### Mitigaciones
- Implementar pruebas automatizadas para todos los componentes
- Realizar revisiones de seguridad por pares
- Crear proceso de rollback en caso de fallos
- Documentar todos los cambios para auditoría

#### Dependencias
- Infraestructura de base de datos disponible
- Servicio de Redis operativo
- Servicio de autenticación funcional

### 🟩 Sprint 2 — Modo Ventas + Intención + Estrategias

#### Objetivo claro
Implementar el modo ventas especializado para Colombiatic, incluyendo detección de intención de compra, generación de links de pago y cambio de canal, además del motor de intención para venta.

#### Historias del sprint
1. HU-17.1: Como usuario visitante quiero que el sistema entienda los servicios de Colombiatic
2. HU-17.2: Como usuario interesado quiero que el sistema detecte mi intención de compra
3. HU-17.3: Como usuario en proceso de compra quiero recibir links de pago según el servicio
4. HU-17.4: Como usuario quiero poder cambiar de canal (WhatsApp, email)
5. HU-19.1: Como sistema necesito detectar señales de interés del usuario
6. HU-19.2: Como sistema necesito clasificar la intención del usuario
7. HU-19.3: Como sistema necesito persistir la intención detectada

#### Tareas técnicas
1. T-17.1: Implementar detección de servicios de Colombiatic
2. T-17.2: Implementar detección de intención de compra
3. T-17.3: Implementar generación de links de pago
4. T-17.4: Implementar cambio de canal (WhatsApp, email)
5. T-19.1: Implementar detección de señales de interés
6. T-19.2: Implementar clasificación de intención del usuario
7. T-19.3: Implementar persistencia de intención detectada

#### Criterios de Done
- [ ] Detección de servicios de Colombiatic implementada
- [ ] Detección de intención de compra funcionando
- [ ] Generación de links de pago disponible
- [ ] Cambio de canal a WhatsApp y email implementado
- [ ] Motor de detección de señales de interés operativo
- [ ] Clasificador de intención del usuario funcional
- [ ] Persistencia de intención detectada implementada
- [ ] Todas las pruebas unitarias pasan
- [ ] Código revisado y aprobado
- [ ] Documentación técnica actualizada

#### Riesgos
1. **Falsos positivos en detección de intención**: Podría activar el modo ventas incorrectamente
   - *Mitigación*: Implementar umbral de confianza y validación contextual
2. **Fallo en generación de links de pago**: Podría impedir la conversión
   - *Mitigación*: Implementar mecanismo de fallback y validación de links
3. **Problemas en transferencia de canal**: Podría perder contexto de conversación
   - *Mitigación*: Implementar serialización robusta de contexto

#### Mitigaciones
- Implementar pruebas de integración completas
- Crear métricas de detección para monitoreo
- Establecer procesos de alerta para fallos críticos
- Documentar flujos de error y recuperación

#### Dependencias
- Sprint 1 completado
- Servicio de mensajería (WhatsApp, email) configurado
- Sistema de pagos integrado

### 🟧 Sprint 3 — Omnicanalidad básica + Tests + QA

#### Objetivo claro
Implementar el flujo omnicanal básico para ventas, integrar todos los agentes existentes con el modo ventas y realizar pruebas completas de calidad y aseguramiento.

#### Historias del sprint
1. HU-20.1: Como usuario quiero mantener la conversación en el canal web
2. HU-20.2: Como usuario quiero poder transferir la conversación a WhatsApp
3. HU-20.3: Como usuario quiero que el sistema mantenga la sesión y contexto durante la transferencia
4. HU-21.1: Como sistema necesito adaptar los agentes existentes para el modo ventas
5. HU-21.2: Como sistema necesito coordinar los agentes en el flujo de ventas

#### Tareas técnicas
1. T-20.1: Implementar mantenimiento de conversación en canal web
2. T-20.2: Implementar transferencia de conversación a WhatsApp
3. T-20.3: Implementar mantenimiento de sesión y contexto durante transferencia
4.