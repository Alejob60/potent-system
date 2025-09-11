import { logSystemCheck } from './logger.util';

async function checkAzureServiceBus() {
  try {
    const connStr = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    if (!connStr)
      throw new Error('AZURE_SERVICE_BUS_CONNECTION_STRING no está presente en el entorno');
    const { ServiceBusClient } = require('@azure/service-bus');
    const client = new ServiceBusClient(connStr);
    // Listar colas como healthcheck
    const admin = client.createAdministrationClient();
    await admin.getQueues();
    logSystemCheck('Conectividad Azure Service Bus exitosa', 'AzureServiceBus', 'OK');
    await client.close();
  } catch (error) {
    logSystemCheck('Fallo conectividad Azure Service Bus', 'AzureServiceBus', 'FAIL', error);
  }
}

if (require.main === module) {
  checkAzureServiceBus();
}
