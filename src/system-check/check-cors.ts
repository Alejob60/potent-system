import { logSystemCheck } from './logger.util';

export function checkCORS() {
  try {
    const corsOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : undefined;
    if (!corsOrigins || corsOrigins.length === 0)
      throw new Error('CORS_ORIGIN not set or empty');
    logSystemCheck('CORS origins config OK', 'CORS', 'OK');
  } catch (error) {
    logSystemCheck('CORS config validation failed', 'CORS', 'FAIL', error);
  }
}

if (require.main === module) {
  checkCORS();
}
