# 🛠️ MisyBot Universal SDK

El SDK de MisyBot permite integrar las capacidades de MetaOS en cualquier sitio web externo con solo unas líneas de código.

## 📦 Instalación

### Opción 1: CDN (Recomendado para sitios web)
```html
<script src="https://api.misybot.com/sdk/misy-sdk.js"></script>
```

### Opción 2: NPM (Para aplicaciones React/Vue/Node)
```bash
npm install @misybot/sdk
```

## 🚀 Uso Básico

```javascript
// 1. Inicializar
misy.init({
  baseUrl: 'https://tu-api.misybot.com',
  tenantId: 'mi-empresa-id',
  token: 'TU_TAT_TOKEN', // Generado vía API de Seguridad
  siteId: 'mi-tienda-online'
});

// 2. Enviar un mensaje
async function chat() {
  const result = await misy.sendMessage('Hola, quiero comprar un sitio web');
  console.log('Respuesta de Misy:', result.data.response);
}

// 3. Escuchar eventos
misy.on('message', (data) => {
  console.log('Nuevo mensaje recibido:', data);
});
```

## 🔐 Seguridad
El SDK utiliza tokens de acceso de tenant (TAT) y se comunica exclusivamente a través del gateway industrial (V2), asegurando que cada petición esté firmada y autenticada.

## 📡 API Reference

| Método | Descripción |
|--------|-------------|
| `init(config)` | Configura el SDK con el tenant y token. |
| `sendMessage(msg, ctx)` | Envía una intención al Front-Desk V2. |
| `on(event, callback)` | Registra un listener para eventos (message, error). |
| `getSession()` | Devuelve el ID de sesión persistente actual. |
