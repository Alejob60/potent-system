"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureADAuthHelper = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
class AzureADAuthHelper {
    static async getAccessToken() {
        try {
            const { stdout } = await execPromise('az account get-access-token --resource https://ossrdbms-aad.database.windows.net --query accessToken --output tsv');
            return stdout.trim();
        }
        catch (error) {
            console.error('Failed to get Azure AD access token:', error);
            throw new Error('Unable to obtain Azure AD access token for database authentication');
        }
    }
    static async isAzureCLIAvailable() {
        try {
            await execPromise('az --version');
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static async isUserLoggedIn() {
        try {
            await execPromise('az account show');
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static async getConnectionOptions() {
        try {
            const isCLIAvailable = await this.isAzureCLIAvailable();
            if (!isCLIAvailable) {
                throw new Error('Azure CLI is not installed or not in PATH');
            }
            const isLoggedIn = await this.isUserLoggedIn();
            if (!isLoggedIn) {
                throw new Error('User is not logged into Azure CLI. Please run "az login"');
            }
            const accessToken = await this.getAccessToken();
            return {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USERNAME || 'postgres',
                password: accessToken,
                database: process.env.DB_NAME || 'postgres',
                ssl: process.env.DB_SSL === 'true' ? {
                    rejectUnauthorized: false
                } : false,
            };
        }
        catch (error) {
            console.error('Failed to configure Azure AD authentication:', error.message);
            throw error;
        }
    }
}
exports.AzureADAuthHelper = AzureADAuthHelper;
//# sourceMappingURL=azure-ad-auth.helper.js.map