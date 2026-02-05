#!/usr/bin/env node
/**
 * Test script to verify Azure AD authentication with PostgreSQL
 */

import { AzureADAuthHelper } from '../common/database/azure-ad-auth.helper';
import { createDataSourceOptions } from '../data-source';
import { DataSource } from 'typeorm';

async function testAzureADAuth() {
  console.log('   Testing Azure AD Authentication for PostgreSQL...');
  
  try {
    // Check if Azure CLI is available
    console.log('\n1. Checking Azure CLI availability...');
    const isCLIAvailable = await AzureADAuthHelper.isAzureCLIAvailable();
    if (!isCLIAvailable) {
      console.error('  Azure CLI is not installed or not in PATH');
      console.log('Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli');
      return;
    }
    console.log('  Azure CLI is available');
    
    // Check if user is logged in
    console.log('\n2. Checking Azure login status...');
    const isLoggedIn = await AzureADAuthHelper.isUserLoggedIn();
    if (!isLoggedIn) {
      console.error('  User is not logged into Azure CLI');
      console.log('Please run "az login" to log in to Azure');
      return;
    }
    console.log('  User is logged into Azure CLI');
    
    // Get access token
    console.log('\n3. Obtaining Azure AD access token...');
    const accessToken = await AzureADAuthHelper.getAccessToken();
    if (!accessToken) {
      console.error('  Failed to obtain access token');
      return;
    }
    console.log('  Access token obtained successfully');
    console.log(`Token length: ${accessToken.length} characters`);
    
    // Test database connection with Azure AD token
    console.log('\n4. Testing database connection with Azure AD token...');
    try {
      const options = await createDataSourceOptions();
      const dataSource = new DataSource(options);
      
      // Try to initialize the connection
      await dataSource.initialize();
      console.log('  Database connection established successfully with Azure AD authentication');
      
      // Test a simple query
      const result = await dataSource.query('SELECT 1 as test');
      console.log('  Database query executed successfully:', result);
      
      // Close the connection
      await dataSource.destroy();
      console.log('  Database connection closed successfully');
    } catch (dbError) {
      console.error('  Database connection failed:', dbError.message);
      console.log('\nTroubleshooting tips:');
      console.log('1. Make sure your PostgreSQL database is configured for Azure AD authentication');
      console.log('2. Ensure your user has the necessary permissions in the database');
      console.log('3. Verify that the database server name is correct');
      console.log('4. Check that the database firewall allows connections from your IP');
    }
    
    console.log('\n   Azure AD authentication test completed!');
    console.log('\nNext steps:');
    console.log('1. If the database connection failed, check your Azure PostgreSQL configuration');
    console.log('2. Make sure Azure AD authentication is enabled on your PostgreSQL server');
    console.log('3. Ensure your user is added as an Azure AD user in the database');
    console.log('4. Start the application with: npm run start:dev');
    
  } catch (error) {
    console.error('  Error during Azure AD authentication test:', error.message);
    process.exit(1);
  }
}

// Run the test
testAzureADAuth().catch(console.error);