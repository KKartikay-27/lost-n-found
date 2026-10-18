import client from 'prom-client';
import { buildInfo } from './config/env.js';

export const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'lostnfound_' });

export const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency by route, method and status',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

export const itemsCreated = new client.Counter({
  name: 'lostnfound_items_created_total',
  help: 'Items successfully posted, by type',
  labelNames: ['type'],
  registers: [register],
});

export const authAttempts = new client.Counter({
  name: 'lostnfound_auth_attempts_total',
  help: 'Login and registration attempts by outcome',
  labelNames: ['action', 'outcome'],
  registers: [register],
});

const info = new client.Gauge({
  name: 'lostnfound_build_info',
  help: 'Build metadata of the running version (always 1)',
  labelNames: ['version', 'commit'],
  registers: [register],
});
info.set({ version: buildInfo.version, commit: buildInfo.commit }, 1);

// Label by the matched route template, not the raw URL, to keep cardinality bounded.
export const metricsMiddleware = (req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
    end({ method: req.method, route, status: res.statusCode });
  });
  next();
};
