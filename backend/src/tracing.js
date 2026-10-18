// Loaded with `node --import` so instrumentation patches http/express/mongodb before they are imported.
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || 'lostnfound-api',
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        // Probe and scrape traffic would drown out user requests.
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook: (req) => ['/healthz', '/readyz', '/metrics'].includes(req.url),
        },
      }),
    ],
  });
  sdk.start();
  process.on('SIGTERM', () => sdk.shutdown().catch(() => {}));
}
