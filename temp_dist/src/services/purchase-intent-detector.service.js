"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PurchaseIntentDetectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseIntentDetectorService = void 0;
const common_1 = require("@nestjs/common");
let PurchaseIntentDetectorService = PurchaseIntentDetectorService_1 = class PurchaseIntentDetectorService {
    constructor() {
        this.logger = new common_1.Logger(PurchaseIntentDetectorService_1.name);
        this.purchaseIntentPatterns = {
            direct_purchase: [
                'comprar',
                'buy',
                'quiero comprar',
                'i want to buy',
                'necesito comprar',
                'need to buy',
                'compre',
                'bought',
                'ordenar',
                'order',
                'pedir',
                'place an order',
                'pagar',
                'pay',
                'checkout',
                'finalizar compra',
                'complete purchase'
            ],
            product_inquiry: [
                'producto',
                'product',
                'servicio',
                'service',
                'característica',
                'feature',
                'beneficio',
                'benefit',
                'detalles',
                'details',
                'información',
                'information',
                'qué es',
                'what is',
                'cómo funciona',
                'how does it work',
                'funcionalidad',
                'functionality'
            ],
            price_inquiry: [
                'precio',
                'price',
                'costo',
                'cost',
                'presupuesto',
                'budget',
                'cotización',
                'quote',
                'cuánto cuesta',
                'how much',
                'valor',
                'value',
                'descuento',
                'discount',
                'oferta',
                'offer',
                'promoción',
                'promotion'
            ],
            comparison: [
                'comparar',
                'compare',
                'diferencia',
                'difference',
                'mejor',
                'better',
                'vs',
                'versus',
                'alternativa',
                'alternative',
                'opción',
                'option'
            ]
        };
        this.urgencyPatterns = {
            high: [
                'ahora',
                'now',
                'urgente',
                'urgent',
                'inmediato',
                'immediate',
                'hoy',
                'today',
                'asap',
                'ya',
                'already',
                'rápido',
                'fast',
                'pronto',
                'soon'
            ],
            medium: [
                'próximo',
                'next',
                'semana',
                'week',
                'mes',
                'month',
                'proxima semana',
                'next week'
            ]
        };
    }
    detectPurchaseIntent(message, context) {
        try {
            this.logger.log(`Detecting purchase intent in message: ${message.substring(0, 50)}...`);
            const lowerMessage = message.toLowerCase();
            const result = {
                hasPurchaseIntent: false,
                confidence: 0,
                intentType: 'none',
                productReferences: [],
                urgencyLevel: 5
            };
            const directPurchaseScore = this.calculatePatternScore(lowerMessage, this.purchaseIntentPatterns.direct_purchase);
            if (directPurchaseScore > 0) {
                result.hasPurchaseIntent = true;
                result.intentType = 'direct_purchase';
                result.confidence = Math.min(directPurchaseScore * 0.8 + 0.2, 1);
            }
            const productInquiryScore = this.calculatePatternScore(lowerMessage, this.purchaseIntentPatterns.product_inquiry);
            if (productInquiryScore > result.confidence) {
                result.hasPurchaseIntent = true;
                result.intentType = 'product_inquiry';
                result.confidence = productInquiryScore;
            }
            const priceInquiryScore = this.calculatePatternScore(lowerMessage, this.purchaseIntentPatterns.price_inquiry);
            if (priceInquiryScore > result.confidence) {
                result.hasPurchaseIntent = true;
                result.intentType = 'price_inquiry';
                result.confidence = priceInquiryScore;
            }
            const comparisonScore = this.calculatePatternScore(lowerMessage, this.purchaseIntentPatterns.comparison);
            if (comparisonScore > result.confidence) {
                result.hasPurchaseIntent = true;
                result.intentType = 'comparison';
                result.confidence = comparisonScore;
            }
            result.productReferences = this.extractProductReferences(message, context);
            result.urgencyLevel = this.calculateUrgencyLevel(lowerMessage);
            if (context?.siteType === 'colombiatic' || (context?.origin && context.origin.includes('colombiatic'))) {
                result.confidence = Math.min(result.confidence + 0.1, 1);
            }
            if (result.productReferences.length > 0) {
                result.confidence = Math.min(result.confidence + 0.15, 1);
            }
            if (result.confidence < 0.3) {
                result.hasPurchaseIntent = false;
                result.intentType = 'none';
            }
            this.logger.log(`Purchase intent detection completed: ${JSON.stringify(result)}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error detecting purchase intent: ${error.message}`);
            return {
                hasPurchaseIntent: false,
                confidence: 0,
                intentType: 'none',
                productReferences: [],
                urgencyLevel: 5
            };
        }
    }
    calculatePatternScore(message, patterns) {
        const matches = patterns.filter(pattern => message.includes(pattern));
        return Math.min(matches.length / patterns.length, 1);
    }
    extractProductReferences(message, context) {
        const references = [];
        const lowerMessage = message.toLowerCase();
        if (context?.products) {
            for (const product of context.products) {
                if (lowerMessage.includes(product.toLowerCase())) {
                    references.push(product);
                }
            }
        }
        if (context?.services) {
            for (const service of context.services) {
                if (lowerMessage.includes(service.toLowerCase())) {
                    references.push(service);
                }
            }
        }
        const commonProducts = [
            'landing page', 'tienda online', 'app móvil', 'sitio web',
            'landing', 'tienda', 'app', 'website', 'e-commerce',
            'ecommerce', 'tienda virtual', 'aplicación', 'mobile app'
        ];
        for (const product of commonProducts) {
            if (lowerMessage.includes(product)) {
                references.push(product);
            }
        }
        return [...new Set(references)];
    }
    calculateUrgencyLevel(message) {
        let urgency = 5;
        const highUrgencyMatches = this.urgencyPatterns.high.filter(pattern => message.includes(pattern));
        if (highUrgencyMatches.length > 0) {
            urgency = 8 + highUrgencyMatches.length;
        }
        const mediumUrgencyMatches = this.urgencyPatterns.medium.filter(pattern => message.includes(pattern));
        if (mediumUrgencyMatches.length > 0 && urgency === 5) {
            urgency = 6 + mediumUrgencyMatches.length;
        }
        return Math.min(urgency, 10);
    }
};
exports.PurchaseIntentDetectorService = PurchaseIntentDetectorService;
exports.PurchaseIntentDetectorService = PurchaseIntentDetectorService = PurchaseIntentDetectorService_1 = __decorate([
    (0, common_1.Injectable)()
], PurchaseIntentDetectorService);
//# sourceMappingURL=purchase-intent-detector.service.js.map