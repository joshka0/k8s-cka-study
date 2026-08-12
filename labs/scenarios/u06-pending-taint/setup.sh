#!/usr/bin/env bash
# A Deployment pinned to one node, and that node carries a taint the Pod does
# not tolerate. Requests are tiny, so a candidate who reads capacity instead
# of events finds nothing wrong — the discrimination this scenario teaches.
#
# The fault is deliberately narrow: exactly one worker is claimed, labelled
# and tainted. An earlier version tainted every worker, which silently made
# any other scenario in the same cluster unschedulable — the harness caught it
# as "u24's canonical solution scores 0". A scenario must damage only what it
# declares in meta.json `owns`.
set -uo pipefail
NS=checkout
LABEL=lab-u06

kubectl create namespace "$NS" --dry-run=client -o yaml | kubectl apply -f - >/dev/null

# Setup must RESET, not merely create. A toleration added with `patch` never
# enters last-applied-configuration, so re-applying the original manifest does
# not remove it — the field-ownership behaviour this course teaches, met in
# our own tooling. Deleting is the only reliable reset.
kubectl -n "$NS" delete deployment checkout-api --ignore-not-found --wait=true >/dev/null 2>&1

WORKERS=$(kubectl get nodes -l '!node-role.kubernetes.io/control-plane' \
  -o jsonpath='{.items[*].metadata.name}' | tr ' ' '\n' | sort)
COUNT=$(echo "$WORKERS" | grep -c . || true)
if [[ "$COUNT" -lt 2 ]]; then
  echo "refusing: this scenario claims one worker exclusively and needs another left schedulable (found $COUNT)" >&2
  exit 1
fi

TARGET=$(echo "$WORKERS" | head -1)
kubectl label node "$TARGET" "$LABEL=target" --overwrite >/dev/null
kubectl taint node "$TARGET" workload=batch:NoSchedule --overwrite >/dev/null

kubectl apply -f - >/dev/null <<YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout-api
  namespace: $NS
spec:
  replicas: 2
  selector:
    matchLabels: { app: checkout-api }
  template:
    metadata:
      labels: { app: checkout-api }
    spec:
      nodeSelector:
        $LABEL: target
      containers:
        - name: app
          image: registry.k8s.io/pause:3.10
          resources:
            requests: { cpu: 10m, memory: 16Mi }
YAML

echo "setup: $NS/checkout-api pinned to $TARGET, which is tainted workload=batch"
