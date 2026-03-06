/**
 * Production configuration
 * Used when NODE_ENV === 'production'
 * Update API_BASE_URL to your production API endpoint
 */
export const productionConfig = {
  API_BASE_URL: 'http://169.254.124.23/api',
  API_ENCRYPTION_ENABLED: 'true',
  API_ENCRYPTION_SECRET: 'IndianArmy#@!*123',
  API_ENCRYPTION_ALGORITHM: 'aes-256-cbc',

  FRONTEND_URL: 'http://169.254.124.23:3000',
  BACKEND_URL: 'http://169.254.124.23:5003',

  NODE_ENV: 'production' as const,
  IS_PRODUCTION: true,
  IS_DEVELOPMENT: false,
} as const;
