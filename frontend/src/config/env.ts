import { devConfig } from './config.dev';
import { productionConfig } from './config.production';
import { stageConfig } from './config.stage';

let appEnv = 'production';

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
