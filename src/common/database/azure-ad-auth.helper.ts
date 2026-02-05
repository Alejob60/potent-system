import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Helper class for Azure AD authentication with PostgreSQL
 */
export class AzureADAuthHelper {
  /**
   * Get Azure AD access token for PostgreSQL database
   * @returns Access token string
   */
  static async getAccessToken(): Promise<string> {
    try {
      // Execute Azure CLI command to get access token
      const { stdout } = await execPromise(
        'az account get-access-token --resource https://ossrdbms-aad.database.windows.net --query accessToken --output tsv'
      );
      
      // Remove any whitespace or newlines
      return stdout.trim();
    } catch (error) {
      console.error('Failed to get Azure AD access token:', error);
      throw new Error('Unable to obtain Azure AD access token for database authentication');
    }
  }

  /**
   * Check if Azure CLI is installed and logged in
   * @returns Boolean indicating if Azure CLI is available
   */
  static async isAzureCLIAvailable(): Promise<boolean> {
    try {
      await execPromise('az --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is logged into Azure CLI
   * @returns Boolean indicating if user is logged in
   */
  static async isUserLoggedIn(): Promise<boolean> {
    try {
      await execPromise('az account show');
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get PostgreSQL connection options with Azure AD token
   * @returns Connection options object
   */
  static async getConnectionOptions() {
    try {
      // Check if Azure CLI is available
      const isCLIAvailable = await this.isAzureCLIAvailable();
      if (!isCLIAvailable) {
        throw new Error('Azure CLI is not installed or not in PATH');
      }

      // Check if user is logged in
      const isLoggedIn = await this.isUserLoggedIn();
      if (!isLoggedIn) {
        throw new Error('User is not logged into Azure CLI. Please run "az login"');
      }

      // Get access token
      const accessToken = await this.getAccessToken();
      
      return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: accessToken, // Use token as password
        database: process.env.DB_NAME || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: false
        } : false,
      };
    } catch (error) {
      console.error('Failed to configure Azure AD authentication:', error.message);
      throw error;
    }
  }
}