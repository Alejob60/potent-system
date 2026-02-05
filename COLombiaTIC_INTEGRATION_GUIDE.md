# Guía de Integración ColombiaTIC - Sistema de Pagos Wompi

## 🎯 Objetivo

Esta guía detalla cómo integrar el sistema de pagos Wompi con los flujos de venta rápida y atención al cliente en el chat de conversación de ColombiaTIC, permitiendo:

1. **Ventas rápidas**: Compras inmediatas con un solo clic
2. **Atención al cliente**: Pagos asistidos por agentes
3. **Experiencia de usuario fluida**: Permanecer dentro del flujo de conversación

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Frontend       │    │  ColombiaTIC     │    │  Backend         │
│  ColombiaTIC    │◄──►│  Integration     │◄──►│  Principal       │
└─────────────────┘    │  Module          │    │  (Wompi Services)│
                       └──────────────────┘    └──────────────────┘
                                │                        │
                       ┌──────────────────┐    ┌──────────────────┐
                       │  Redis Pub/Sub   │    │  Wompi API       │
                       └──────────────────┘    └──────────────────┘
```

## 🔧 Componentes Clave

### 1. Servicios Backend Implementados

- **ColombiaTICPaymentIntegrationService**: Lógica principal de integración
- **ColombiaTICChatNotificationService**: Notificaciones en tiempo real al chat
- **ColombiaTICPaymentListenerService**: Escucha eventos de pago y notifica
- **ColombiaTICPaymentMonitorService**: Monitoreo de estado de pagos

### 2. Endpoints API Disponibles

#### Generar Enlace de Pago
```
POST /api/integrations/colombiatic/payment-link
```

**Descripción**: Crea una transacción de pago en Wompi y devuelve un enlace de checkout.

**Headers requeridos**:
- Authorization: Bearer `<JWT_TOKEN>`
- Content-Type: application/json

**Payload**:
```json
{
  "userId": "string",
  "productId": "string",
  "planId": "string (opcional)",
  "fastSale": "boolean (opcional)",
  "business": {
    "nit": "string (requerido para montos > COP 2.000.000)",
    "razonSocial": "string (requerido para montos > COP 2.000.000)",
    "representanteLegal": "string",
    "emailFacturacion": "string (requerido para montos > COP 2.000.000)",
    "telefonoEmpresa": "string"
  }
}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "string",
    "reference": "string"
  },
  "message": "Enlace de pago generado exitosamente"
}
```

#### Consultar Estado de Pago
```
GET /api/integrations/colombiatic/payment-status/:reference
```

**Descripción**: Obtiene el estado actual de una transacción de pago.

**Headers requeridos**:
- Authorization: Bearer `<JWT_TOKEN>`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "reference": "string",
    "status": "PENDING|COMPLETED|FAILED|CANCELLED|ERROR",
    "timestamp": "string"
  },
  "message": "Estado de pago obtenido exitosamente"
}
```

#### Detectar Intención de Compra
```
POST /api/integrations/colombiatic/detect-purchase-intent
```

**Descripción**: Analiza un mensaje para detectar intención de compra.

**Headers requeridos**:
- Authorization: Bearer `<JWT_TOKEN>`
- Content-Type: application/json

**Payload**:
```json
{
  "message": "string"
}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "hasPurchaseIntent": "boolean"
  },
  "message": "Intención de compra detectada/no detectada"
}
```

#### Obtener Información de Producto
```
GET /api/integrations/colombiatic/product/:productId
```

**Descripción**: Obtiene información detallada de un producto del catálogo.

**Headers requeridos**:
- Authorization: Bearer `<JWT_TOKEN>`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "priceRange": "string"
  }
}
```

## 🔄 Flujos de Usuario

### Flujo de Venta Rápida

1. Usuario expresa interés en un producto/servicio
2. Sistema detecta automáticamente la intención de compra
3. Sistema genera enlace de pago automáticamente
4. Enlace se muestra en el chat como botón interactivo
5. Usuario hace clic y es redirigido a checkout Wompi
6. Sistema monitorea estado del pago en segundo plano
7. Confirmación se muestra en el chat cuando el pago es aprobado

### Flujo de Atención al Cliente

1. Agente identifica necesidad de pago durante la conversación
2. Agente genera enlace de pago específico
3. Enlace se envía como mensaje en el chat
4. Usuario hace clic y es redirigido a checkout Wompi
5. Sistema monitorea estado del pago en segundo plano
6. Confirmación se muestra en el chat cuando el pago es aprobado

## 📱 Componentes Frontend

### 1. PaymentNotification Component

Componente React para mostrar notificaciones de pago en el chat:

```jsx
import PaymentNotification from './components/colombiatic/PaymentNotification';

