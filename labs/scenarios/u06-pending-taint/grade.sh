#!/usr/bin/env bash
# Read-only. Prints one integer: the score out of 6.
#
# Grades the end state, never the path — the same rule the real exam uses. A
# toleration, a nodeSelector onto an untainted node, or an admission mutation
# all score full marks if the Pods are Running and the constraints hold.
set -uo pipefail
NS=checkout
score=0

dep=$(kubectl -n "$NS" get deploy checkout-api -o json 2>/dev/null || true)
[[ -z "$dep" ]] && { echo 0; exit 0; }

# +3: both replicas actually Running (not merely scheduled).
running=$(kubectl -n "$NS" get pods -l app=checkout-api \
  -o jsonpath='{range .items[*]}{.status.phase}{"\n"}{end}' 2>/dev/null | grep -c '^Running$' || true)
[[ "${running:-0}" -ge 2 ]] && score=$((score+3))

# The constraint criteria below are gated on the objective being met.
#
# Without this gate the untouched broken state scores 3 of 6: replicas, image
# and taints are all "correct" at setup, so doing nothing earns half marks.
# Constraints describe HOW the objective may be reached, so they can only pay
# once it has been. Caught by the harness on this scenario's first run.
if [[ "${running:-0}" -lt 2 ]]; then
  echo "$score"
  exit 0
fi

# +1: replica count untouched.
[[ "$(jq -r '.spec.replicas' <<<"$dep")" == "2" ]] && score=$((score+1))

# +1: image untouched — catches "fix it by replacing the workload".
img=$(jq -r '.spec.template.spec.containers[0].image' <<<"$dep")
[[ "$img" == "registry.k8s.io/pause:3.10" ]] && score=$((score+1))

# +1: the taint on the claimed node survives. Removing it also gets Pods
# running and is exactly the shortcut the task forbids, so this criterion is
# what makes the scenario teach tolerations rather than taint deletion.
target=$(kubectl get nodes -l lab-u06=target -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [[ -n "$target" ]]; then
  kept=$(kubectl get node "$target" -o json 2>/dev/null \
    | jq '[(.spec.taints // [])[] | select(.key=="workload")] | length')
  [[ "${kept:-0}" -ge 1 ]] && score=$((score+1))
fi

# The cause file is checked by the runner on the candidate's filesystem, not
# here: this grader runs against the cluster and must stay read-only.

echo "$score"
