import * as fs from 'fs';
import * as path from 'path';

/**
 * Logger util for system-check scripts
 * Logs to console and logs/system-check.log with timestamp and context
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack || error.message;
  }
  return typeof error === 'object' && error !== null
    ? JSON.stringify(error)
    : String(error);
}

export function logSystemCheck(
  message: string,
  service: string,
  status: 'OK' | 'FAIL',
  error?: unknown,
) {
  const logsDir = path.resolve(__dirname, '../../../logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

  const timestamp = new Date().toISOString();
  const errorStr = error ? ' | ' + formatError(error) : '';
  const logMsg = `[${timestamp}] [${service}] [${status}] ${message}${errorStr}\n`;

  fs.appendFileSync(path.resolve(logsDir, 'system-check.log'), logMsg);
  // Print to console clearly
  if (status === 'OK') {
    console.log(`✅  [${service}] ${message}`);
  } else {
    console.error(`❌ [${service}] ${message}${errorStr}`);
  }
}