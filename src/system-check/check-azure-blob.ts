import { logSystemCheck } from './logger.util';

async function checkAzureBlob() {
  try {
    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connStr)
      throw new Error(
        'AZURE_STORAGE_CONNECTION_STRING no est  presente en el entorno',
      );
    const { BlobServiceClient } = require('@azure/storage-blob');
    const client = BlobServiceClient.fromConnectionString(connStr);
    const iter = client.listContainers();
    await iter.next();
    logSystemCheck(
      'Conectividad con Azure Blob Storage exitosa',
      'AzureBlob',
      'OK',
    );
  } catch (error) {
    logSystemCheck(
      'Fallo conectividad Azure Blob Storage',
      'AzureBlob',
      'FAIL',
      error,
    );
  }
}

if (require.main === module) {
  checkAzureBlob();
}
