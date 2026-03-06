/**
 * Development configuration
 * Used when NODE_ENV === 'development'
 */
export const devConfig = {
  API_BASE_URL: 'http://localhost:5003/api',
  API_ENCRYPTION_ENABLED: 'false',
  API_ENCRYPTION_SECRET: 'IndianArmy#@!*123',
  API_ENCRYPTION_ALGORITHM: 'aes-256-cbc',

  FRONTEND_URL: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:5003',

  NODE_ENV: 'development' as const,
  IS_PRODUCTION: false,
  IS_DEVELOPMENT: true,
} as const;
