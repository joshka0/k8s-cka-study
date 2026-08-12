#!/usr/bin/env bash
# A ResourceQuota that requires explicit requests/limits, and a Deployment
# whose Pod template sets none. The ReplicaSet exists, the Deployment exists,
# and there are no Pods at all — not Pending, absent. The evidence lives in
# the ReplicaSet's events, not in the scheduler.
set -uo pipefail
NS=reports

kubectl create namespace "$NS" --dry-run=client -o yaml | kubectl apply -f - >/dev/null
# Reset: see u06's setup for why deleting beats re-applying.
kubectl -n "$NS" delete deployment report-runner --ignore-not-found --wait=true >/dev/null 2>&1

kubectl apply -f - >/dev/null <<YAML
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-budget
  namespace: $NS
spec:
  hard:
    requests.cpu: "500m"
    requests.memory: 512Mi
    limits.cpu: "1"
    limits.memory: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: report-runner
  namespace: $NS
spec:
  replicas: 2
  selector:
    matchLabels: { app: report-runner }
  template:
    metadata:
      labels: { app: report-runner }
    spec:
      containers:
        - name: app
          image: registry.k8s.io/pause:3.10
YAML

echo "setup: $NS/report-runner deployed under quota team-budget"
