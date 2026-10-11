# Authoring lab scenarios

Read this in full before writing a scenario. Then read the two that already
exist — `scenarios/u06-pending-taint` and `scenarios/u24-quota-reject` — and
match them exactly. They are the format, not examples of it.

## What a scenario is

A pre-broken cluster, a terse exam-style task, and a grader that scores the
end state. The candidate gets a real cluster and real kubectl. There is no
multiple choice and no simulated shell.

Five files, no more:

    scenarios/<id>/
      meta.json     identity, points, spine segment, blast radius
      setup.sh      builds the broken state
      task.md       the ask and its constraints
      grade.sh      read-only, prints ONE integer, partial credit
      solution.sh   the canonical fix

## The rules that are not negotiable

**Grade the end state, never the path.** The real CKA scores outcomes. If a
candidate reaches the required state by a route you did not imagine, they
score full marks. Never grep shell history, never require a specific command,
never check *how* a field arrived.

**`grade.sh` prints one integer and changes nothing.** No `kubectl apply`, no
patches, no deletes. It runs repeatedly during a session and must be safe
every time.

**`setup.sh` RESETS, it does not merely create.** It is run over clusters that
may already be solved. Delete the objects it owns and recreate them. A
toleration added by `patch` never enters last-applied-configuration, so
re-applying a manifest does *not* remove it — an early scenario shipped this
bug and the harness caught it re-grading stale work as solved.

**Constraint criteria only pay once the objective is met.** The first grader
written here awarded 3 of 6 for doing nothing, because its "do not change the
replica count" checks were satisfied by the untouched broken state. Gate them:
if the main objective fails, print the score so far and exit.

**Damage only what you declare.** `meta.json` lists the namespaces and nodes
the scenario `owns`, the surfaces it `breaks`, and the surfaces it
`requiresHealthy`. An early scenario tainted *every* worker while declaring
`breaks: []`, which silently made every other scenario in the same cluster
unschedulable. If you need a node, claim exactly one by label and leave the
rest alone.

**Read node names live, never hardcode them.** Node VMs get a new IP on every
start and cluster names differ. `kubectl get nodes -l
'!node-role.kubernetes.io/control-plane'` and take what you need.

**No image pulls from outside the node image where avoidable.** Prefer
`registry.k8s.io/pause:3.10` and `nginx:alpine`, which are already cached.

## meta.json

```json
{
  "id": "u14-stale-secret",
  "title": "One line, the symptom as a candidate would describe it",
  "unit": "u14",
  "segments": ["kubelet"],
  "points": 5,
  "cluster": "systems",
  "owns": ["ns/payments"],
  "breaks": [],
  "requiresHealthy": ["api-server", "node/any-schedulable"],
  "chainAfter": null
}
```

`segments` uses the spine's names, not module numbers: `desired-object`,
`admission-storage`, `watch-cache`, `controller-queue`, `scheduler-binding`,
`kubelet`, `cri`, `cni`, `csi`, `endpointslice`, `service`, `dns`,
`dataplane`, `application`.

Surfaces for `breaks` / `requiresHealthy` come from a fixed vocabulary —
`api-server`, `etcd`, `scheduler`, `dns`, `cni`, `dataplane`,
`storage-class`, `rbac-cluster`, `node/any-schedulable` — plus prefixed forms
`node/<name>`, `quota/<ns>`, `ns/<name>`, `psa/<name>`. The validator rejects
anything else, deliberately: an open vocabulary lets two scenarios name the
same thing differently and slip past the conflict check.

`points`: 4–8, weighted by how much diagnosis the task demands.

## Nothing ships until the harness proves it

    node labs/tools/harness.mjs <id>

It must print all ✓. The harness proves the broken state grades **0**, and
that your `solution.sh` reaches **full points**. Both are common failures:

- A canonical solution using `--type merge` on a Deployment replaced the whole
  containers array and dropped the image. Strategic merge (the default) is
  almost always what you want.
- A grader that reads immediately after an action sees the state before the
  controllers acted. Add `"settleSeconds": 15` to meta.json if your scenario
  needs longer than the 8-second default.

Also run the pair check against every existing scenario:

    node labs/tools/validate-combo.mjs <your-id> u06-pending-taint
    node labs/tools/validate-combo.mjs <your-id> u24-quota-reject

## Writing the task

Terse. Exam voice. State the symptom, the goal, and the constraints. Never
name the cause — the diagnosis is the exercise.

Good: *"The `checkout-api` Deployment in namespace `checkout` has no running
Pods. The nodes report plenty of free CPU and memory."*

Bad: *"A taint is blocking scheduling. Add a toleration."*

Constraints exist to force the intended diagnosis rather than a shortcut. "Do
not remove the taint" is what makes a scheduling scenario teach tolerations
instead of taint deletion. Every constraint you write must be graded, or it is
decoration.

Include one artefact the candidate writes to `/tmp/<id>-cause.txt` naming what
they found. It is not graded by `grade.sh` (which stays cluster-only) but it
forces them to articulate the diagnosis.
