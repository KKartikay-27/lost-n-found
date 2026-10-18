#!/usr/bin/env bash
# Creates the local kind cluster and installs the platform add-ons the app relies on.
# Idempotent: safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."

CLUSTER=lostnfound
INGRESS_NGINX_VERSION=controller-v1.12.1
KPS_VERSION=92.10.1
METRICS_SERVER_VERSION=3.14.0

if ! kind get clusters | grep -qx "$CLUSTER"; then
  kind create cluster --config deploy/kind/cluster.yaml --wait 120s
fi
kubectl config use-context "kind-$CLUSTER" >/dev/null

echo "==> ingress-nginx"
kubectl apply -f "https://raw.githubusercontent.com/kubernetes/ingress-nginx/${INGRESS_NGINX_VERSION}/deploy/static/provider/kind/deploy.yaml" >/dev/null

helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/ >/dev/null 2>&1 || true
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts >/dev/null 2>&1 || true
helm repo update >/dev/null

echo "==> metrics-server (for HPA)"
# kind kubelets use self-signed serving certs.
helm upgrade --install metrics-server metrics-server/metrics-server --version "$METRICS_SERVER_VERSION" \
  -n kube-system --set 'args={--kubelet-insecure-tls}' --wait >/dev/null

echo "==> kube-prometheus-stack"
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f - >/dev/null
if ! kubectl -n monitoring get secret grafana-admin >/dev/null 2>&1; then
  kubectl -n monitoring create secret generic grafana-admin \
    --from-literal=admin-user=admin --from-literal=admin-password="$(openssl rand -base64 18)" >/dev/null
fi
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack --version "$KPS_VERSION" \
  -n monitoring -f deploy/observability/kube-prometheus-stack.values.yaml --wait --timeout 10m >/dev/null

echo "==> jaeger"
kubectl create namespace observability --dry-run=client -o yaml | kubectl apply -f - >/dev/null
kubectl apply -f deploy/observability/jaeger.yaml >/dev/null

kubectl -n ingress-nginx wait --for=condition=ready pod -l app.kubernetes.io/component=controller --timeout=180s >/dev/null
echo "Cluster ready. Grafana password: kubectl -n monitoring get secret grafana-admin -o jsonpath='{.data.admin-password}' | base64 -d"
