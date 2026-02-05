import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { HmacSignatureService } from './hmac-signature.service';
import { TenantAccessTokenService } from './tenant-access-token.service';
import { TenantContextStore } from './tenant-context.store';
import { Tenant } from '../../entities/tenant.entity';

// Interface for owner tenant registration
interface RegisterOwnerTenantDto {
  tenantName: string;
  contactEmail: string;
  websiteUrl: string;
  businessIndustry: string;
}

@Injectable()
export class TenantManagementService {
  private readonly logger = new Logger(TenantManagementService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly hmacSignatureService: HmacSignatureService,
    private readonly tenantAccessTokenService: TenantAccessTokenService,
    private readonly tenantContextStore: TenantContextStore,
  ) {}

  /**
   * Register a new tenant
   * @param registerTenantDto Registration data
   * @returns Registered tenant with access credentials
   */
  async registerTenant(registerTenantDto: RegisterTenantDto): Promise<any> {
    try {
      // Generate tenant ID and site ID if not provided
      const tenantId = registerTenantDto.tenantId || `tenant-${uuidv4()}`;
      const siteId = registerTenantDto.siteId || `site-${uuidv4()}`;

      // Generate tenant secret
      const tenantSecret = this.hmacSignatureService.generateTenantSecret();

      // Create tenant object
      const tenant = this.tenantRepository.create({
        tenantId,
        siteId,
        tenantName: registerTenantDto.tenantName,
        contactEmail: registerTenantDto.contactEmail,
        websiteUrl: registerTenantDto.websiteUrl,
        businessIndustry: registerTenantDto.businessIndustry,
        allowedOrigins: registerTenantDto.allowedOrigins || [registerTenantDto.websiteUrl],
        permissions: registerTenantDto.permissions || ['read', 'write'],
        tenantSecret,
        isActive: true,
      });

      // Save tenant to database
      const savedTenant = await this.tenantRepository.save(tenant);

      // Initialize tenant context
      await this.tenantContextStore.initializeTenantContext(tenantId, {
        industry: registerTenantDto.businessIndustry,
        size: 'small', // Default value, can be updated later
        location: 'global', // Default value, can be updated later
        primaryLanguage: 'en', // Default value, can be updated later
        timezone: 'UTC', // Default value, can be updated later
        businessHours: {
          start: '09:00',
          end: '17:00',
        },
      });

      // Generate initial access token
      const accessToken = await this.tenantAccessTokenService.generateToken({
        tenantId: savedTenant.tenantId,
        siteId: savedTenant.siteId,
        origin: savedTenant.websiteUrl,
        permissions: savedTenant.permissions,
        expiresIn: '24h',
      });

      this.logger.log(`Registered new tenant: ${savedTenant.tenantName} (${savedTenant.tenantId})`);

      return {
        tenantId: savedTenant.tenantId,
        siteId: savedTenant.siteId,
        accessToken,
        tenantSecret, // This should only be sent once and securely stored by the tenant
        allowedOrigins: savedTenant.allowedOrigins,
        permissions: savedTenant.permissions,
      };
    } catch (error) {
      this.logger.error('Failed to register tenant', error.message);
      throw new Error(`Tenant registration failed: ${error.message}`);
    }
  }

