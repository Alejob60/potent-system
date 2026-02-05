"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCORS = void 0;
const logger_util_1 = require("./logger.util");
function checkCORS() {
    try {
        const corsOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',')
            : undefined;
        if (!corsOrigins || corsOrigins.length === 0)
            throw new Error('CORS_ORIGIN not set or empty');
        (0, logger_util_1.logSystemCheck)('CORS origins config OK', 'CORS', 'OK');
    }
    catch (error) {
        (0, logger_util_1.logSystemCheck)('CORS config validation failed', 'CORS', 'FAIL', error);
    }
}
exports.checkCORS = checkCORS;
if (require.main === module) {
    checkCORS();
}
//# sourceMappingURL=check-cors.js.map