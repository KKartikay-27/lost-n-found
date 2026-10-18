import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { buildInfo, loadConfig } from './config/env.js';
import logger from './logger.js';

const config = loadConfig();

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, ...buildInfo }, 'server listening');
});

// Start serving immediately; /readyz stays 503 until Mongo is reachable, so Kubernetes holds traffic.
const connectWithRetry = async () => {
  try {
    await connectDB(config.mongoUri);
  } catch (err) {
    logger.error({ err: err.message }, 'MongoDB connection failed, retrying in 5s');
    setTimeout(connectWithRetry, 5000);
  }
};
connectWithRetry();

// Kubernetes sends SIGTERM on rollout/eviction: stop accepting, drain in-flight requests, then exit.
const shutdown = (signal) => {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await disconnectDB().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
