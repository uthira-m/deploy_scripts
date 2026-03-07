import { devConfig } from './config.dev';
import { productionConfig } from './config.production';
import { stageConfig } from './config.stage';

const appEnv =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_ENV) ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ? 'development' : 'production');

export const config =
  appEnv === 'production'
    ? productionConfig
    : appEnv === 'stage'
      ? stageConfig
      : devConfig;

export const validateConfig = () => {
  if (config.IS_DEVELOPMENT) {
    console.warn('Running in development mode with dev config.');
  } else if (config.NODE_ENV === 'stage') {
    console.warn('Running in stage mode with stage config.');
  }
  return config;
};

export default config;
