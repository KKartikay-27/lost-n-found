import pino from 'pino';
import { trace } from '@opentelemetry/api';

// JSON logs to stdout; the trace id is attached so a log line can be joined to its trace.
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'lostnfound-api' },
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash'],
  mixin() {
    const span = trace.getActiveSpan();
    if (!span) return {};
    const { traceId, spanId } = span.spanContext();
    return { trace_id: traceId, span_id: spanId };
  },
});

export default logger;
