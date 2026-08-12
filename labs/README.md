# Labs

Scenario-based CKA practice on real kubeadm clusters, in the shape the exam
uses: broken state, terse task, state-based grading with partial credit.

    node labs/tools/harness.mjs u06-pending-taint          # prove one scenario
    node labs/tools/validate-combo.mjs a b                 # can these coexist?
    node labs/tools/harness.mjs a b                        # prove they do

## A scenario is four files and a declaration

    scenarios/<id>/
      meta.json     id, points, spine segments, and the blast radius
      setup.sh      builds the broken state — must RESET, not merely create
      task.md       the exam-style ask and its constraints
      grade.sh      read-only, prints one integer, partial credit
      solution.sh   the canonical fix, run by the harness to prove solvability

`meta.json` declares what the scenario `owns` (exclusive namespaces and
nodes), what it `breaks` (surfaces that go unhealthy until solved), and what
it `requiresHealthy`. Those three fields are what let scenarios be combined
into checkpoint exams without silently masking each other.

## Nothing ships without the harness

A declaration is a claim; the harness is the evidence. It proves against a
real cluster that the broken state grades 0, that the canonical solution
reaches full credit, and — for combinations — that solving one scenario leaves
the others still failing, in either order.

This is not ceremony. On the first two scenarios written here the harness
caught, in order:

1. A grader that gave 3 of 6 for doing nothing, because its "do not change the
   replica count" constraints were satisfied by the untouched broken state.
   Constraints now only pay once the objective is met.
2. A setup that created but did not reset, so a re-run over a solved cluster
   re-graded stale work. A toleration added by `patch` never enters
   last-applied-configuration, so re-applying the manifest does not remove it.
3. A scenario that tainted **every** worker while declaring `breaks: []`,
   which silently made every other scenario in the cluster unschedulable. The
   fault is now narrowed to one claimed node.
4. A canonical solution using `--type merge`, which replaced the whole
   containers array and dropped the image.

Every one of those would have shipped as an unsolvable or self-grading lab.

## Clusters

`systems` is the default: multi-node kubeadm, one lightweight VM per node.
`netpol` exists only for NetworkPolicy work, because the stock kernel cannot
run a policy-enforcing CNI. See BACKEND-SPIKE.md for what was measured and
what has to be designed around.
