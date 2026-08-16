# Re-gate findings

Second pass. Checked only that each of the nine findings in the
previous re-gate is resolved in the current drafts, and that the
fixes did not open a new hole. Closest read: 13-25 Q02 rescore
and 13-25 Q09 audit / bump-range design. Baseline Kubernetes v1.36.

No unresolved, corruption, new-error, or judgment findings remain.

## Previous nine

00-12 Q05 judgment — resolved. The unscored `StorageClass objects
match the snapshot.` line is gone. The scoring precondition remains
and still zeros a mutated StorageClass.

00-12 Q09 new-error — resolved. Context now says the grader records
the stored original's exact bytes. Verify compares
`/etc/kubernetes/manifests/kube-scheduler.yaml` to that
pre-question snapshot of the external path, not to a snapshot of
the empty live manifests path. A move or copy of the stored
original still matches.

00-12 Q09 corruption — resolved. The `nodeName` right branch now
says that path produces no `Scheduled` event from
`default-scheduler` and fails that check.

13-25 Q01 corruption — resolved. Expected-path step 2 now says the
`NODE_NAME` / `fieldRef` point fails, not check 2.

13-25 Q02 unresolved — resolved. Points are 2+2+2 on candidate
artifacts only. Harness Pod/UID swap, container-ID swap, and
one-pod-per-node are a scoring precondition (tamper → 0). Each log
must contain at least one event for the replacement Pod UID inside
its window, and no event that fails either filter. An empty file
scores 0. A command-only answer is 2/6.

13-25 Q02 corruption — resolved. Expected-path step 4 now says
filter to that Pod UID and to the second window.

13-25 Q02 judgment — resolved. The crictl.md URL is gone. The
kubectl get, Event, and DaemonSet URLs remain.

13-25 Q08 judgment — untouched, as required. The merged verify
block is unchanged.

13-25 Q09 judgment — resolved. The audit now records snapshot hash
and revision at save, the marker Pod's create revision, any delete
of that Pod, and whether `etcdutl snapshot restore` ran. Verify
checks the on-disk snapshot hash against the save-time hash, the
snapshot-then-create order, restore-ran AND serving revision in
the bump range (snapshot revision + 1e9, plus later writes),
gone-marker with delete → 0 on that pair, and a post-restore Pod
that Runs. Copy-live-dir fails the bump pair. Delete-the-marker
zeros the gone-Pod pair. Restore-without-cutover leaves the
serving member unbumped and fails that pair.

## Grader discipline (spot-check)

00-12 Q09: copy or move of the stored original still scores.
Recreate-with-`nodeName` still fails the scheduler event.

13-25 Q02: a filtered capture of the replacement Pod in each
window still scores. An empty log fails. A full-cluster dump in
the window fails the "no event that fails either filter" rule.

13-25 Q09: `etcdutl snapshot restore` with
`--bump-revision=1000000000 --mark-compacted` to a new data dir,
then cut over, still scores. `cp -a` of the live data directory
fails the bump-range pair. Deleting the marker Pod zeros the
gone-Pod pair even if the Pod is absent at the end.

## Verdicts

EXAM-DRAFT-00-12.md: ship
EXAM-DRAFT-13-25.md: ship
