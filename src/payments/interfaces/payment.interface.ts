export interface PaymentMetadata {
  userId: string;
  productId: string;
  planId?: string;
  fastSale: boolean;
  source: 'colombiatic_backend';
  initiatedFrom: 'chat' | 'dashboard' | 'fastSale';
  hash: string;
  timestamp: number;
  business?: {
    nit: string;
    razonSocial: string;
    representanteLegal: string;
    emailFacturacion: string;
    telefonoEmpresa: string;
  };
}

export interface PaymentInitiateDto {
  userId: string;
  productId: string;
  planId?: string;
  fastSale?: boolean;
  metadata?: Partial<PaymentMetadata>;
  business?: {
    nit: string;
    razonSocial: string;
    representanteLegal: string;
    emailFacturacion: string;
    telefonoEmpresa: string;
  };
}

export interface WompiWebhookEvent {
  event: string;
  data: {
    id: string;
    status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'PENDING' | 'ERROR';
    reference: string;
    amount_in_cents: number;
    currency: string;
    payment_method_type: string;
    transaction_date: string;
    customer_email: string;
    merchant_data: any;
    bill_id: string | null;
  };
  timestamp: number;
  signature: {
    checksum: string;
    properties: string[];
  };
}

export interface PaymentOrder {
  id: string;
  reference: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'WAITING' | 'ERROR';
  userId: string;
  productId: string;
  planId?: string;
  fastSale: boolean;
  metadata: PaymentMetadata;
  ipOrigin: string;
  orderHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetaAgentPaymentUpdate {
  userId: string;
  productId: string;
  paymentStatus: 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'WAITING' | 'ERROR';
  reference: string;
  transactionId: string;
  amount: number;
  method: string;
  fastSale: boolean;
  timestamp: number;
}

export interface ChatPaymentNotification {
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'WAITING' | 'ERROR';
  productId: string;
  reference: string;
  confirmationMessage: string;
}