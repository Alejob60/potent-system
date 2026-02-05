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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TenantManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const uuid_1 = require("uuid");
const hmac_signature_service_1 = require("./hmac-signature.service");
const tenant_access_token_service_1 = require("./tenant-access-token.service");
const tenant_context_store_1 = require("./tenant-context.store");
const tenant_entity_1 = require("../../entities/tenant.entity");
let TenantManagementService = TenantManagementService_1 = class TenantManagementService {
    constructor(tenantRepository, hmacSignatureService, tenantAccessTokenService, tenantContextStore) {
        this.tenantRepository = tenantRepository;
        this.hmacSignatureService = hmacSignatureService;
        this.tenantAccessTokenService = tenantAccessTokenService;
        this.tenantContextStore = tenantContextStore;
        this.logger = new common_1.Logger(TenantManagementService_1.name);
    }
    async registerTenant(registerTenantDto) {
        try {
            const tenantId = registerTenantDto.tenantId || `tenant-${(0, uuid_1.v4)()}`;
            const siteId = registerTenantDto.siteId || `site-${(0, uuid_1.v4)()}`;
            const tenantSecret = this.hmacSignatureService.generateTenantSecret();
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
            const savedTenant = await this.tenantRepository.save(tenant);
            await this.tenantContextStore.initializeTenantContext(tenantId, {
                industry: registerTenantDto.businessIndustry,
                size: 'small',
                location: 'global',
                primaryLanguage: 'en',
                timezone: 'UTC',
                businessHours: {
                    start: '09:00',
                    end: '17:00',
                },
            });
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
                tenantSecret,
                allowedOrigins: savedTenant.allowedOrigins,
                permissions: savedTenant.permissions,
            };
        }
        catch (error) {
            this.logger.error('Failed to register tenant', error.message);
            throw new Error(`Tenant registration failed: ${error.message}`);
        }
    }
    async registerOwnerTenant(registerOwnerTenantDto) {
        try {
            const tenantId = 'colombiatic';
            const siteId = 'colombiatic-site';
            const tenantSecret = this.hmacSignatureService.generateTenantSecret();
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
            const savedTenant = await this.tenantRepository.save(tenant);
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
            const accessToken = await this.tenantAccessTokenService.generateToken({
                tenantId: savedTenant.tenantId,
                siteId: savedTenant.siteId,
                origin: savedTenant.websiteUrl,
                permissions: savedTenant.permissions,
                expiresIn: '7d',
            });
            this.logger.log(`Registered owner tenant: ${savedTenant.tenantName} (${savedTenant.tenantId})`);
            await this.initializeColombiaticContextPack(tenantId);
            return {
                tenantId: savedTenant.tenantId,
                siteId: savedTenant.siteId,
                accessToken,
                tenantSecret,
                allowedOrigins: savedTenant.allowedOrigins,
                permissions: savedTenant.permissions,
            };
        }
        catch (error) {
            this.logger.error('Failed to register owner tenant', error.message);
            throw new Error(`Owner tenant registration failed: ${error.message}`);
        }
    }
    async initializeColombiaticContextPack(tenantId) {
        try {
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
            await this.tenantContextStore.updateTenantContext(tenantId, {
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            this.logger.log(`Initialized context pack for owner tenant: ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to initialize context pack for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async updateTenantBusinessProfile(tenantId, businessProfile) {
        try {
            const result = await this.tenantContextStore.updateBusinessProfile(tenantId, businessProfile);
            const tenant = await this.getTenantById(tenantId);
            if (tenant) {
                if (businessProfile.industry) {
                    tenant.businessIndustry = businessProfile.industry;
                    await this.tenantRepository.save(tenant);
                }
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to update business profile for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async updateTenantBranding(tenantId, branding) {
        try {
            return await this.tenantContextStore.updateBranding(tenantId, branding);
        }
        catch (error) {
            this.logger.error(`Failed to update branding for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async updateTenantFaqData(tenantId, faqData) {
        try {
            return await this.tenantContextStore.updateFAQData(tenantId, faqData);
        }
        catch (error) {
            this.logger.error(`Failed to update FAQ data for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async addCustomFaq(tenantId, faq) {
        try {
            const context = await this.tenantContextStore.getTenantContext(tenantId);
            if (!context) {
                this.logger.warn(`No context found for tenant ${tenantId} during custom FAQ addition`);
                return false;
            }
            const updatedFaqData = {
                ...context.faqData,
                customFAQs: [
                    ...(context.faqData?.customFAQs || []),
                    faq
                ]
            };
            return await this.tenantContextStore.updateFAQData(tenantId, updatedFaqData);
        }
        catch (error) {
            this.logger.error(`Failed to add custom FAQ for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async updateTenantProductsAndServices(tenantId, products, services) {
        try {
            const context = await this.tenantContextStore.getTenantContext(tenantId);
            if (!context) {
                this.logger.warn(`No context found for tenant ${tenantId} during products and services update`);
                return false;
            }
            const updates = {};
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
            if (Object.keys(updates).length > 0) {
                return await this.tenantContextStore.updateTenantContext(tenantId, updates);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to update products and services for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async getTenantById(tenantId) {
        try {
            const tenant = await this.tenantRepository.findOne({ where: { tenantId, isActive: true } });
            return tenant || undefined;
        }
        catch (error) {
            this.logger.error(`Failed to get tenant ${tenantId}`, error.message);
            return undefined;
        }
    }
    async isOriginAllowed(tenantId, origin) {
        try {
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                return false;
            }
            return tenant.allowedOrigins.includes(origin);
        }
        catch (error) {
            this.logger.error(`Failed to validate origin for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async isOwnerTenant(tenantId) {
        try {
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                return false;
            }
            return tenant.permissions.includes('owner');
        }
        catch (error) {
            this.logger.error(`Failed to check if tenant ${tenantId} is owner`, error.message);
            return false;
        }
    }
    async validatePrivilegedAccess(tenantId, operation) {
        try {
            const isOwner = await this.isOwnerTenant(tenantId);
            if (isOwner) {
                this.logger.debug(`Privileged access granted for owner tenant ${tenantId} for operation ${operation}`);
                return true;
            }
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                return false;
            }
            const privilegedOperations = {
                'system_access': ['admin', 'system'],
                'tenant_management': ['admin'],
                'agent_configuration': ['admin', 'system'],
                'security_settings': ['admin', 'system']
            };
            const requiredPermissions = privilegedOperations[operation] || [];
            const hasPermission = requiredPermissions.some(permission => tenant.permissions.includes(permission));
            if (hasPermission) {
                this.logger.debug(`Privileged access granted for tenant ${tenantId} for operation ${operation}`);
            }
            else {
                this.logger.warn(`Privileged access denied for tenant ${tenantId} for operation ${operation}`);
            }
            return hasPermission;
        }
        catch (error) {
            this.logger.error(`Failed to validate privileged access for tenant ${tenantId}`, error.message);
            return false;
        }
    }
    async updateTenant(tenantId, updates) {
        try {
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                this.logger.warn(`Tenant ${tenantId} not found for update`);
                return null;
            }
            Object.assign(tenant, updates);
            const updatedTenant = await this.tenantRepository.save(tenant);
            this.logger.log(`Updated tenant: ${tenantId}`);
            return updatedTenant;
        }
        catch (error) {
            this.logger.error(`Failed to update tenant ${tenantId}`, error.message);
            return null;
        }
    }
    async deactivateTenant(tenantId) {
        try {
            const tenant = await this.getTenantById(tenantId);
            if (!tenant) {
                this.logger.warn(`Tenant ${tenantId} not found for deactivation`);
                return false;
            }
            tenant.isActive = false;
            await this.tenantRepository.save(tenant);
            this.logger.log(`Deactivated tenant: ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to deactivate tenant ${tenantId}`, error.message);
            return false;
        }
    }
};
exports.TenantManagementService = TenantManagementService;
exports.TenantManagementService = TenantManagementService = TenantManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        hmac_signature_service_1.HmacSignatureService,
        tenant_access_token_service_1.TenantAccessTokenService,
        tenant_context_store_1.TenantContextStore])
], TenantManagementService);
//# sourceMappingURL=tenant-management.service.js.map