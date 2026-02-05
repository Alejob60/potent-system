declare class BusinessDataDto {
    nit: string;
    razonSocial: string;
    representanteLegal: string;
    emailFacturacion: string;
    telefonoEmpresa: string;
}
export declare class PaymentInitiateDto {
    userId: string;
    productId: string;
    planId?: string;
    fastSale?: boolean;
    business?: BusinessDataDto;
}
export {};