  /**
   * Register Colombiatic as owner tenant
   * @param registerOwnerTenantDto Owner tenant registration data
   * @returns Registered owner tenant with full access credentials
   */
  async registerOwnerTenant(registerOwnerTenantDto: RegisterOwnerTenantDto): Promise<any> {
    try {
      // Fixed tenant ID and site ID for owner tenant
      const tenantId = 'colombiatic';
      const siteId = 'colombiatic-site';

      // Generate tenant secret
      const tenantSecret = this.hmacSignatureService.generateTenantSecret();

      // Create owner tenant object with special permissions
      const tenant = this.tenantRepository.create({
        tenantId,
        siteId,
        tenantName: registerOwnerTenantDto.tenantName,
        contactEmail: registerOwnerTenantDto.contactEmail,
        websiteUrl: registerOwnerTenantDto.websiteUrl,
        businessIndustry: registerOwnerTenantDto.businessIndustry,
        allowedOrigins: [registerOwnerTenantDto.websiteUrl, 'https://colombiatic.com'],
        permissions: ['read', 'write', 'admin', 'system', 'owner'],
        tenantSecret,
        isActive: true,
      });

      // Save tenant to database
      const savedTenant = await this.tenantRepository.save(tenant);

      // Initialize tenant context with owner-specific configuration
      await this.tenantContextStore.initializeTenantContext(tenantId, {
        industry: registerOwnerTenantDto.businessIndustry,
        size: 'enterprise',
        location: 'Colombia',
        primaryLanguage: 'es',
        timezone: 'America/Bogota',
        businessHours: {
          start: '08:00',
          end: '18:00',
        },
      });

      // Generate initial access token with extended expiration
      const accessToken = await this.tenantAccessTokenService.generateToken({
        tenantId: savedTenant.tenantId,
        siteId: savedTenant.siteId,
        origin: savedTenant.websiteUrl,
        permissions: savedTenant.permissions,
        expiresIn: '7d', // Longer expiration for owner tenant
      });

      this.logger.log(`Registered owner tenant: ${savedTenant.tenantName} (${savedTenant.tenantId})`);

      // Initialize the context pack for Colombiatic
      await this.initializeColombiaticContextPack(tenantId);

      return {
        tenantId: savedTenant.tenantId,
        siteId: savedTenant.siteId,
        accessToken,
        tenantSecret,
        allowedOrigins: savedTenant.allowedOrigins,
        permissions: savedTenant.permissions,
      };
    } catch (error) {
      this.logger.error('Failed to register owner tenant', error.message);
      throw new Error(`Owner tenant registration failed: ${error.message}`);
    }
  }

