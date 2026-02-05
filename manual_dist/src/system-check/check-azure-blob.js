"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_1 = require("./logger.util");
async function checkAzureBlob() {
    try {
        const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connStr)
            throw new Error('AZURE_STORAGE_CONNECTION_STRING no est  presente en el entorno');
        const { BlobServiceClient } = require('@azure/storage-blob');
        const client = BlobServiceClient.fromConnectionString(connStr);
        const iter = client.listContainers();
        await iter.next();
        (0, logger_util_1.logSystemCheck)('Conectividad con Azure Blob Storage exitosa', 'AzureBlob', 'OK');
    }
    catch (error) {
        (0, logger_util_1.logSystemCheck)('Fallo conectividad Azure Blob Storage', 'AzureBlob', 'FAIL', error);
    }
}
if (require.main === module) {
    checkAzureBlob();
}
//# sourceMappingURL=check-azure-blob.js.map