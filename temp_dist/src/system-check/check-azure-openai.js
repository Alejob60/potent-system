"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_1 = require("./logger.util");
async function checkAzureOpenAI() {
    try {
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        if (!apiKey || !endpoint)
            throw new Error('AZURE_OPENAI_API_KEY o AZURE_OPENAI_ENDPOINT no est n presentes en el entorno');
        const fetch = require('node-fetch');
        const resp = await fetch(`${endpoint}/openai/deployments?api-version=2023-05-15`, {
            headers: { 'api-key': apiKey },
        });
        if (!resp.ok)
            throw new Error(`HTTP ${resp.status} - ${await resp.text()}`);
        (0, logger_util_1.logSystemCheck)('Conectividad Azure OpenAI exitosa', 'AzureOpenAI', 'OK');
    }
    catch (error) {
        (0, logger_util_1.logSystemCheck)('Fallo conectividad Azure OpenAI', 'AzureOpenAI', 'FAIL', error);
    }
}
if (require.main === module) {
    checkAzureOpenAI();
}
//# sourceMappingURL=check-azure-openai.js.map