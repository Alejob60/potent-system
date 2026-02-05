"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_1 = require("./logger.util");
async function runChecks() {
    (0, logger_util_1.logSystemCheck)('Inicio de auditor a de servicios', 'SystemCheck', 'OK');
    await require('./check-postgres');
    await require('./check-azure-blob');
    await require('./check-azure-service-bus');
    await require('./check-azure-openai');
    require('./check-cors');
    require('./check-auth');
    await require('./check-app-insights');
    (0, logger_util_1.logSystemCheck)('Fin de auditor a de servicios', 'SystemCheck', 'OK');
}
if (require.main === module) {
    runChecks()
        .then(() => {
        (0, logger_util_1.logSystemCheck)('Auditor a completada correctamente', 'SystemCheck', 'OK');
        process.exit(0);
    })
        .catch((err) => {
        (0, logger_util_1.logSystemCheck)('Auditor a con errores', 'SystemCheck', 'FAIL', err);
        process.exit(1);
    });
}
//# sourceMappingURL=check-all.js.map