# Ejemplos de Código para Integración Wompi - Frontend ColombiaTIC

## Servicio de Pagos

```typescript
// src/services/wompiPaymentService.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007/api';

class WompiPaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Inicia un proceso de pago con Wompi
   * @param paymentData Datos para iniciar el pago
   * @returns Promesa con la respuesta del servidor
   */
  async initiatePayment(paymentData: {
    userId: string;
    productId: string;
    planId?: string;
    fastSale?: boolean;
    business?: {
      nit: string;
      razonSocial: string;
      representanteLegal: string;
      emailFacturacion: string;
      telefonoEmpresa: string;
    }
  }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/wompi/initiate`,
        paymentData,
        {
          headers: this.getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  /**
   * Consulta el estado de un pago
   * @param reference Referencia del pago
   * @returns Promesa con el estado del pago
   */
  async getPaymentStatus(reference: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/wompi/status/${reference}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Obtiene los pagos de un usuario
   * @param userId ID del usuario
   * @returns Promesa con la lista de pagos
   */
  async getUserPayments(userId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/wompi/user/${userId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw error;
    }
  }

  /**
   * Obtiene la reputación de un usuario
   * @param userId ID del usuario
   * @returns Promesa con la reputación del usuario
   */
  async getUserReputation(userId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/wompi/reputation/${userId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting user reputation:', error);
      throw error;
    }
  }
}

export default new WompiPaymentService();
```

## Hook Personalizado para Pagos

```typescript
// src/hooks/useWompiPayment.ts
import { useState, useEffect } from 'react';
import wompiPaymentService from '../services/wompiPaymentService';

interface PaymentState {
  loading: boolean;
  error: string | null;
  checkoutUrl: string | null;
  paymentStatus: string | null;
  reference: string | null;
}

export const useWompiPayment = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    error: null,
    checkoutUrl: null,
    paymentStatus: null,
    reference: null
  });

  /**
   * Inicia un proceso de pago
   * @param paymentData Datos del pago
   */
  const initiatePayment = async (paymentData: any) => {
    setPaymentState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await wompiPaymentService.initiatePayment(paymentData);
      
      if (response.success) {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          checkoutUrl: response.data.checkoutUrl,
          reference: response.data.reference
        }));
      } else {
        throw new Error(response.error || 'Error al iniciar el pago');
      }
    } catch (error: any) {
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error desconocido al iniciar el pago'
      }));
    }
  };

  /**
   * Monitorea el estado de un pago
   * @param reference Referencia del pago
   * @param interval Intervalo de monitoreo en ms (por defecto 3000ms)
   */
  const monitorPaymentStatus = (reference: string, interval: number = 3000) => {
    if (!reference) return;
    
    const pollStatus = async () => {
      try {
        const response = await wompiPaymentService.getPaymentStatus(reference);
        
        if (response.success) {
          setPaymentState(prev => ({
            ...prev,
            paymentStatus: response.data.status
          }));
          
          // Continuar monitoreando si el pago no está completado
          if (response.data.status !== 'COMPLETED' && response.data.status !== 'FAILED') {
            setTimeout(pollStatus, interval);
          }
        } else {
          throw new Error(response.error || 'Error al obtener el estado del pago');
        }
      } catch (error: any) {
        setPaymentState(prev => ({
          ...prev,
          error: error.message || 'Error al monitorear el estado del pago'
        }));
      }
    };
    
    pollStatus();
  };

  /**
   * Reinicia el estado del pago
   */
  const resetPayment = () => {
    setPaymentState({
      loading: false,
      error: null,
      checkoutUrl: null,
      paymentStatus: null,
      reference: null
    });
  };

  return {
    ...paymentState,
    initiatePayment,
    monitorPaymentStatus,
    resetPayment
  };
};
```

## Componente de Enlace de Pago

```tsx
// src/components/PaymentLink.tsx
import React from 'react';
import { useWompiPayment } from '../hooks/useWompiPayment';

