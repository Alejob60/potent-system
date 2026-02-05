import { logSystemCheck } from './logger.util';

export function checkAuth() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not set');
    }
    logSystemCheck('JWT secret set', 'AuthJWT', 'OK');
  } catch (error) {
    logSystemCheck('JWT secret validation failed', 'AuthJWT', 'FAIL', error);
  }

  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
    }
    logSystemCheck('Google OAuth config set', 'AuthGoogleOAuth', 'OK');
  } catch (error) {
    logSystemCheck(
      'Google OAuth config validation failed',
      'AuthGoogleOAuth',
      'FAIL',
      error,
    );
  }
}

if (require.main === module) {
  checkAuth();
}
