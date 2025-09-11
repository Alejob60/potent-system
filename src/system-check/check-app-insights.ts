import { logSystemCheck } from './logger.util';

async function checkAppInsights() {
  try {
    const instrKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY || process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    if (!instrKey) throw new Error('No Application Insights key or connection string found');
    // Minimal SDK healthcheck
    const appInsights = require('applicationinsights');
    appInsights.setup(instrKey).setAutoCollectConsole(false).start();
    logSystemCheck('Application Insights config OK', 'AppInsights', 'OK');
  } catch (error) {
    logSystemCheck('Application Insights config failed', 'AppInsights', 'FAIL', error);
  }
}

if (require.main === module) {
  checkAppInsights();
}