interface PaymentLinkProps {
  userId: string;
  productId: string;
  productName: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

const PaymentLink: React.FC<PaymentLinkProps> = ({
  userId,
  productId,
  productName,
  onPaymentSuccess,
  onPaymentError
}) => {
  const {
    loading,
    error,
    checkoutUrl,
    paymentStatus,
    reference,
    initiatePayment,
    monitorPaymentStatus
  } = useWompiPayment();

  const handlePaymentInitiation = async () => {
    try {
      await initiatePayment({
        userId,
        productId
      });
    } catch (err) {
      if (onPaymentError) {
        onPaymentError('Error al iniciar el proceso de pago');
      }
    }
  };

  const handlePaymentClick = () => {
    if (checkoutUrl && reference) {
      // Abrir checkout en nueva ventana
      window.open(checkoutUrl, '_blank');
      
      // Iniciar monitoreo del estado del pago
      monitorPaymentStatus(reference);
    }
  };

  // Efecto para manejar cambios en el estado del pago
  useEffect(() => {
    if (paymentStatus === 'COMPLETED' && onPaymentSuccess) {
      onPaymentSuccess();
    } else if (paymentStatus === 'FAILED' && onPaymentError) {
      onPaymentError('El pago fue rechazado');
    }
  }, [paymentStatus, onPaymentSuccess, onPaymentError]);

  if (loading) {
    return <div className="payment-loading">Procesando solicitud de pago...</div>;
  }

  if (error) {
    return (
      <div className="payment-error">
        <p>{error}</p>
        <button onClick={handlePaymentInitiation}>Reintentar</button>
      </div>
    );
  }

  if (checkoutUrl) {
    return (
      <div className="payment-link-container">
        <button 
          onClick={handlePaymentClick}
          className="payment-button"
          disabled={!checkoutUrl}
        >
          Pagar {productName} ahora
        </button>
        <p className="payment-info">
          Serás redirigido a Wompi para completar tu pago de forma segura.
        </p>
      </div>
    );
  }

  return (
    <button 
      onClick={handlePaymentInitiation}
      className="initiate-payment-button"
    >
      Solicitar enlace de pago para {productName}
    </button>
  );
};

export default PaymentLink;
```

## Componente de Estado de Pago

```tsx
// src/components/PaymentStatusIndicator.tsx
import React from 'react';

interface PaymentStatusIndicatorProps {
  status: 'WAITING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'ERROR' | null;
}

const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'WAITING':
        return { 
          text: 'Esperando pago', 
          className: 'status-waiting',
          icon: '⏳'
        };
      case 'COMPLETED':
        return { 
          text: 'Pago completado', 
          className: 'status-completed',
          icon: '✅'
        };
      case 'FAILED':
        return { 
          text: 'Pago rechazado', 
          className: 'status-failed',
          icon: '❌'
        };
      case 'CANCELLED':
        return { 
          text: 'Pago cancelado', 
          className: 'status-cancelled',
          icon: '🚫'
        };
      case 'ERROR':
        return { 
          text: 'Error en el pago', 
          className: 'status-error',
          icon: '⚠️'
        };
      default:
        return { 
          text: 'Estado desconocido', 
          className: 'status-unknown',
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`payment-status-indicator ${statusInfo.className}`}>
      <span className="status-icon">{statusInfo.icon}</span>
      <span className="status-text">{statusInfo.text}</span>
    </div>
  );
};

export default PaymentStatusIndicator;
```

## Integración en Chat Widget

```tsx
// src/components/ColombiaTICChatWidget.tsx (fragmento relevante)
import React, { useState } from 'react';
import PaymentLink from './PaymentLink';
import PaymentStatusIndicator from './PaymentStatusIndicator';

