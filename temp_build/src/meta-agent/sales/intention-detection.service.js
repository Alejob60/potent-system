"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IntentionDetectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentionDetectionService = void 0;
const common_1 = require("@nestjs/common");
const sales_mode_service_1 = require("./sales-mode.service");
let IntentionDetectionService = IntentionDetectionService_1 = class IntentionDetectionService {
    constructor(salesModeService) {
        this.salesModeService = salesModeService;
        this.logger = new common_1.Logger(IntentionDetectionService_1.name);
        this.intentionPatterns = {
            interest: [
                'interesado', 'informaci n', 'saber m s', 'detalles',
                'caracter stica', 'beneficio', 'qu  ofrecen', 'servicios',
                'soluciones', 'ayuda', 'asistencia', 'consultor a'
            ],
            information: [
                'qu es', 'c mo funciona', 'proceso', 'pasos', 'etapas',
                'requerimientos', 'necesita', 'involucra', 'tiempo',
                'duraci n', 'metodolog a', 't cnica'
            ],
            purchase: [
                'comprar', 'contratar', 'precio', 'costo', 'presupuesto',
                'cotizaci n', 'venta', 'sitio web', 'desarrollo', 'cuanto',
                'interesado', 'necesito', 'quiero', 'deseo', 'pagar',
                'ahora', 'inmediatamente', 'urgente'
            ]
        };
        this.serviceKeywords = {
            'desarrollo-web': [
                'sitio web', 'p gina web', 'web site', 'desarrollo web',
                'dise o web', 'responsive', 'm vil', 'landing page'
            ],
            'tienda-online': [
                'tienda online', 'ecommerce', 'carrito', 'compras',
                'productos', 'inventario', 'pasarela', 'pago'
            ],
            'app-movil': [
                'app m vil', 'aplicaci n', 'ios', 'android', 'm vil',
                'smartphone', 'tablet', 'descargar'
            ]
        };
    }
    detectIntention(message) {
        const lowerMessage = message.toLowerCase();
        const interestMatches = this.intentionPatterns.interest.filter(keyword => lowerMessage.includes(keyword)).length;
        const informationMatches = this.intentionPatterns.information.filter(keyword => lowerMessage.includes(keyword)).length;
        const purchaseMatches = this.intentionPatterns.purchase.filter(keyword => lowerMessage.includes(keyword)).length;
        if (purchaseMatches > 0 && purchaseMatches >= informationMatches && purchaseMatches >= interestMatches) {
            return 'purchase';
        }
        else if (informationMatches > 0 && informationMatches >= interestMatches) {
            return 'information';
        }
        else if (interestMatches > 0) {
            return 'interest';
        }
        else {
            return 'interest';
        }
    }
    detectServices(message) {
        const lowerMessage = message.toLowerCase();
        const detectedServices = [];
        for (const [serviceId, keywords] of Object.entries(this.serviceKeywords)) {
            const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
            if (matches > 0) {
                detectedServices.push(serviceId);
            }
        }
        return detectedServices;
    }
    async processMessage(tenantId, message) {
        try {
            const intention = this.detectIntention(message);
            const services = this.detectServices(message);
            await this.salesModeService.updateIntent(tenantId, intention);
            for (const serviceId of services) {
                await this.salesModeService.addServiceMentioned(tenantId, serviceId);
            }
            await this.salesModeService.addToConversationHistory(tenantId, 'web', message);
            const contextSummary = await this.salesModeService.getConversationContextSummary(tenantId);
            this.logger.log(`Processed message for tenant ${tenantId}`, {
                intention,
                servicesDetected: services,
                messageLength: message.length
            });
            return {
                intention,
                servicesDetected: services,
                contextSummary,
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error(`Failed to process message for tenant ${tenantId}`, error.message);
            throw error;
        }
    }
    async generateResponse(tenantId, intention) {
        try {
            const serviceCatalog = await this.salesModeService.getServiceCatalog(tenantId);
            const salesStrategies = await this.salesModeService.getSalesStrategies(tenantId);
            const salesContext = await this.salesModeService.getSalesContext(tenantId);
            let response = '';
            switch (intention) {
                case 'interest':
                    response = '¡Gracias por tu interés en nuestros servicios! ';
                    if (serviceCatalog && serviceCatalog.length > 0) {
                        response += 'Ofrecemos los siguientes servicios:\n\n';
                        serviceCatalog.forEach((service, index) => {
                            response += `${index + 1}. ${service.name}: ${service.description}\n`;
                        });
                        response += '\n¿Te gustaría saber más sobre alguno en particular?';
                    }
                    else {
                        response += 'Estamos especializados en soluciones tecnológicas para empresas. ¿En qué puedo ayudarte hoy?';
                    }
                    break;
                case 'information':
                    response = 'Con gusto te proporciono más información. ';
                    if (salesContext?.currentService) {
                        const currentService = serviceCatalog?.find(s => s.id === salesContext.currentService);
                        if (currentService) {
                            response += `Sobre ${currentService.name}:\n\n`;
                            response += `Descripción: ${currentService.description}\n\n`;
                            response += `Beneficios:\n`;
                            currentService.benefits.forEach(benefit => {
                                response += `- ${benefit}\n`;
                            });
                            response += `\nPrecio aproximado: ${currentService.priceRange}\n\n`;
                            response += '¿Te interesa contratar este servicio o necesitas más información?';
                        }
                        else {
                            response += '¿Sobre qué servicio te gustaría obtener más información?';
                        }
                    }
                    else {
                        response += '¿Sobre qué servicio te gustaría obtener más información?';
                    }
                    break;
                case 'purchase':
                    response = '¡Excelente! Estás listo para contratar nuestros servicios. ';
                    if (salesContext?.currentService) {
                        const currentService = serviceCatalog?.find(s => s.id === salesContext.currentService);
                        if (currentService) {
                            response += `Para contratar ${currentService.name}, te explico el proceso:\n\n`;
                            currentService.purchaseProcess.forEach((step, index) => {
                                response += `${index + 1}. ${step}\n`;
                            });
                            response += `\nPrecio aproximado: ${currentService.priceRange}\n\n`;
                            if (!salesContext.paymentLinkGenerated) {
                                response += '¿Te gustaría que te genere un link de pago para proceder con la contratación?';
                            }
                            else {
                                response += 'Ya te he generado un link de pago. ¿Te gustaría que te lo envíe por WhatsApp o prefieres otro canal?';
                            }
                        }
                        else {
                            response += '¿Qué servicio te gustaría contratar?';
                        }
                    }
                    else {
                        response += '¿Qué servicio te gustaría contratar?';
                    }
                    break;
                default:
                    response = '¿En qué puedo ayudarte hoy?';
            }
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to generate response for tenant ${tenantId}`, error.message);
            return 'Lo siento, tuve un problema generando mi respuesta. ¿Puedes repetir tu consulta?';
        }
    }
};
exports.IntentionDetectionService = IntentionDetectionService;
exports.IntentionDetectionService = IntentionDetectionService = IntentionDetectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sales_mode_service_1.SalesModeService])
], IntentionDetectionService);
//# sourceMappingURL=intention-detection.service.js.map