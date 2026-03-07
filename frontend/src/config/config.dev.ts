/**
 * Development configuration
 * Used when NODE_ENV === 'development'
 */
export const devConfig = {
  API_BASE_URL: 'http://localhost:5003/api',
  API_ENCRYPTION_ENABLED: 'true',
  API_ENCRYPTION_SECRET: 'IndianArmy#@!*123',
  API_ENCRYPTION_ALGORITHM: 'aes-256-cbc',

  FRONTEND_URL: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:5003',

  NODE_ENV: 'development' as const,
  IS_PRODUCTION: false,
  IS_DEVELOPMENT: true,

  /** Login page left portrait (CEO) - name, army number, rank */
  LOGIN_LEFT_PERSONNEL: {
    name: '',
    armyNumber: '',
    rank: '',
  },
  /** Login page right portrait (Director) - name, army number, rank */
  LOGIN_RIGHT_PERSONNEL: {
    name: '',
    armyNumber: '',
    rank: '',
  },
} as const;
