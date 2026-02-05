"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const logger_util_1 = require("./logger.util");
function checkAuth() {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not set');
        }
        (0, logger_util_1.logSystemCheck)('JWT secret set', 'AuthJWT', 'OK');
    }
    catch (error) {
        (0, logger_util_1.logSystemCheck)('JWT secret validation failed', 'AuthJWT', 'FAIL', error);
    }
    try {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
        }
        (0, logger_util_1.logSystemCheck)('Google OAuth config set', 'AuthGoogleOAuth', 'OK');
    }
    catch (error) {
        (0, logger_util_1.logSystemCheck)('Google OAuth config validation failed', 'AuthGoogleOAuth', 'FAIL', error);
    }
}
exports.checkAuth = checkAuth;
if (require.main === module) {
    checkAuth();
}
//# sourceMappingURL=check-auth.js.map