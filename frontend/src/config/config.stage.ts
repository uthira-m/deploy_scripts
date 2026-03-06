/**
 * Stage configuration
 * Used when NEXT_PUBLIC_APP_ENV === 'stage'
 * Update API_BASE_URL to your production API endpoint
 */
export const stageConfig = {
  API_BASE_URL: 'https://ipmas.mapskil.com/api',
  API_ENCRYPTION_ENABLED: 'true',
  API_ENCRYPTION_SECRET: 'IndianArmy#@!*123',
  API_ENCRYPTION_ALGORITHM: 'aes-256-cbc',

  FRONTEND_URL: 'https://ipmas.mapskil.com:3000',
  BACKEND_URL: 'https://ipmas.mapskil.com:5003',

  NODE_ENV: 'stage' as const,
  IS_PRODUCTION: false,
  IS_DEVELOPMENT: false,
} as const;
