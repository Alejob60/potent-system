import { AzureADAuthHelper } from '../common/database/azure-ad-auth.helper';

async function test() {
  try {
    console.log('Testing Azure AD Auth Helper import...');
    const isAvailable = await AzureADAuthHelper.isAzureCLIAvailable();
    console.log('Azure CLI available:', isAvailable);
  } catch (error) {
    console.error('Error testing Azure AD Auth Helper:', error);
  }
}

test();