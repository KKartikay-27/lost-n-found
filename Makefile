NS ?= lostnfound
SHA ?= HEAD

.PHONY: cluster deploy deploy-local smoke test lint grafana grafana-password prometheus jaeger status destroy

cluster:          ## kind cluster + platform add-ons
	./scripts/cluster-up.sh

deploy:           ## deploy the CI-built image for SHA (default HEAD)
	./scripts/deploy.sh $(SHA)

deploy-local:     ## build locally, load into kind, deploy
	./scripts/deploy.sh $(SHA) --local

smoke:            ## user journey through the ingress
	./scripts/smoke.sh

test lint:
	cd backend && npm ci && npm run $@

status:
	@helm history lostnfound -n $(NS) --max 5
	@kubectl -n $(NS) get pods,hpa,pvc
	@curl -fsS http://lostnfound.localtest.me:8080/version; echo

grafana:
	kubectl -n monitoring port-forward svc/kube-prometheus-stack-grafana 3000:80

grafana-password:
	@kubectl -n monitoring get secret grafana-admin -o jsonpath='{.data.admin-password}' | base64 -d; echo

prometheus:
	kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090

jaeger:
	kubectl -n observability port-forward svc/jaeger-ui 16686:16686

destroy:
	kind delete cluster --name lostnfound
