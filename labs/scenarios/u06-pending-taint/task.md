**Weight: 6 points**

```
kubectl config use-context cka-systems
```

The `checkout-api` Deployment in namespace `checkout` has no running Pods. The
nodes report plenty of free CPU and memory.

Get both replicas Running.

Constraints:

- Do not change the Deployment's replica count.
- Do not change the container image.
- Leave the nodes' existing taints in place. Other teams rely on them.

Write the name of the constraint that blocked scheduling to
`/tmp/u06-cause.txt` — one line, the taint key you found.
