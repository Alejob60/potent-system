import { logSystemCheck } from './logger.util';

async function runChecks() {
  logSystemCheck('Inicio de auditor a de servicios', 'SystemCheck', 'OK');
  // Los scripts requieren que sus dependencias est n instaladas en el entorno de ejecuci n.

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

  logSystemCheck('Fin de auditor a de servicios', 'SystemCheck', 'OK');
}

if (require.main === module) {
  runChecks()
    .then(() => {
      logSystemCheck('Auditor a completada correctamente', 'SystemCheck', 'OK');
      process.exit(0);
    })
    .catch((err) => {
      logSystemCheck('Auditor a con errores', 'SystemCheck', 'FAIL', err);
      process.exit(1);
    });
}
