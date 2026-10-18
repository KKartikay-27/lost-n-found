import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const required = ['MONGO_URI', 'JWT_SECRET'];

export const loadConfig = () => {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  return {
    port: Number(process.env.PORT) || 5050,
    mongoUri: process.env.MONGO_URI,
    logLevel: process.env.LOG_LEVEL || 'info',
  };
};

// Build metadata is baked into the image by CI so the running version is traceable.
export const buildInfo = {
  version: process.env.APP_VERSION || 'dev',
  commit: process.env.GIT_SHA || 'unknown',
  builtAt: process.env.BUILD_TIME || 'unknown',
};
