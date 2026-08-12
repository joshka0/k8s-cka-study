#!/usr/bin/env bash
# The canonical solution. The harness runs this to prove full credit is
# reachable — if this scores less than 6, the scenario is broken, not the
# candidate.
set -uo pipefail
NS=checkout

# The diagnosis: the Pods are Pending, and the scheduler's event names the
# plugin that eliminated every node.
#   kubectl -n checkout describe pod <name> | tail
#   -> 0/3 nodes are available: 1 node(s) had untolerated taint
#      {node-role.kubernetes.io/control-plane: }, 2 node(s) had untolerated
#      taint {workload: batch}.
#
# The fix is a toleration, because the task forbids removing the taint.
kubectl -n "$NS" patch deployment checkout-api --type merge -p '{
  "spec": { "template": { "spec": { "tolerations": [
    { "key": "workload", "operator": "Equal", "value": "batch", "effect": "NoSchedule" }
  ] } } }
}' >/dev/null

kubectl -n "$NS" rollout status deployment/checkout-api --timeout=120s >/dev/null
echo "workload" > /tmp/u06-cause.txt
