import 'dotenv/config';

const requiredInProduction = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

if (process.env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI,
  accessSecret: process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-change-me',
  accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  ,redisUrl: process.env.REDIS_URL
  ,pdfBaseUrl: process.env.PDF_BASE_URL
  ,emailFrom: process.env.EMAIL_FROM
};
