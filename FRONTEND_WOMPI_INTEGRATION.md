# Integración de Pagos Wompi con Frontend ColombiaTIC

## Descripción General

Este documento detalla cómo integrar los servicios de pago Wompi en la interfaz de frontend de ColombiaTIC. La integración permite mostrar enlaces de pago directos en el chat de conversación para flujos de venta rápida y atención al cliente.

## Arquitectura de Integración

```
[Frontend ColombiaTIC] ←→ [Meta-Agent API] ←→ [Backend Principal Wompi]
                            ↑
                      [Servicio de Pagos]
```

## Endpoints Disponibles

### 1. Iniciar Proceso de Pago
```
POST /api/payments/wompi/initiate
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
  "message": "Proceso de pago iniciado exitosamente"
}
```

### 2. Consultar Estado de Pago
```
GET /api/payments/wompi/status/:reference
```

**Descripción**: Obtiene el estado actual de una transacción de pago.

**Headers requeridos**:
- Authorization: Bearer `<JWT_TOKEN>`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "status": "WAITING|COMPLETED|FAILED|CANCELLED|ERROR",
    "transactionId": "string",
    "amount": "number",
    "currency": "string",
    "method": "string",
    "reference": "string"
  }
}
```

## Flujos de Integración

### Flujo 1: Venta Rápida

1. **Detección de intención de compra**: El sistema identifica cuando un usuario quiere realizar una compra rápida.
2. **Creación de transacción**: El frontend llama al endpoint `/api/payments/wompi/initiate` con los datos del producto.
3. **Mostrar enlace en chat**: El frontend recibe el `checkoutUrl` y lo muestra como un botón o enlace en el chat.
4. **Redirección al checkout**: Cuando el usuario hace clic, se abre el checkout de Wompi en una nueva ventana/modal.
5. **Monitoreo de estado**: El frontend realiza polling al endpoint `/api/payments/wompi/status/:reference` para verificar el estado del pago.
6. **Confirmación**: Una vez que el pago es aprobado, se muestra un mensaje de confirmación en el chat.

### Flujo 2: Atención al Cliente (Venta Asistida)

1. **Interacción con el agente**: El agente identifica la necesidad de pago durante la conversación.
2. **Generación de enlace**: El agente (a través del frontend) crea un enlace de pago con `/api/payments/wompi/initiate`.
3. **Envío en el chat**: El enlace se envía como parte del mensaje del chat para que el cliente pueda pagar.
4. **Seguimiento**: El agente puede seguir el estado del pago consultando el endpoint de estado.

## Implementación en el Chat

### Componente de Enlace de Pago

```jsx
// Ejemplo de componente para mostrar enlaces de pago en el chat
const PaymentLink = ({ checkoutUrl, reference, productId }) => {
  const handlePaymentClick = () => {
    // Abrir checkout en nueva ventana
    window.open(checkoutUrl, '_blank');
    
    // Iniciar monitoreo del estado del pago
    startPaymentMonitoring(reference);
  };

  return (
    <div className="payment-link-container">
      <button onClick={handlePaymentClick} className="payment-button">
        Proceder al Pago
      </button>
      <p>Haga clic para completar su compra de forma segura con Wompi</p>
    </div>
  );
};
```

### Servicio de Monitoreo de Pagos

```javascript
// Servicio para monitorear el estado del pago
class PaymentStatusService {
  async checkPaymentStatus(reference) {
    try {
      const response = await fetch(`/api/payments/wompi/status/${reference}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  // Función para realizar polling del estado del pago
  async monitorPaymentStatus(reference, onStatusChange, interval = 3000) {
    const poll = async () => {
      try {
        const status = await this.checkPaymentStatus(reference);
        onStatusChange(status);
        
        // Continuar monitoreando si el pago no está completado
        if (status.status !== 'COMPLETED' && status.status !== 'FAILED') {
          setTimeout(poll, interval);
        }
      } catch (error) {
        console.error('Error monitoring payment:', error);
      }
    };
    
    poll();
  }
}
```

## Variables de Entorno Requeridas

```bash
# Backend API
REACT_APP_API_URL=http://localhost:3007/api
REACT_APP_WOMPI_REDIRECT_URL=http://localhost:3000/checkout/return

# Modo desarrollo (para pruebas)
REACT_APP_USE_MOCK_PAYMENTS=false
```

## Consideraciones de Seguridad

1. **Autenticación**: Todas las llamadas a la API deben incluir un token JWT válido.
2. **HTTPS**: En producción, todas las comunicaciones deben ser a través de HTTPS.
3. **Validación de datos**: Validar todos los datos de entrada antes de enviarlos al backend.
4. **Manejo de errores**: Implementar manejo adecuado de errores para mostrar mensajes amigables al usuario.

## Casos de Uso Específicos

### Caso 1: Compra de Servicio B2B High-Ticket

Para compras empresariales con montos superiores a COP 2.000.000, se requiere información adicional:

```json
{
  "userId": "user-123",
  "productId": "enterprise_plan",
  "business": {
    "nit": "123456789-0",
    "razonSocial": "Empresa Ejemplo S.A.S.",
    "representanteLegal": "Juan Pérez",
    "emailFacturacion": "facturacion@empresa.com",
    "telefonoEmpresa": "+573001234567"
  }
}
```

### Caso 2: Compra Rápida de Producto Individual

Para compras individuales simples:

```json
{
  "userId": "user-456",
  "productId": "basic_service",
  "fastSale": true
}
```

## Manejo de Errores

Los errores comunes que pueden ocurrir y cómo manejarlos:

1. **Token inválido/expirado**: Redirigir al usuario a la página de login.
2. **Producto no encontrado**: Mostrar mensaje de error al usuario.
3. **Error de conexión**: Mostrar mensaje de error y permitir reintentar.
4. **Validación de datos**: Mostrar mensajes específicos de validación.

## Pruebas

### Pruebas en Ambiente de Desarrollo

1. Configurar `REACT_APP_USE_MOCK_PAYMENTS=true` para pruebas locales.
2. Utilizar datos de prueba para validar flujos sin procesar pagos reales.

### Pruebas en Ambiente de Staging/Sandbox

1. Configurar credenciales de sandbox de Wompi.
2. Realizar flujos completos de pago con tarjetas de prueba.

## Soporte y Contacto

Para cualquier problema técnico con la integración, contactar al equipo de desarrollo backend.