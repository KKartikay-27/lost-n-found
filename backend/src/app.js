import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { buildInfo } from './config/env.js';
import { isDBReady } from './config/db.js';
import { getMyItems } from './controllers/item.controller.js';
import logger from './logger.js';
import { metricsMiddleware, register } from './metrics.js';
import auth from './middleware/auth.middleware.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();
app.disable('x-powered-by');
// One ingress hop in front of the pods; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);

// Operational endpoints sit before logging so probes and scrapes do not flood the logs.
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.get('/readyz', (req, res) => {
  if (!isDBReady()) return res.status(503).json({ status: 'unavailable', db: 'disconnected' });
  res.json({ status: 'ready', db: 'connected' });
});
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '100kb' }));
app.use(pinoHttp({ logger, customLogLevel: (req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info') }));
app.use(metricsMiddleware);

app.get('/version', (req, res) => res.json(buildInfo));
app.get('/api/version', (req, res) => res.json(buildInfo));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/upload', uploadRoutes);

// Compatibility route to support clients calling /api/my-items
app.get('/api/my-items', auth, getMyItems);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  req.log.error({ err }, 'unhandled error');
  res.status(err.status || 500).json({ message: err.expose ? err.message : 'Internal server error' });
});

export default app;
