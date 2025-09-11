import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

function logAgentStatus(message: string, agent: string, status: 'OK' | 'FAIL', error?: any) {
  const logsDir = path.resolve(__dirname, '../../../logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [${agent}] [${status}] ${message}${error ? ' | ' + (error.stack || error.message || error) : ''}\n`;
  fs.appendFileSync(path.resolve(logsDir, 'agent-status.log'), logMsg);
  (status === 'OK') ? console.log(`✅ [${agent}] ${message}`) : console.error(`❌ [${agent}] ${message}${error ? ': ' + error : ''}`);
}

async function testAgentTrendScanner() {
  const baseUrl = process.env.AGENT_TREND_SCANNER_URL || 'http://localhost:3000/agents/trend-scanner';

  try {
    // Test POST
    const createRes = await axios.post(baseUrl, { topic: 'misybot trends' });
    if (!createRes.data || !createRes.data.id) throw new Error('POST respuesta inválida');
    logAgentStatus('POST Ok', 'TrendScanner', 'OK');

    // Test GET
    const listRes = await axios.get(baseUrl);
    if (!Array.isArray(listRes.data)) throw new Error('GET all respuesta inválida');
    logAgentStatus('GET All Ok', 'TrendScanner', 'OK');

    // Test GET/:id
    const id = createRes.data.id;
    const getRes = await axios.get(`${baseUrl}/${id}`);
    if (!getRes.data || getRes.data.id !== id) throw new Error('GET:id respuesta inválida');
    logAgentStatus('GET by Id Ok', 'TrendScanner', 'OK');

  } catch (error) {
    logAgentStatus('Error de prueba', 'TrendScanner', 'FAIL', error);
  }
}

if (require.main === module) {
  testAgentTrendScanner();
}
