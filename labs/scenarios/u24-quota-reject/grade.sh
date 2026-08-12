#!/usr/bin/env bash
# Read-only. Prints one integer out of 5.
set -uo pipefail
NS=reports
score=0

dep=$(kubectl -n "$NS" get deploy report-runner -o json 2>/dev/null || true)
[[ -z "$dep" ]] && { echo 0; exit 0; }

# +3: two Pods actually Running.
running=$(kubectl -n "$NS" get pods -l app=report-runner \
  -o jsonpath='{range .items[*]}{.status.phase}{"\n"}{end}' 2>/dev/null | grep -c '^Running$' || true)
[[ "${running:-0}" -ge 2 ]] && score=$((score+3))

# Constraints only pay once the objective is met — otherwise the untouched
# broken state collects points for things nobody changed.
if [[ "${running:-0}" -lt 2 ]]; then echo "$score"; exit 0; fi

# +1: the quota is untouched, in name and in every hard value.
q=$(kubectl -n "$NS" get resourcequota team-budget -o json 2>/dev/null || true)
if [[ -n "$q" ]]; then
  ok=$(jq -r '[.spec.hard["requests.cpu"]=="500m",
               .spec.hard["requests.memory"]=="512Mi",
               .spec.hard["limits.cpu"]=="1",
               .spec.hard["limits.memory"]=="1Gi"] | all' <<<"$q")
  [[ "$ok" == "true" ]] && score=$((score+1))
fi

# +1: the declared ceiling is respected. Read from the live Pods rather than
# the template, so a mutating default or a LimitRange counts as a valid fix.
within=$(kubectl -n "$NS" get pods -l app=report-runner -o json 2>/dev/null | jq '
  def m2i(s): if s == null then 999999
    elif (s|test("Mi$")) then (s|sub("Mi$";"")|tonumber)
    elif (s|test("Gi$")) then (s|sub("Gi$";"")|tonumber * 1024)
    else 999999 end;
  def c2m(s): if s == null then 999999
    elif (s|test("m$")) then (s|sub("m$";"")|tonumber)
    else (s|tonumber * 1000) end;
  [ .items[].spec.containers[]
    | (c2m(.resources.requests.cpu) <= 100) and (m2i(.resources.requests.memory) <= 128)
  ] | all and (length > 0)')
[[ "$within" == "true" ]] && score=$((score+1))

echo "$score"
