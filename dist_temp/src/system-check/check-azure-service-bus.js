"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_1 = require("./logger.util");
async function checkAzureServiceBus() {
    try {
        const connStr = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
        if (!connStr)
            throw new Error('AZURE_SERVICE_BUS_CONNECTION_STRING no est  presente en el entorno');
        const { ServiceBusClient } = require('@azure/service-bus');
        const client = new ServiceBusClient(connStr);
        const admin = client.createAdministrationClient();
        await admin.getQueues();
        (0, logger_util_1.logSystemCheck)('Conectividad Azure Service Bus exitosa', 'AzureServiceBus', 'OK');
        await client.close();
    }
    catch (error) {
        (0, logger_util_1.logSystemCheck)('Fallo conectividad Azure Service Bus', 'AzureServiceBus', 'FAIL', error);
    }
}
if (require.main === module) {
    checkAzureServiceBus();
}
//# sourceMappingURL=check-azure-service-bus.js.map