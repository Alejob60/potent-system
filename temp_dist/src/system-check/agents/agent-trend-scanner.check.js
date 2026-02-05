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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function logAgentStatus(message, agent, status, error) {
    const logsDir = path.resolve(__dirname, '../../../logs');
    if (!fs.existsSync(logsDir))
        fs.mkdirSync(logsDir);
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] [${agent}] [${status}] ${message}${error ? ' | ' + (error.stack || error.message || error) : ''}\n`;
    fs.appendFileSync(path.resolve(logsDir, 'agent-status.log'), logMsg);
    status === 'OK'
        ? console.log(`  [${agent}] ${message}`)
        : console.error(`  [${agent}] ${message}${error ? ': ' + error : ''}`);
}
async function testAgentTrendScanner() {
    const baseUrl = process.env.AGENT_TREND_SCANNER_URL ||
        'http://localhost:3000/agents/trend-scanner';
    try {
        const createRes = await axios_1.default.post(baseUrl, { topic: 'misybot trends' });
        if (!createRes.data || !createRes.data.id)
            throw new Error('POST respuesta inv lida');
        logAgentStatus('POST Ok', 'TrendScanner', 'OK');
        const listRes = await axios_1.default.get(baseUrl);
        if (!Array.isArray(listRes.data))
            throw new Error('GET all respuesta inv lida');
        logAgentStatus('GET All Ok', 'TrendScanner', 'OK');
        const id = createRes.data.id;
        const getRes = await axios_1.default.get(`${baseUrl}/${id}`);
        if (!getRes.data || getRes.data.id !== id)
            throw new Error('GET:id respuesta inv lida');
        logAgentStatus('GET by Id Ok', 'TrendScanner', 'OK');
    }
    catch (error) {
        logAgentStatus('Error de prueba', 'TrendScanner', 'FAIL', error);
    }
}
if (require.main === module) {
    testAgentTrendScanner();
}
//# sourceMappingURL=agent-trend-scanner.check.js.map