**Weight: 5 points**

```
kubectl config use-context cka-systems
```

The `report-runner` Deployment in namespace `reports` reports 0 available
replicas. `kubectl get pods -n reports` returns nothing at all.

Get both replicas Running.

Constraints:

- Do not delete or modify the `team-budget` ResourceQuota. It is the team's
  agreed budget.
- Each container must stay within 100m CPU and 128Mi memory.

Write the object whose events explain the failure to `/tmp/u24-cause.txt` —
one line, the kind and name.
