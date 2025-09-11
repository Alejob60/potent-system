import { logSystemCheck } from './logger.util';

async function runChecks() {
  logSystemCheck('Inicio de auditoría de servicios', 'SystemCheck', 'OK');
  // Los scripts requieren que sus dependencias estén instaladas en el entorno de ejecución.

  // PostgreSQL
  await require('./check-postgres');

  // Azure Blob Storage
  await require('./check-azure-blob');

  // Azure Service Bus
  await require('./check-azure-service-bus');

  // Azure OpenAI
  await require('./check-azure-openai');

  // CORS
  require('./check-cors');

  // JWT y Google OAuth
  require('./check-auth');

  // Application Insights
  await require('./check-app-insights');

  logSystemCheck('Fin de auditoría de servicios', 'SystemCheck', 'OK');
}

if (require.main === module) {
  runChecks()
    .then(() => {
      logSystemCheck('Auditoría completada correctamente', 'SystemCheck', 'OK');
      process.exit(0);
    })
    .catch((err) => {
      logSystemCheck('Auditoría con errores', 'SystemCheck', 'FAIL', err);
      process.exit(1);
    });
}