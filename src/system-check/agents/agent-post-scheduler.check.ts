import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

function logAgentStatus(
  message: string,
  agent: string,
  status: 'OK' | 'FAIL',
  error?: any,
) {
  const logsDir = path.resolve(__dirname, '../../../logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [${agent}] [${status}] ${message}${error ? ' | ' + (error.stack || error.message || error) : ''}\n`;
  fs.appendFileSync(path.resolve(logsDir, 'agent-status.log'), logMsg);
  status === 'OK'
    ? console.log(`  [${agent}] ${message}`)
    : console.error(`  [${agent}] ${message}${error ? ': ' + error : ''}`);
}

async function testAgentPostScheduler() {
  const baseUrl =
    process.env.AGENT_POST_SCHEDULER_URL ||
    'http://localhost:3000/agents/post-scheduler';

  try {
    // Test POST
    const scheduledAt = new Date(Date.now() + 60 * 1000).toISOString();
    const createRes = await axios.post(baseUrl, {
      content: 'demo post',
      scheduledAt,
    });
    if (!createRes.data || !createRes.data.id)
      throw new Error('POST respuesta inv lida');
    logAgentStatus('POST Ok', 'PostScheduler', 'OK');

    // Test GET
    const listRes = await axios.get(baseUrl);
    if (!Array.isArray(listRes.data))
      throw new Error('GET all respuesta inv lida');
    logAgentStatus('GET All Ok', 'PostScheduler', 'OK');

    // Test GET/:id
    const id = createRes.data.id;
    const getRes = await axios.get(`${baseUrl}/${id}`);
    if (!getRes.data || getRes.data.id !== id)
      throw new Error('GET:id respuesta inv lida');
    logAgentStatus('GET by Id Ok', 'PostScheduler', 'OK');
  } catch (error) {
    logAgentStatus('Error de prueba', 'PostScheduler', 'FAIL', error);
  }
}

if (require.main === module) {
  testAgentPostScheduler();
}
