"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_ad_auth_helper_1 = require("../common/database/azure-ad-auth.helper");
async function test() {
    try {
        console.log('Testing Azure AD Auth Helper import...');
        const isAvailable = await azure_ad_auth_helper_1.AzureADAuthHelper.isAzureCLIAvailable();
        console.log('Azure CLI available:', isAvailable);
    }
    catch (error) {
        console.error('Error testing Azure AD Auth Helper:', error);
    }
}
test();
//# sourceMappingURL=test-import.js.map