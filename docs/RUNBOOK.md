# Runbook

Shortcuts used below: `NS=lostnfound`, Prometheus at `localhost:9090`, Grafana at
`localhost:3000`, Jaeger at `localhost:16686` (see README → Access for port-forwards).

General loop for any alert: **symptom → hypothesis → evidence → change → verify**.
Verification always ends with `scripts/smoke.sh` passing and the alert resolving.

## High error rate
`LostnfoundErrorBudgetBurn` — >14.4% of the 1% error budget per hour, sustained.

1. Which routes? Grafana "Requests/s by route & status", or
   `sum by (route,status) (rate(http_request_duration_seconds_count{status=~"5.."}[5m]))`.
2. Did it start with a deploy? `helm history lostnfound -n $NS` vs the graph; compare `lostnfound_build_info`.
3. Logs for failing requests: `kubectl -n $NS logs -l app.kubernetes.io/name=lostnfound-api --since=15m | grep '"level":50'` — take a `trace_id` into Jaeger.
4. If a release caused it: `helm rollback lostnfound <previous-rev> -n $NS --wait`. If a flagged feature: set its flag to false.
5. Verify: error ratio back under 1% on the dashboard, smoke passes.

## High latency
`LostnfoundHighLatency` — p95 of `/api` > 500 ms for 10 min.

1. Jaeger: sort `lostnfound-api` traces by duration; is time in `find items` (Mongo) or in handlers?
2. Mongo-bound → check Mongo CPU/memory panels and `kubectl top pod -n $NS`; consider an index (e.g. `{isResolved:1, createdAt:-1}` for the feed).
3. CPU-bound (bcrypt on auth) → `kubectl get hpa -n $NS`; is it at max replicas or throttled at the CPU limit?
4. Verify: p95 panel under the SLO line.

## API unavailable
`LostnfoundApiUnavailable` — no available API pods.

1. `kubectl -n $NS get pods -l app.kubernetes.io/name=lostnfound-api` — CrashLoopBackOff or Running-but-not-ready?
2. Not ready + `/readyz` says `db: disconnected` → go to **MongoDB down**.
3. Crashing → `kubectl -n $NS logs <pod> --previous`; usually config/secret (see **Crashloop**).
4. Verify: endpoints populated (`kubectl -n $NS get endpointslices`), smoke passes.

## MongoDB down
`LostnfoundMongoDown`.

1. `kubectl -n $NS get sts,pod,pvc -l app.kubernetes.io/name=lostnfound-mongo` and `kubectl -n $NS describe pod lostnfound-mongo-0`.
2. Pending → PVC/node problem (local-path volumes are tied to one node). OOMKilled → raise `mongo.resources`.
3. Scaled to 0 / deleted → `kubectl -n $NS scale sts lostnfound-mongo --replicas=1`.
4. Verify: API pods turn ready on their own (no restart needed), item count unchanged, smoke passes.
   Worked example: `docs/evidence/fault-mongodb-outage.txt`.

## Crashloop
`LostnfoundPodRestarting`.

1. `kubectl -n $NS logs <pod> --previous` — `Missing required environment variables` means the Secret is incomplete: `kubectl -n $NS get secret lostnfound-secrets -o jsonpath='{.data}' | jq 'keys'`.
2. OOMKilled in `describe pod` → memory limit too low for the workload.
3. Introduced by a release → `helm rollback`.

## Bad release
1. A rollout that never becomes ready is reverted automatically by `--rollback-on-failure`.
2. A release that is ready but wrong: `helm history lostnfound -n $NS`, then `helm rollback lostnfound <rev> -n $NS --wait`.
3. Confirm the version users get: `curl http://lostnfound.localtest.me:8080/version`.
