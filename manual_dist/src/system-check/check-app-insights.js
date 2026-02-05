"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_1 = require("./logger.util");
async function checkAppInsights() {
    try {
        const instrKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY ||
            process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
        if (!instrKey)
            throw new Error('No Application Insights key or connection string found');
        const appInsights = require('applicationinsights');
        appInsights.setup(instrKey).setAutoCollectConsole(false).start();
        (0, logger_util_1.logSystemCheck)('Application Insights config OK', 'AppInsights', 'OK');
    }
    catch (error) {
        (0, logger_util_1.logSystemCheck)('Application Insights config failed', 'AppInsights', 'FAIL', error);
    }
}
if (require.main === module) {
    checkAppInsights();
}
//# sourceMappingURL=check-app-insights.js.map