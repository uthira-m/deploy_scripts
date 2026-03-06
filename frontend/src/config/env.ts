import { devConfig } from './config.dev';
import { productionConfig } from './config.production';

let isProduction =  'production';

export const config = isProduction === 'production' ? productionConfig : devConfig;

export const validateConfig = () => {
  if (config.IS_DEVELOPMENT) {
    console.warn('Running in development mode with dev config.');
  }
  return config;
};

export default config;
