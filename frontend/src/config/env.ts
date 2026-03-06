
export const config = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5003/api',
  API_ENCRYPTION_ENABLED: process.env.NEXT_PUBLIC_API_ENCRYPTION_ENABLED || 'true',
  API_ENCRYPTION_SECRET: process.env.NEXT_PUBLIC_API_ENCRYPTION_SECRET || 'IndianArmy#@!*123',
  API_ENCRYPTION_ALGORITHM: process.env.NEXT_PUBLIC_API_ENCRYPTION_ALGORITHM || 'aes-256-cbc',
  
  // Frontend Configuration
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',    
  
  // Backend Configuration
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5003',
  // BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.75:5003',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Validate required environment variables
export const validateConfig = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0 && config.IS_DEVELOPMENT) {
    console.warn('Missing environment variables:', missing);
    console.warn('Using default values. Create a .env.local file with proper values.');
  }

  const isEncryptionEnabled =
    (process.env.NEXT_PUBLIC_API_ENCRYPTION_ENABLED || 'false')
      .toLowerCase() === 'true';

  if (
    isEncryptionEnabled &&
    !process.env.NEXT_PUBLIC_API_ENCRYPTION_SECRET &&
    config.IS_DEVELOPMENT
  ) {
    console.warn(
      'API encryption is enabled but NEXT_PUBLIC_API_ENCRYPTION_SECRET is not set.',
    );
  }
  
  return config;
};

export default config;