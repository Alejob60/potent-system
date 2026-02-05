import { DataSource } from 'typeorm';
import { Tenant } from '../src/entities/tenant.entity';
import { createDataSourceOptions } from '../src/data-source';

async function runTenantIntegrationTest() {
  console.log('Starting Tenant Integration Test...');
  
  try {
    // Create a test data source
    const options = await createDataSourceOptions();
    const dataSource = new DataSource({
      ...options,
      database: 'test_database', // Use a test database
      synchronize: true, // Auto-create tables for testing
      dropSchema: true, // Clean slate for each test
    });
    
    // Initialize the data source
    await dataSource.initialize();
    console.log('Database connection established');
    
    // Get the tenant repository
    const tenantRepository = dataSource.getRepository(Tenant);
    
    // Create a test tenant
    const tenant = tenantRepository.create({
      tenantId: 'test-tenant-123',
      siteId: 'test-site-456',
      tenantName: 'Test Company',
      contactEmail: 'contact@testcompany.com',
      websiteUrl: 'https://testcompany.com',
      businessIndustry: 'Technology',
      allowedOrigins: ['https://testcompany.com', 'https://app.testcompany.com'],
      permissions: ['read', 'write', 'admin'],
      tenantSecret: 'super-secret-key',
      isActive: true,
    });
    
    // Save the tenant
    const savedTenant = await tenantRepository.save(tenant);
    console.log('Tenant saved successfully:', savedTenant.tenantName);
    
    // Retrieve the tenant
    const retrievedTenant = await tenantRepository.findOne({
      where: { tenantId: 'test-tenant-123' }
    });
    
    if (retrievedTenant) {
      console.log('Tenant retrieved successfully:', retrievedTenant.tenantName);
      console.log('Tenant ID:', retrievedTenant.tenantId);
      console.log('Site ID:', retrievedTenant.siteId);
      console.log('Business Industry:', retrievedTenant.businessIndustry);
    } else {
      console.log('Failed to retrieve tenant');
    }
    
    // Update the tenant
    if (retrievedTenant) {
      retrievedTenant.businessIndustry = 'Software Development';
      retrievedTenant.updatedAt = new Date();
      const updatedTenant = await tenantRepository.save(retrievedTenant);
      console.log('Tenant updated successfully:', updatedTenant.businessIndustry);
    }
    
    // List all tenants
    const allTenants = await tenantRepository.find();
    console.log(`Found ${allTenants.length} tenant(s) in database`);
    
    // Clean up
    await dataSource.destroy();
    console.log('Database connection closed');
    
    console.log('Tenant Integration Test completed successfully!');
    return true;
  } catch (error) {
    console.error('Tenant Integration Test failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTenantIntegrationTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { runTenantIntegrationTest };