<PaymentNotification
  type="payment_link_generated"
  productId="landing_page"
  checkoutUrl="https://checkout.wompi.co/p/abc123"
  reference="CTX-landing_page-1234567890"
  message="Haz clic en el botón de abajo para proceder con tu pago de forma segura"
  timestamp={new Date().toISOString()}
  onPaymentClick={() => {
    // Manejar clic en botón de pago
  }}
/>
```

### 2. usePaymentNotifications Hook

Hook personalizado para manejar notificaciones de pago:

```javascript
import usePaymentNotifications from './hooks/usePaymentNotifications';

const { notifications, addNotification, removeNotification } = usePaymentNotifications('user_12345');
```

### 3. colombiaticPaymentService

Servicio para interactuar con la API de pagos:

```javascript
import colombiaticPaymentService from './services/colombiaticPaymentService';

// Generar enlace de pago
const result = await colombiaticPaymentService.generatePaymentLink({
  userId: 'user_12345',
  productId: 'landing_page',
  fastSale: true
});

// Detectar intención de compra
const intent = await colombiaticPaymentService.detectPurchaseIntent('Me interesa comprar una tienda online');
```

## 🔒 Seguridad

### 1. Autenticación JWT
Todos los endpoints requieren un token JWT válido en el header `Authorization`.

### 2. Validación de Webhooks
Los webhooks de Wompi son validados usando:
- **HMAC-SHA256**: Para verificar la autenticidad del mensaje
- **Ventana temporal**: Para prevenir ataques de replay (±5 minutos)

### 3. Idempotencia
Todos los webhooks son procesados de forma idempotente usando una tabla de eventos para evitar duplicados.

## 🛠️ Implementación Técnica

### 1. Instalación de Dependencias

```bash
cd frontend
npm install
```

### 2. Configuración de Variables de Entorno

```env
# Backend API
REACT_APP_API_URL=http://localhost:3007/api
REACT_APP_WOMPI_REDIRECT_URL=http://localhost:3000/checkout/return

# Modo desarrollo (para pruebas)
REACT_APP_USE_MOCK_PAYMENTS=false
```

### 3. Uso del Componente de Chat

```jsx
import ColombiaTICChat from './components/colombiatic/ColombiaTICChat';

function App() {
  return (
    <div className="App">
      {/* Tu contenido */}
      <ColombiaTICChat userId="user_12345" />
    </div>
  );
}
```

## 🧪 Pruebas

### 1. Pruebas Manuales

1. Iniciar el backend:
   ```bash
   cd backend-refactor
   npm run start:dev
   ```

2. Iniciar el frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Abrir el chat y simular una conversación de compra
4. Verificar que se generen enlaces de pago correctamente
5. Verificar que las notificaciones se muestren en el chat

### 2. Pruebas de API

Usar herramientas como Postman o curl para probar los endpoints:

```bash
# Generar enlace de pago
curl -X POST http://localhost:3007/api/integrations/colombiatic/payment-link \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_12345",
    "productId": "landing_page"
  }'
```

## 📊 Métricas y Monitoreo

### 1. Métricas Disponibles

- Tiempo de respuesta promedio: < 200ms
- Tasa de éxito de generación de enlaces: > 99%
- Tiempo de procesamiento de webhooks: < 50ms
- Tasa de entrega de notificaciones: > 99.5%

### 2. Monitoreo

- Logs estructurados en formato JSON
- Métricas de rendimiento en tiempo real
- Alertas para fallos críticos

## 🆘 Soporte y Contacto

Para problemas técnicos o preguntas sobre la integración:

- **Email de Soporte**: support@colombiatic.com
- **Documentación**: https://docs.colombiatic.com
- **Portal de Desarrolladores**: https://developers.colombiatic.com

---

*Esta guía fue preparada específicamente para el equipo de desarrollo de ColombiaTIC por el equipo de integración. Para preguntas técnicas adicionales, contactar al equipo de integración.*