  /**
   * Initialize the context pack for Colombiatic
   * @param tenantId Tenant ID
   * @returns Boolean indicating success
   */
  private async initializeColombiaticContextPack(tenantId: string): Promise<boolean> {
    try {
      // Initialize with Colombiatic-specific context
      const contextData = {
        description: "Colombiatic es una empresa especializada en el desarrollo de soluciones tecnológicas innovadoras para empresas de todos los tamaños. Ofrecemos servicios de desarrollo web, aplicaciones móviles, marketing digital y consultoría tecnológica.",
        services: [
          {
            id: "desarrollo-web",
            name: "Desarrollo de Sitios Web",
            description: "Creamos sitios web modernos y responsivos adaptados a tus necesidades",
            benefits: [
              "Diseño a medida",
              "Optimización para móviles",
              "Integración con redes sociales",
              "SEO básico incluido"
            ],
            priceRange: "$500 - $5,000",
            purchaseProcess: [
              "Consulta inicial",
              "Propuesta de diseño",
              "Desarrollo",
              "Pruebas y ajustes",
              "Entrega y capacitación"
            ],
            paymentLink: "https://colombiatic.com/pagar/desarrollo-web"
          },
          {
            id: "tienda-online",
            name: "Tiendas Online",
            description: "Desarrollamos tiendas virtuales completas con pasarelas de pago",
            benefits: [
              "Catálogo de productos ilimitado",
              "Pasarelas de pago integradas",
              "Gestión de inventario",
              "Informes de ventas"
            ],
            priceRange: "$1,000 - $10,000",
            purchaseProcess: [
              "Análisis de requerimientos",
              "Diseño de tienda",
              "Configuración de productos",
              "Integración de pagos",
              "Pruebas y lanzamiento"
            ],
            paymentLink: "https://colombiatic.com/pagar/tienda-online"
          },
          {
            id: "app-movil",
            name: "Aplicaciones Móviles",
            description: "Creamos aplicaciones móviles nativas para iOS y Android",
            benefits: [
              "Diseño intuitivo",
              "Funcionalidades personalizadas",
              "Integración con APIs",
              "Soporte post-lanzamiento"
            ],
            priceRange: "$2,000 - $15,000",
            purchaseProcess: [
              "Definición de requerimientos",
              "Diseño de interfaces",
              "Desarrollo",
              "Pruebas en dispositivos",
              "Publicación en stores"
            ],
            paymentLink: "https://colombiatic.com/pagar/app-movil"
          }
        ],
        salesStrategies: [
          {
            name: "Consulta Inicial Gratuita",
            description: "Ofrecemos una consulta inicial gratuita para entender tus necesidades",
            implementation: "Programar llamada de 30 minutos para discutir requerimientos"
          },
          {
            name: "Demostración de Valor",
            description: "Mostramos casos de éxito relevantes para tu industria",
            implementation: "Preparar presentación personalizada con estudios de caso"
          },
          {
            name: "Propuesta Técnica Detallada",
            description: "Entregamos una propuesta técnica detallada con cronograma y precios",
            implementation: "Elaborar documento con especificaciones técnicas y comerciales"
          }
        ]
      };

      // Store the context pack in tenant context
      await this.tenantContextStore.updateTenantContext(tenantId, {
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      this.logger.log(`Initialized context pack for owner tenant: ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to initialize context pack for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant business profile
   * @param tenantId Tenant ID
   * @param businessProfile Business profile data
   * @returns Boolean indicating success
   */
  async updateTenantBusinessProfile(tenantId: string, businessProfile: any): Promise<boolean> {
    try {
      // Update tenant context with business profile
      const result = await this.tenantContextStore.updateBusinessProfile(tenantId, businessProfile);
      
      // Also update tenant entity in database if needed
      const tenant = await this.getTenantById(tenantId);
      if (tenant) {
        if (businessProfile.industry) {
          tenant.businessIndustry = businessProfile.industry;
          await this.tenantRepository.save(tenant);
        }
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to update business profile for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant branding configuration
   * @param tenantId Tenant ID
   * @param branding Branding configuration
   * @returns Boolean indicating success
   */
  async updateTenantBranding(tenantId: string, branding: any): Promise<boolean> {
    try {
      return await this.tenantContextStore.updateBranding(tenantId, branding);
    } catch (error) {
      this.logger.error(`Failed to update branding for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant FAQ data
   * @param tenantId Tenant ID
   * @param faqData FAQ data
   * @returns Boolean indicating success
   */
  async updateTenantFaqData(tenantId: string, faqData: any): Promise<boolean> {
    try {
      return await this.tenantContextStore.updateFAQData(tenantId, faqData);
    } catch (error) {
      this.logger.error(`Failed to update FAQ data for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Add custom FAQ to tenant
   * @param tenantId Tenant ID
   * @param faq Custom FAQ entry
   * @returns Boolean indicating success
   */
  async addCustomFaq(tenantId: string, faq: { question: string; answer: string; category?: string }): Promise<boolean> {
    try {
      // Get existing FAQ data
      const context = await this.tenantContextStore.getTenantContext(tenantId);
      if (!context) {
        this.logger.warn(`No context found for tenant ${tenantId} during custom FAQ addition`);
        return false;
      }

      // Add new FAQ to existing FAQs
      const updatedFaqData = {
        ...context.faqData,
        customFAQs: [
          ...(context.faqData?.customFAQs || []),
          faq
        ]
      };

      return await this.tenantContextStore.updateFAQData(tenantId, updatedFaqData);
    } catch (error) {
      this.logger.error(`Failed to add custom FAQ for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant products and services
   * @param tenantId Tenant ID
   * @param products Array of products
   * @param services Array of services
   * @returns Boolean indicating success
   */
  async updateTenantProductsAndServices(tenantId: string, products?: string[], services?: string[]): Promise<boolean> {
    try {
      const context = await this.tenantContextStore.getTenantContext(tenantId);
      if (!context) {
        this.logger.warn(`No context found for tenant ${tenantId} during products and services update`);
        return false;
      }

      // Prepare updates
      const updates: any = {};
      
      if (services) {
        updates.services = services.map((service, index) => ({
          id: `service-${index}`,
          name: service,
          description: `Service: ${service}`,
          benefits: [],
          priceRange: "Consultar",
          purchaseProcess: [],
          paymentLink: ""
        }));
      }

      // Update context with services
      if (Object.keys(updates).length > 0) {
        return await this.tenantContextStore.updateTenantContext(tenantId, updates);
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to update products and services for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Get tenant by ID
   * @param tenantId Tenant ID
   * @returns Tenant information
   */
  async getTenantById(tenantId: string): Promise<Tenant | undefined> {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { tenantId, isActive: true } });
      return tenant || undefined;
    } catch (error) {
      this.logger.error(`Failed to get tenant ${tenantId}`, error.message);
      return undefined;
    }
  }

  /**
   * Validate if an origin is allowed for a tenant
   * @param tenantId Tenant ID
   * @param origin Request origin
   * @returns Boolean indicating if origin is allowed
   */
  async isOriginAllowed(tenantId: string, origin: string): Promise<boolean> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        return false;
      }

      // Check if origin is in allowed origins
      return tenant.allowedOrigins.includes(origin);
    } catch (error) {
      this.logger.error(`Failed to validate origin for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Check if tenant is owner tenant
   * @param tenantId Tenant ID
   * @returns Boolean indicating if tenant is owner
   */
  async isOwnerTenant(tenantId: string): Promise<boolean> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        return false;
      }

      // Check if tenant has owner permissions
      return tenant.permissions.includes('owner');
    } catch (error) {
      this.logger.error(`Failed to check if tenant ${tenantId} is owner`, error.message);
      return false;
    }
  }

  /**
   * Validate privileged access for tenant
   * @param tenantId Tenant ID
   * @param operation Operation being performed
   * @returns Boolean indicating if tenant has privileged access
   */
  async validatePrivilegedAccess(tenantId: string, operation: string): Promise<boolean> {
    try {
      // Check if tenant is owner
      const isOwner = await this.isOwnerTenant(tenantId);
      if (isOwner) {
        this.logger.debug(`Privileged access granted for owner tenant ${tenantId} for operation ${operation}`);
        return true;
      }

      // For non-owner tenants, check specific permissions
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        return false;
      }

      // Define privileged operations and required permissions
      const privilegedOperations: { [key: string]: string[] } = {
        'system_access': ['admin', 'system'],
        'tenant_management': ['admin'],
        'agent_configuration': ['admin', 'system'],
        'security_settings': ['admin', 'system']
      };

      const requiredPermissions = privilegedOperations[operation] || [];
      const hasPermission = requiredPermissions.some(permission => tenant.permissions.includes(permission));

      if (hasPermission) {
        this.logger.debug(`Privileged access granted for tenant ${tenantId} for operation ${operation}`);
      } else {
        this.logger.warn(`Privileged access denied for tenant ${tenantId} for operation ${operation}`);
      }

      return hasPermission;
    } catch (error) {
      this.logger.error(`Failed to validate privileged access for tenant ${tenantId}`, error.message);
      return false;
    }
  }

  /**
   * Update tenant information
   * @param tenantId Tenant ID
   * @param updates Partial updates to tenant information
   * @returns Updated tenant information
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        this.logger.warn(`Tenant ${tenantId} not found for update`);
        return null;
      }

      // Apply updates
      Object.assign(tenant, updates);
      
      // Save updated tenant
      const updatedTenant = await this.tenantRepository.save(tenant);
      
      this.logger.log(`Updated tenant: ${tenantId}`);
      return updatedTenant;
    } catch (error) {
      this.logger.error(`Failed to update tenant ${tenantId}`, error.message);
      return null;
    }
  }

  /**
   * Deactivate tenant
   * @param tenantId Tenant ID
   * @returns Boolean indicating success
   */
  async deactivateTenant(tenantId: string): Promise<boolean> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        this.logger.warn(`Tenant ${tenantId} not found for deactivation`);
        return false;
      }

      // Set tenant as inactive
      tenant.isActive = false;
      
      // Save updated tenant
      await this.tenantRepository.save(tenant);
      
      this.logger.log(`Deactivated tenant: ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to deactivate tenant ${tenantId}`, error.message);
      return false;
    }
  }
}