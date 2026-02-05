import { logSystemCheck } from './logger.util';

async function checkAzureOpenAI() {
  try {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    if (!apiKey || !endpoint)
      throw new Error(
        'AZURE_OPENAI_API_KEY o AZURE_OPENAI_ENDPOINT no est n presentes en el entorno',
      );
    const fetch = require('node-fetch');
    // Llamada m nima para verificar acceso (list deployments)
    const resp = await fetch(
      `${endpoint}/openai/deployments?api-version=2023-05-15`,
      {
        headers: { 'api-key': apiKey },
      },
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status} - ${await resp.text()}`);
    logSystemCheck('Conectividad Azure OpenAI exitosa', 'AzureOpenAI', 'OK');
  } catch (error) {
    logSystemCheck(
      'Fallo conectividad Azure OpenAI',
      'AzureOpenAI',
      'FAIL',
      error,
    );
  }
}

if (require.main === module) {
  checkAzureOpenAI();
}
