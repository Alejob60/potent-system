import { Injectable, Logger } from '@nestjs/common';
import { SalesModeService } from './sales-mode.service';

@Injectable()
export class IntentionDetectionService {
  private readonly logger = new Logger(IntentionDetectionService.name);

  // Keywords and patterns for intention detection
  private readonly intentionPatterns = {
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

  // Service-specific keywords
  private readonly serviceKeywords = {
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

  constructor(
    private readonly salesModeService: SalesModeService,
  ) {}

  /**
   * Detect user intention from message
   * @param message User message
   * @returns Detected intention
   */
  detectIntention(message: string): 'interest' | 'information' | 'purchase' {
    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase();

    // Count matches for each intention type
    const interestMatches = this.intentionPatterns.interest.filter(keyword => 
      lowerMessage.includes(keyword)).length;
    
    const informationMatches = this.intentionPatterns.information.filter(keyword => 
      lowerMessage.includes(keyword)).length;
    
    const purchaseMatches = this.intentionPatterns.purchase.filter(keyword => 
      lowerMessage.includes(keyword)).length;

    // Return intention with highest match count
    // If tie, prioritize purchase > information > interest
    if (purchaseMatches > 0 && purchaseMatches >= informationMatches && purchaseMatches >= interestMatches) {
      return 'purchase';
    } else if (informationMatches > 0 && informationMatches >= interestMatches) {
      return 'information';
    } else if (interestMatches > 0) {
      return 'interest';
    } else {
      // Default to interest if no clear matches
      return 'interest';
    }
  }

  /**
   * Detect services mentioned in message
   * @param message User message
   * @returns Array of detected service IDs
   */
  detectServices(message: string): string[] {
    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase();
    const detectedServices: string[] = [];

    // Check each service for keyword matches
    for (const [serviceId, keywords] of Object.entries(this.serviceKeywords)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matches > 0) {
        detectedServices.push(serviceId);
      }
    }

    return detectedServices;
  }

  /**
   * Process user message and update sales context
   * @param tenantId Tenant ID
   * @param message User message
   * @returns Processing result
   */
  async processMessage(tenantId: string, message: string): Promise<any> {
    try {
      // Detect intention
      const intention = this.detectIntention(message);
      
      // Detect services
      const services = this.detectServices(message);
      
      // Update sales context with detected intention
      await this.salesModeService.updateIntent(tenantId, intention);
      
      // Add detected services to context
      for (const serviceId of services) {
        await this.salesModeService.addServiceMentioned(tenantId, serviceId);
      }
      
      // Add message to conversation history
      await this.salesModeService.addToConversationHistory(tenantId, 'web', message);
      
      // Get updated context summary
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
    } catch (error) {
      this.logger.error(`Failed to process message for tenant ${tenantId}`, error.message);
      throw error;
    }
  }

  /**
   * Generate response based on detected intention
   * @param tenantId Tenant ID
   * @param intention Detected intention
   * @returns Response message
   */
  async generateResponse(tenantId: string, intention: 'interest' | 'information' | 'purchase'): Promise<string> {
    try {
      // Get service catalog and sales strategies
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
          } else {
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
            } else {
              response += '¿Sobre qué servicio te gustaría obtener más información?';
            }
          } else {
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
              
              // Add payment link if not already generated
              if (!salesContext.paymentLinkGenerated) {
                response += '¿Te gustaría que te genere un link de pago para proceder con la contratación?';
              } else {
                response += 'Ya te he generado un link de pago. ¿Te gustaría que te lo envíe por WhatsApp o prefieres otro canal?';
              }
            } else {
              response += '¿Qué servicio te gustaría contratar?';
            }
          } else {
            response += '¿Qué servicio te gustaría contratar?';
          }
          break;
          
        default:
          response = '¿En qué puedo ayudarte hoy?';
      }
      
      return response;
    } catch (error) {
      this.logger.error(`Failed to generate response for tenant ${tenantId}`, error.message);
      return 'Lo siento, tuve un problema generando mi respuesta. ¿Puedes repetir tu consulta?';
    }
  }
}