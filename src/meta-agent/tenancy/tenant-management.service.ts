import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { HmacSignatureService } from '../security/hmac-signature.service';

@Injectable()
export class TenantManagementService {
  private readonly logger = new Logger(TenantManagementService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly hmacSignatureService: HmacSignatureService,
  ) {}

  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    try {
      // Generate tenant secret
      const tenantSecret = this.hmacSignatureService.generateTenantSecret();
      
      // Create tenant object
      const tenant = this.tenantRepository.create({
        ...tenantData,
        tenantSecret,
        isActive: true,
      });

      // Save tenant
      const savedTenant = await this.tenantRepository.save(tenant);
      this.logger.log(`Created tenant ${savedTenant.tenantId}`);
      
      return savedTenant;
    } catch (error) {
      this.logger.error(`Failed to create tenant: ${error.message}`);
      throw error;
    }
  }

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findOne({ where: { tenantId, isActive: true } });
    } catch (error) {
      this.logger.error(`Failed to get tenant ${tenantId}`, error.message);
      return null;
    }
  }

  async updateTenant(tenantId: string, updateData: Partial<Tenant>): Promise<Tenant> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      // Update tenant properties
      Object.assign(tenant, updateData);
      
      // Save updated tenant
      const updatedTenant = await this.tenantRepository.save(tenant);
      this.logger.log(`Updated tenant ${tenantId}`);
      
      return updatedTenant;
    } catch (error) {
      this.logger.error(`Failed to update tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        this.logger.warn(`Tenant ${tenantId} not found for deletion`);
        return false;
      }

      // Deactivate tenant instead of hard delete
      tenant.isActive = false;
      await this.tenantRepository.save(tenant);
      this.logger.log(`Deactivated tenant ${tenantId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete tenant ${tenantId}: ${error.message}`);
      return false;
    }
  }

  async deactivateTenant(tenantId: string): Promise<Tenant> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      tenant.isActive = false;
      const updatedTenant = await this.tenantRepository.save(tenant);
      this.logger.log(`Deactivated tenant ${tenantId}`);
      
      return updatedTenant;
    } catch (error) {
      this.logger.error(`Failed to deactivate tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  async activateTenant(tenantId: string): Promise<Tenant> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      tenant.isActive = true;
      const updatedTenant = await this.tenantRepository.save(tenant);
      this.logger.log(`Activated tenant ${tenantId}`);
      
      return updatedTenant;
    } catch (error) {
      this.logger.error(`Failed to activate tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }
}