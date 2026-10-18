#!/usr/bin/env bash
# Deploys one immutable image version to the local cluster.
#
#   scripts/deploy.sh <git-sha>            pull ghcr.io/...:<sha> built by CI (default)
#   scripts/deploy.sh <git-sha> --local    build the image locally and load it into kind
#
# The release gate is CI: by default the script refuses a commit whose pipeline
# did not succeed. helm --rollback-on-failure rolls back automatically if pods never become ready.
set -euo pipefail
cd "$(dirname "$0")/.."

SHA=${1:?usage: deploy.sh <git-sha> [--local]}
MODE=${2:-}
NAMESPACE=${NAMESPACE:-lostnfound}
RELEASE=${RELEASE:-lostnfound}
REPO=ghcr.io/kkartikay-27/lostnfound-api
TAG=$(git rev-parse --short=7 "$SHA")
FULL_SHA=$(git rev-parse "$SHA")
EXTRA=()

if [[ "$MODE" == "--local" ]]; then
  echo "==> building $REPO:$TAG locally"
  docker build -q -t "$REPO:$TAG" \
    --build-arg GIT_SHA="$TAG" --build-arg APP_VERSION="$TAG" \
    --build-arg BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)" backend >/dev/null
  kind load docker-image "$REPO:$TAG" --name lostnfound >/dev/null
  EXTRA+=(--set image.pullPolicy=Never)
else
  echo "==> checking CI result for $FULL_SHA"
  CONCLUSION=$(gh run list --repo KKartikay-27/lost-n-found --workflow ci.yml --commit "$FULL_SHA" \
    --json conclusion --jq '[.[] | select(.conclusion != "")][0].conclusion' 2>/dev/null || true)
  if [[ "$CONCLUSION" != "success" && -z "${SKIP_CI_CHECK:-}" ]]; then
    echo "CI for $TAG is '${CONCLUSION:-not found}'. Refusing to deploy (set SKIP_CI_CHECK=1 to override)." >&2
    exit 1
  fi
fi

NAMESPACE=$NAMESPACE RELEASE=$RELEASE scripts/create-secrets.sh

echo "==> helm upgrade $RELEASE -> $TAG"
helm upgrade --install "$RELEASE" deploy/helm/lostnfound \
  --namespace "$NAMESPACE" \
  --set image.tag="$TAG" \
  "${EXTRA[@]}" \
  --description "deploy $TAG" \
  --rollback-on-failure --wait --timeout 5m

echo "==> helm test"
helm test "$RELEASE" -n "$NAMESPACE" --logs | tail -3
helm history "$RELEASE" -n "$NAMESPACE" --max 5
