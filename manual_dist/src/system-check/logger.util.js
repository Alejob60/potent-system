"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSystemCheck = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function formatError(error) {
    if (error instanceof Error) {
        return error.stack || error.message;
    }
    return typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : String(error);
}
function logSystemCheck(message, service, status, error) {
    const logsDir = path.resolve(__dirname, '../../../logs');
    if (!fs.existsSync(logsDir))
        fs.mkdirSync(logsDir);
    const timestamp = new Date().toISOString();
    const errorStr = error ? ' | ' + formatError(error) : '';
    const logMsg = `[${timestamp}] [${service}] [${status}] ${message}${errorStr}\n`;
    fs.appendFileSync(path.resolve(logsDir, 'system-check.log'), logMsg);
    if (status === 'OK') {
        console.log(`   [${service}] ${message}`);
    }
    else {
        console.error(`  [${service}] ${message}${errorStr}`);
    }
}
exports.logSystemCheck = logSystemCheck;
//# sourceMappingURL=logger.util.js.map