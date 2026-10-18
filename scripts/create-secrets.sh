#!/usr/bin/env bash
# Creates the lostnfound-secrets Secret with generated credentials. Values are
# generated here or read from the caller's environment — never from the repo.
# The Mongo root password is only applied when the volume is first initialised,
# so an existing Secret is left alone unless --force is given.
set -euo pipefail

NAMESPACE=${NAMESPACE:-lostnfound}
RELEASE=${RELEASE:-lostnfound}
NAME=lostnfound-secrets

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f - >/dev/null

if kubectl -n "$NAMESPACE" get secret "$NAME" >/dev/null 2>&1 && [[ "${1:-}" != "--force" ]]; then
  echo "Secret $NAMESPACE/$NAME already exists (use --force to regenerate; this breaks an existing Mongo volume)."
  exit 0
fi

MONGO_USER=lostnfound
MONGO_PASS=${MONGO_ROOT_PASSWORD:-$(openssl rand -hex 24)}
JWT=${JWT_SECRET:-$(openssl rand -hex 32)}
MONGO_HOST="$RELEASE-mongo-0.$RELEASE-mongo.$NAMESPACE.svc.cluster.local"

kubectl -n "$NAMESPACE" create secret generic "$NAME" \
  --from-literal=MONGO_ROOT_USERNAME="$MONGO_USER" \
  --from-literal=MONGO_ROOT_PASSWORD="$MONGO_PASS" \
  --from-literal=MONGO_URI="mongodb://$MONGO_USER:$MONGO_PASS@$MONGO_HOST:27017/lostnfound?authSource=admin" \
  --from-literal=JWT_SECRET="$JWT" \
  ${CLOUDINARY_CLOUD_NAME:+--from-literal=CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME"} \
  ${CLOUDINARY_API_KEY:+--from-literal=CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY"} \
  ${CLOUDINARY_API_SECRET:+--from-literal=CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET"} \
  --dry-run=client -o yaml | kubectl apply -f - >/dev/null
echo "Secret $NAMESPACE/$NAME created."
