import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { HmacSignatureService } from '../security/hmac-signature.service';
export declare class TenantManagementService {
    private readonly tenantRepository;
    private readonly hmacSignatureService;
    private readonly logger;
    constructor(tenantRepository: Repository<Tenant>, hmacSignatureService: HmacSignatureService);
    createTenant(tenantData: Partial<Tenant>): Promise<Tenant>;
    getTenantById(tenantId: string): Promise<Tenant | null>;
    updateTenant(tenantId: string, updateData: Partial<Tenant>): Promise<Tenant>;
    deleteTenant(tenantId: string): Promise<boolean>;
    deactivateTenant(tenantId: string): Promise<Tenant>;
    activateTenant(tenantId: string): Promise<Tenant>;
}
