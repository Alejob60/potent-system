#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testTenantImplementation = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../src/entities/tenant.entity");
async function testTenantImplementation() {
    console.log('🔍 Testing Tenant Implementation...');
    try {
        const dataSource = new typeorm_1.DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities: [tenant_entity_1.Tenant],
            synchronize: true,
            logging: false
        });
        await dataSource.initialize();
        console.log('✅ Database connection established');
        const tenantRepository = dataSource.getRepository(tenant_entity_1.Tenant);
        console.log('\n📝 Test 1: Creating a tenant...');
        const tenant = tenantRepository.create({
            tenantId: 'test-tenant-123',
            siteId: 'test-site-456',
            tenantName: 'Acme Corporation',
            contactEmail: 'admin@acme.com',
            websiteUrl: 'https://acme.com',
            businessIndustry: 'Manufacturing',
            allowedOrigins: ['https://acme.com', 'https://app.acme.com'],
            permissions: ['read', 'write', 'admin'],
            tenantSecret: 'super-secret-key-12345',
            isActive: true,
        });
        const savedTenant = await tenantRepository.save(tenant);
        console.log('✅ Tenant created successfully');
        console.log(`   Tenant ID: ${savedTenant.tenantId}`);
        console.log(`   Site ID: ${savedTenant.siteId}`);
        console.log(`   Name: ${savedTenant.tenantName}`);
        console.log('\n🔍 Test 2: Retrieving the tenant...');
        const retrievedTenant = await tenantRepository.findOne({
            where: { tenantId: 'test-tenant-123' }
        });
        if (retrievedTenant) {
            console.log('✅ Tenant retrieved successfully');
            console.log(`   Retrieved Name: ${retrievedTenant.tenantName}`);
            console.log(`   Industry: ${retrievedTenant.businessIndustry}`);
            console.log(`   Active: ${retrievedTenant.isActive}`);
        }
        else {
            console.log('❌ Failed to retrieve tenant');
            return false;
        }
        console.log('\n✏️ Test 3: Updating the tenant...');
        if (retrievedTenant) {
            retrievedTenant.businessIndustry = 'Technology';
            retrievedTenant.tenantName = 'Acme Technologies Inc.';
            const updatedTenant = await tenantRepository.save(retrievedTenant);
            console.log('✅ Tenant updated successfully');
            console.log(`   Updated Name: ${updatedTenant.tenantName}`);
            console.log(`   Updated Industry: ${updatedTenant.businessIndustry}`);
        }
        console.log('\n📋 Test 4: Listing all tenants...');
        const allTenants = await tenantRepository.find();
        console.log(`✅ Found ${allTenants.length} tenant(s)`);
        if (allTenants.length > 0) {
            console.log(`   First tenant: ${allTenants[0].tenantName}`);
        }
        await dataSource.destroy();
        console.log('\n✅ All tests completed successfully!');
        return true;
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}
exports.testTenantImplementation = testTenantImplementation;
if (require.main === module) {
    testTenantImplementation()
        .then(success => {
        process.exit(success ? 0 : 1);
    })
        .catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=test-tenant-implementation.js.map