const ColombiaTICChatWidget = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Función para manejar mensajes que contienen acciones de pago
  const handleMessageAction = (action: any) => {
    if (action.type === 'CREATE_PAYMENT_LINK') {
      setShowPaymentLink(true);
      // Agregar mensaje al chat indicando que se ha generado un enlace de pago
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: 'Se ha generado un enlace de pago para su compra.'
      }]);
    }
  };

  const handlePaymentSuccess = () => {
    // Agregar mensaje de confirmación al chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      content: '✅ ¡Pago confirmado! Su servicio será activado en breve.'
    }]);
    
    // Ocultar enlace de pago
    setShowPaymentLink(false);
  };

  const handlePaymentError = (error: string) => {
    // Agregar mensaje de error al chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      content: `❌ ${error}`
    }]);
  };

  return (
    <div className="chat-widget">
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            {message.content}
          </div>
        ))}
        
        {/* Mostrar enlace de pago si es necesario */}
        {showPaymentLink && (
          <div className="payment-section">
            <PaymentLink
              userId="current-user-id"
              productId="product-to-purchase"
              productName="Servicio Premium"
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        )}
      </div>
      
      {/* Otros componentes del chat */}
    </div>
  );
};

export default ColombiaTICChatWidget;
```

## Estilos CSS Sugeridos

```css
/* src/styles/payment-components.css */

.payment-link-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}

.payment-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.payment-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.payment-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.payment-info {
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
}

.payment-loading {
  text-align: center;
  padding: 16px;
  color: #007bff;
}

.payment-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 12px;
  margin: 12px 0;
}

.payment-status-indicator {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-waiting {
  background-color: #fff3cd;
  color: #856404;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-failed {
  background-color: #f8d7da;
  color: #721c24;
}

.status-cancelled {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-error {
  background-color: #f8d7da;
  color: #721c24;
}

.status-unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-icon {
  margin-right: 4px;
}
```

## Uso en Componentes de Venta Rápida

```tsx
// src/components/QuickOrder/QuickOrderPayment.tsx
import React from 'react';
import PaymentLink from '../PaymentLink';
import PaymentStatusIndicator from '../PaymentStatusIndicator';
import { useWompiPayment } from '../../hooks/useWompiPayment';

interface QuickOrderPaymentProps {
  orderId: string;
  productId: string;
  userId: string;
}

const QuickOrderPayment: React.FC<QuickOrderPaymentProps> = ({
  orderId,
  productId,
  userId
}) => {
  const {
    loading,
    error,
    checkoutUrl,
    paymentStatus,
    initiatePayment
  } = useWompiPayment();

  const handleInitiatePayment = async () => {
    try {
      await initiatePayment({
        userId,
        productId,
        fastSale: true
      });
    } catch (err) {
      console.error('Error initiating quick order payment:', err);
    }
  };

  if (loading) {
    return <div className="quick-order-payment-loading">Preparando pago...</div>;
  }

  if (error) {
    return (
      <div className="quick-order-payment-error">
        <p>Error: {error}</p>
        <button onClick={handleInitiatePayment}>Reintentar</button>
      </div>
    );
  }

  if (checkoutUrl) {
    return (
      <div className="quick-order-payment">
        <h3>Completar su pedido</h3>
        <PaymentStatusIndicator status={paymentStatus as any} />
        <PaymentLink
          userId={userId}
          productId={productId}
          productName="Pedido rápido"
          onPaymentSuccess={() => {
            // Manejar éxito del pago
            console.log('Pago completado para orden:', orderId);
          }}
          onPaymentError={(errorMsg) => {
            // Manejar error del pago
            console.error('Error en pago:', errorMsg);
          }}
        />
      </div>
    );
  }

  return (
    <button 
      onClick={handleInitiatePayment}
      className="initiate-quick-payment-button"
    >
      Proceder al pago
    </button>
  );
};

export default QuickOrderPayment;
```

Estos ejemplos proporcionan una base sólida para que el equipo de frontend de ColombiaTIC pueda integrar los servicios de pago Wompi en su aplicación. Los componentes y servicios son reutilizables y siguen buenas prácticas de desarrollo frontend.