# Evidence

All evidence comes from this project running on the local kind cluster (`kind-lostnfound`,
1 control plane + 2 workers). Raw command output lives in `docs/evidence/`.

## Tested version

The final commit can't contain its own CI run and deployment output, so that evidence
is posted on the PR:

| | |
|---|---|
| Final commit | head of [PR #1](https://github.com/KKartikay-27/lost-n-found/pull/1) |
| CI run, deployed version, user journey | the **"Final verification"** comment on PR #1: CI run link for that SHA, CI-gated `scripts/deploy.sh <sha>`, `helm test`, `/version` = SHA, and the ingress user journey |
| Image | `ghcr.io/kkartikay-27/lostnfound-api:<sha7>`, built and scanned by CI |
| Earlier CI run on this branch | https://github.com/KKartikay-27/lost-n-found/actions/runs/39135653192 (all 5 jobs green) |

## Source → delivery → runtime → user journey

1. **Source → CI:** the pipeline run above ran lint, 9 API tests, `npm audit`, gitleaks,
   helm lint, Trivy config + image scans, pushed the SHA-tagged image, and passed
   `helm test` on an ephemeral kind cluster.
2. **Delivery:** `scripts/deploy.sh <sha>` refused to run until that commit's CI succeeded,
   then deployed the exact image CI scanned. The Helm revision is named `deploy <sha7>`.
3. **Runtime:** `/version` and the `lostnfound_build_info` metric report the same SHA.
4. **User journey:** register → post an item → list it, through ingress-nginx
   (`scripts/smoke.sh`) and in-cluster (`helm test`).

## Release control — [`release-control.txt`](evidence/release-control.txt)

- A build that crashes on start (`bad0001`) was deployed under live traffic. The rollout
  stalled because no new pod became ready, and `--rollback-on-failure` reverted it.
  **445/445 requests succeeded during the failed release.**
- Manual `helm rollback` to a chosen revision; `helm history` shows every revision.
- Feature flag `FEATURE_ITEM_SEARCH` toggled through the ConfigMap with the same image: `?q=umbrella`
  returned all items when off and only the matching item when on.

*These demos ran before the final commits on image `984b98f`, a local build of
the same application code before its commits were re-authored. The final commit's
image is verified separately in the PR's final verification comment.*

## Fault and recovery — [`fault-mongodb-outage.txt`](evidence/fault-mongodb-outage.txt)

| Step | What happened |
|---|---|
| Symptom | MongoDB scaled to 0 → users got HTTP 503 from the ingress |
| Hypothesis | Database unavailable, so API readiness is failing |
| Evidence | API pods `0/1` ready with **0 restarts**; Service endpoints empty; `/readyz` failing; log `MongoDB disconnected`; alerts `LostnfoundMongoDown` and `LostnfoundApiUnavailable` **firing** |
| Change | `kubectl scale sts lostnfound-mongo --replicas=1` |
| Verification | HTTP 200, same item count (data persisted on the PVC), log `MongoDB reconnected`, still 0 API restarts, smoke journey passes, both alerts resolved |

## Observability

- **Dashboard** — [`grafana-dashboard.png`](evidence/grafana-dashboard.png): availability vs SLO,
  p95 latency, ready pods, running commit, traffic by route/status, latency percentiles,
  error ratio vs the 1% budget, business counters, CPU/memory.
- **Trace** — [`jaeger-trace.png`](evidence/jaeger-trace.png): `POST /api/auth/register` took 132 ms,
  of which MongoDB (`find users`, `insert users`) was ~4 ms. The rest is bcrypt, which is CPU-bound;
  that is why the HPA scales on CPU.
- **Logs** — JSON per request with `trace_id`, for example:
  `{"level":30,"service":"lostnfound-api","req":{"method":"GET","url":"/api/items",...},"trace_id":"17f38ca6...","res":{"statusCode":200},"responseTime":4}`
- **Alerts** — the SLO recording rules and 5 alerts loaded in Prometheus; two of them fired and resolved during the fault demo.

## Security checks (local runs, also enforced in CI)

| Check | Result |
|---|---|
| `npm audit` (baseline) | 11 vulnerabilities, 1 critical / 8 high in runtime deps |
| `npm audit --omit=dev` (final) | 0 |
| gitleaks, full history | no leaks |
| Trivy config (chart, Dockerfile, manifests) | 0 HIGH/CRITICAL (found and fixed a writable root FS on Jaeger) |
| Trivy image | 0 fixable HIGH/CRITICAL |
| NetworkPolicy enforcement | the `helm test` pod was blocked by default-deny until given an explicit egress rule |
| `/metrics` through the ingress | 404 (not exposed) |
| NoSQL operator injection `?type[$ne]=x` | baseline: crash (500); final: ignored (test `ignores operator injection`) |
