#!/usr/bin/env bash
# The diagnosis: no Pods exist, so the scheduler never saw anything. The
# Deployment is fine; its ReplicaSet is the object being refused.
#   kubectl -n reports describe rs -l app=report-runner | tail
#   -> FailedCreate ... failed quota: team-budget: must specify limits.cpu,
#      limits.memory, requests.cpu, requests.memory
set -uo pipefail
NS=reports

# Strategic merge, not `--type merge`: a JSON merge patch replaces the whole
# containers array, which drops the image and makes the Deployment invalid.
# Strategic merge understands the list's merge key and patches by container
# name. The harness caught this as "canonical solution scores 0".
kubectl -n "$NS" patch deployment report-runner -p '{
  "spec": { "template": { "spec": { "containers": [ {
    "name": "app",
    "resources": {
      "requests": { "cpu": "50m", "memory": "64Mi" },
      "limits":   { "cpu": "100m", "memory": "128Mi" }
    }
  } ] } } }
}' >/dev/null

kubectl -n "$NS" rollout status deployment/report-runner --timeout=120s >/dev/null
echo "ReplicaSet report-runner" > /tmp/u24-cause.txt
