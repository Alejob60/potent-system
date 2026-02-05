export declare class AzureADAuthHelper {
    static getAccessToken(): Promise<string>;
    static isAzureCLIAvailable(): Promise<boolean>;
    static isUserLoggedIn(): Promise<boolean>;
    static getConnectionOptions(): Promise<{
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        ssl: boolean | {
            rejectUnauthorized: boolean;
        };
    }>;
}
