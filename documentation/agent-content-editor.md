# Content Editor Agent

## Descripción
El Content Editor Agent es un agente especializado en la edición profesional de contenido multimedia (video, imagen, audio). Recibe assets generados por el Creative Synthesizer Agent y los prepara para publicación en redes sociales, cumpliendo con requisitos técnicos y emocionales.

## Características principales
- Edición profesional de contenido multimedia
- Validación de requisitos técnicos por plataforma
- Generación de URLs seguras con SAS
- Narrativa emocional personalizada
- Sugerencias contextuales de mejora

## Tecnologías utilizadas
- NestJS
- TypeORM
- PostgreSQL
- MoviePy (servicio externo)

## Estructura del proyecto
```
src/agents/agent-content-editor/
├── agent-content-editor.module.ts
├── controllers/
│   └── content-editor.controller.ts
├── services/
│   └── content-editor.service.ts
├── entities/
│   └── content-edit-task.entity.ts
├── dto/
│   ├── edit-content.dto.ts
│   └── content-edit-status.dto.ts
└── migrations/
    └── 1700000000000-CreateContentEditTaskTable.ts
```

## Entidad de Base de Datos

### ContentEditTask
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| assetId | string | ID del asset a editar |
| platform | string | Plataforma de destino |
| emotion | string | Emoción detectada |
| campaignId | string | ID de campaña |
| editingProfile | JSON | Perfil de edición |
| status | enum | Estado del proceso |
| sasUrl | string | URL segura del asset |
| createdAt | timestamp | Fecha de creación |
| updatedAt | timestamp | Fecha de actualización |

### Estados del proceso
- `received`: Asset recibido
- `editing`: En proceso de edición
- `validated`: Cumple requisitos técnicos
- `edited`: Listo para publicación
- `failed`: Error en edición

## DTOs

### EditContentDto
```json
{
  "assetId": "video123",
  "platform": "tiktok",
  "emotion": "excited",
  "campaignId": "cmp-456",
  "editingProfile": {
    "resolution": "1080x1920",
    "durationLimit": "60",
    "aspectRatio": "9:16",
    "autoSubtitles": true,
    "tags": ["#viral", "#descubre", "#kimisoft"],
    "style": "vibrant"
  }
}
```

### ContentEditStatusDto
```json
{
  "assetId": "video123",
  "status": "edited",
  "message": "Asset editado correctamente"
}
```

## Endpoints

### Editar contenido
```
POST /api/agents/content-editor/edit
```

### Obtener estado de edición
```
GET /api/agents/content-editor/status/:assetId
```

### Obtener tareas por sesión
```
GET /api/agents/content-editor/session/:sessionId
```

## Integración con MoviePy

El Content Editor Agent se integra con un servicio de MoviePy desplegado en Azure App Service:

### Variables de entorno
- `MOVIEPY_SERVICE_URL`: URL del servicio de MoviePy
- `AZURE_STORAGE_CONNECTION_STRING`: Cadena de conexión al almacenamiento de Azure

### Comunicación
- HTTP para llamadas al servicio
- gRPC para comunicación en tiempo real (opcional)

## Ritualización Emocional

El agente proporciona una narrativa emocional personalizada en cada etapa del proceso:

### Estados y emociones
- **Recibido**: "¡Hemos recibido tu asset! Preparándonos para darle un toque mágico"
- **Editando**: "¡Editando con pasión! Cada corte está diseñado para maximizar el impacto"
- **Validado**: "¡Perfecto! Tu asset cumple con todos los requisitos"
- **Editado**: "¡Tu contenido está listo para volverse viral!"
- **Fallido**: "¡Ups! Encontramos un pequeño obstáculo en la edición"

## Sugerencias Contextuales

El agente proporciona sugerencias específicas según la plataforma y emoción:

### TikTok - Emoción: excited
1. Considera añadir efectos de transición dinámicos
2. Agrega texto grande y llamativo en los primeros 3 segundos
3. Usa música trending para maximizar el engagement
4. Incluye un CTA claro al final del video

## Integración con el Ecosistema

### Flujos de entrada
- Creative Synthesizer Agent → envía assets

### Flujos de salida
- Post Scheduler Agent → recibe assets editados
- Calendar Agent → coordina fechas
- Analytics Reporter Agent → evalúa impacto post-edición
- ViralCampaignOrchestrator → coordina flujo

## Pruebas

### Unitarias
- Validación de DTOs
- Lógica de negocio del servicio
- Generación de narrativas
- Generación de sugerencias

### Integración
- Comunicación con MoviePy
- Persistencia en base de datos
- Generación de URLs SAS

## Despliegue

### Azure App Service
1. Configurar variables de entorno
2. Desplegar imagen de Docker
3. Configurar escalamiento automático
4. Configurar monitoreo y alertas

### CI/CD
- GitHub Actions para integración continua
- Despliegue automático en staging
- Aprobación manual para producción