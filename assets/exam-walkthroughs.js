/* Kubernetes Beyond YAML — interactive evidence walkthroughs for exam questions.
   Loaded as a plain global so the exam page still works from file://.

   Shape
     window.EXAM_WALKTHROUGHS = {
       "<question-id>": {
         steps: [
           { evidence: [{ type, title, text }],
             prompt: "...",
             options: [{ label, verdict, feedback: { evidence?, teach } }] }
         ],
         closing: "..."
       }
     }

   evidence.type   'terminal' | 'file' | 'note'
   option.verdict  'right'  advances (exactly one per step)
                   'wrong'  shows feedback, learner retries
                   'partial' shows feedback, learner retries

   Every option carries feedback.teach. Wrong options show the evidence that
   move would actually return, because being shown the empty result teaches
   more than being told no.

   Terminal output follows kubectl v1.36 printer columns and upstream event
   reason strings. Inline code in teach text uses <code>, never backticks. */

window.EXAM_WALKTHROUGHS = {

  /* ------------------------------------------------------------------ */
  /* exam-draft-13-25-q02 — event storms: kill a DaemonSet pod, then its
     container. The whole question is one contrast: a new Pod object versus
     a new container inside the same Pod object.                          */
  /* ------------------------------------------------------------------ */

  "exam-draft-13-25-q02": {
    steps: [

      /* 1 — the command, written literally */
      {
        evidence: [
          { type: 'terminal', title: 'Where you start',
            text: `$ kubectl config current-context
ck-amber

$ kubectl -n kube-system get ds node-tailer
NAME          DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
node-tailer   3         3         3       3            3           <none>          16d

$ kubectl -n kube-system get pods -l app=node-tailer -o wide
NAME                READY   STATUS    RESTARTS   AGE   IP           NODE             NOMINATED NODE   READINESS GATES
node-tailer-4wq7d   1/1     Running   0          16d   10.1.0.7     amber-master-1   <none>           <none>
node-tailer-pb2xk   1/1     Running   0          16d   10.1.1.12    amber-worker-1   <none>           <none>
node-tailer-h9sfm   1/1     Running   0          16d   10.1.2.19    amber-worker-2   <none>           <none>` },
          { type: 'terminal', title: 'The three files are empty',
            text: `$ wc -c /opt/exam/02/commands.txt /opt/exam/02/events_pod.log /opt/exam/02/events_container.log
0 /opt/exam/02/commands.txt
0 /opt/exam/02/events_pod.log
0 /opt/exam/02/events_container.log
0 total` },
          { type: 'note', title: 'Grading line for commands.txt',
            text: 'One line, beginning "kubectl get events", containing --all-namespaces or -A, and --sort-by=.metadata.creationTimestamp. An alias in the file is graded as absent.' }
        ],
        prompt: 'Nothing has happened yet. Write the events command into commands.txt. Which line do you put in the file?',
        options: [
          { label: 'kubectl get events -A --sort-by=.metadata.creationTimestamp',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'file', title: '/opt/exam/02/commands.txt',
                  text: `kubectl get events -A --sort-by=.metadata.creationTimestamp` },
                { type: 'terminal', title: 'Prove the file itself runs',
                  text: `$ sh /opt/exam/02/commands.txt | head -4
NAMESPACE     LAST SEEN   TYPE     REASON      OBJECT                    MESSAGE
kube-system   14m         Normal   Pulled      pod/coredns-6f9c8b7d-2vtn9   Container image "registry.k8s.io/coredns/coredns:v1.12.1" already present on machine
default       9m          Normal   Scheduled   pod/tide-runner-5f4b9      Successfully assigned default/tide-runner-5f4b9 to amber-worker-1
kube-system   3m          Normal   Started     pod/kube-proxy-r7wq2       Container started` }
              ],
              teach: 'The file must be executable text, not a habit. Test it with <code>sh</code>, not by reading it. Two flags carry the grade: <code>-A</code> because Events are namespaced and the DaemonSet lives in kube-system, and <code>--sort-by=.metadata.creationTimestamp</code> because you need the newest at the bottom to see an ordered story.'
            } },
          { label: 'k get events -A --sort-by=.metadata.creationTimestamp',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What the file does when run',
                  text: `$ sh /opt/exam/02/commands.txt
/opt/exam/02/commands.txt: 1: k: not found` }
              ],
              teach: 'The alias lives in your interactive shell rc. A script is a fresh non-interactive shell, so it never sees it. This is why the grading line says the raw command text. Always test a written command by executing the file.'
            } },
          { label: 'kubectl get events --sort-by=.metadata.creationTimestamp',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What it returns',
                  text: `$ kubectl get events --sort-by=.metadata.creationTimestamp
No resources found in default namespace.` }
              ],
              teach: 'Event is a namespaced object. Without <code>-A</code> you get the current namespace only, and node-tailer runs in kube-system. The command is not wrong, it is just aimed somewhere else.'
            } },
          { label: 'kubectl get events -A --sort-by=.lastTimestamp',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'It runs, and it even looks right',
                  text: `$ kubectl get events -A --sort-by=.lastTimestamp | tail -3
kube-system   2m    Normal   Pulled    pod/node-tailer-h9sfm   Container image "quay.io/prometheus/node-exporter:v1.8.2" already present on machine
kube-system   2m    Normal   Created   pod/node-tailer-h9sfm   Container created
kube-system   2m    Normal   Started   pod/node-tailer-h9sfm   Container started` }
              ],
              teach: 'This runs and sorts plausibly, so nothing warns you. But <code>lastTimestamp</code> is the most recent occurrence of a repeated event, not when the event object was born, so a long-running repeat jumps to the bottom and reorders your story. The task names <code>.metadata.creationTimestamp</code>. Write what was asked.'
            } }
        ]
      },

      /* 2 — window one opens */
      {
        evidence: [
          { type: 'note', title: 'Harness signal: capture window 1 is OPEN',
            text: 'Pre-action snapshot on amber-worker-2\n  Pod        node-tailer-h9sfm\n  Pod UID    8b3d1c47-5f2a-4a11-9d6e-0c73a1f2b845\n  Container  containerd://a41c9e2b7f60\nAction: delete the Pod object. Window closes in 60s.' }
        ],
        prompt: 'The window is open and the harness is about to delete the Pod. What do you do right now?',
        options: [
          { label: 'Run the events command immediately and keep re-running it until the window closes',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'First pass, seconds after the delete',
                  text: `$ sh /opt/exam/02/commands.txt | tail -8` }
              ],
              teach: 'Capture is a live act. Events are not permanent: the default retention is one hour, and the interesting ones are seconds old. Run inside the window and keep running. You are not being graded on elegance, you are being graded on holding a sample of a moment.'
            } },
          { label: 'Delete the Pod yourself so you control the timing',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'What the grader records',
                  text: 'Scoring precondition: the harness before/after snapshot must show the replacement. A Pod deleted by you produces an identical event stream and an unusable snapshot.' }
              ],
              teach: 'Your job is capture, not the kill. The harness records the before and after identity itself; if you act, its pre-action snapshot no longer matches the Pod that died and the whole question scores zero. Events cannot tell the grader who issued the delete, so the grader relies on its own snapshot.'
            } },
          { label: 'Run kubectl -n kube-system get events --watch and leave it running',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What --watch gives you',
                  text: `$ kubectl -n kube-system get events --watch
LAST SEEN   TYPE     REASON             OBJECT                  MESSAGE
0s          Normal   Killing            pod/node-tailer-h9sfm   Stopping container node-tailer
0s          Normal   SuccessfulCreate   daemonset/node-tailer   Created pod: node-tailer-tz6cw
0s          Normal   Scheduled          pod/node-tailer-tz6cw   Successfully assigned kube-system/node-tailer-tz6cw to amber-worker-2` }
              ],
              teach: 'Watching is a fine way to see the moment, and it will not lose events the way a late poll does. But <code>--watch</code> ignores <code>--sort-by</code> and this invocation drops <code>-A</code>, so it is not the command you were told to write. Use it as an extra eye if you like. Capture with the graded command.'
            } },
          { label: 'Wait for the window to close, then run the command once',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Same command, run late',
                  text: `$ sh /opt/exam/02/commands.txt | tail -3
kube-system   61m   Normal   Started   pod/node-tailer-tz6cw   Container started
default       4m    Normal   Pulled    pod/tide-runner-5f4b9   Container image "busybox:1.36" already present on machine
default       4m    Normal   Started   pod/tide-runner-5f4b9   Container started` }
              ],
              teach: 'Events expire. The API server garbage-collects them roughly an hour after creation, and busy clusters churn faster. A late capture returns an empty file or the wrong window, and an empty file scores zero.'
            } }
        ]
      },

      /* 3 — read the window-1 output */
      {
        evidence: [
          { type: 'terminal', title: 'Capture window 1, tail of the sorted output',
            text: `$ sh /opt/exam/02/commands.txt | tail -9
NAMESPACE     LAST SEEN   TYPE     REASON             OBJECT                  MESSAGE
default       3m          Normal   Started            pod/tide-runner-5f4b9   Container started
kube-system   14s         Normal   Killing            pod/node-tailer-h9sfm   Stopping container node-tailer
kube-system   13s         Normal   SuccessfulCreate   daemonset/node-tailer   Created pod: node-tailer-tz6cw
kube-system   13s         Normal   Scheduled          pod/node-tailer-tz6cw   Successfully assigned kube-system/node-tailer-tz6cw to amber-worker-2
kube-system   11s         Normal   Pulled             pod/node-tailer-tz6cw   Container image "quay.io/prometheus/node-exporter:v1.8.2" already present on machine
kube-system   11s         Normal   Created            pod/node-tailer-tz6cw   Container created
kube-system   10s         Normal   Started            pod/node-tailer-tz6cw   Container started
default       2s          Normal   Pulled             pod/tide-runner-5f4b9   Container image "busybox:1.36" already present on machine` },
          { type: 'terminal', title: 'The node, a moment later',
            text: `$ kubectl -n kube-system get pods -l app=node-tailer -o wide
NAME                READY   STATUS    RESTARTS   AGE   IP           NODE             NOMINATED NODE   READINESS GATES
node-tailer-4wq7d   1/1     Running   0          16d   10.1.0.7     amber-master-1   <none>           <none>
node-tailer-pb2xk   1/1     Running   0          16d   10.1.1.12    amber-worker-1   <none>           <none>
node-tailer-tz6cw   1/1     Running   0          18s   10.1.2.23    amber-worker-2   <none>           <none>` }
        ],
        prompt: 'Which line in that output is the proof that a whole Pod object was replaced, rather than a container restarted?',
        options: [
          { label: 'SuccessfulCreate on daemonset/node-tailer, followed by Scheduled on a new Pod name',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The identity changed, not just the process',
                  text: `$ kubectl -n kube-system get pod node-tailer-tz6cw -o jsonpath='{.metadata.uid}{"\\n"}'
2f10a9c3-7de4-4b62-8a55-9c1e4b7d0e63

$ kubectl -n kube-system get pod node-tailer-h9sfm
Error from server (NotFound): pods "node-tailer-h9sfm" not found` }
              ],
              teach: 'Those two reasons are the signature of a new Pod object. <code>SuccessfulCreate</code> comes from the DaemonSet controller writing a new Pod to the API, with the message "Created pod: name". <code>Scheduled</code> comes from the scheduler binding that new Pod to a node. Neither can fire for a container restart, because a restart creates no Pod and needs no placement decision. Age 18s and RESTARTS 0 say the same thing: this Pod is new, and its container has never died.'
            } },
          { label: 'Killing on pod/node-tailer-h9sfm',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'Where Killing comes from',
                  text: 'kubelet, reason "Killing", message "Stopping container <name>". Emitted whenever the kubelet stops a container it owns: Pod deletion, image change, failed liveness probe, eviction.' }
              ],
              teach: '<code>Killing</code> only proves the kubelet stopped a container. It is a common line, not a discriminator, and it is attached to the old Pod, which the grader is not asking about. Look for what appeared, not for what went away.'
            } },
          { label: 'Pulled, Created and Started on pod/node-tailer-tz6cw',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'Peek ahead at window 2',
                  text: 'kube-system   8s   Normal   Pulled    pod/node-tailer-tz6cw   Container image "quay.io/prometheus/node-exporter:v1.8.2" already present on machine\nkube-system   8s   Normal   Created   pod/node-tailer-tz6cw   Container created\nkube-system   7s   Normal   Started   pod/node-tailer-tz6cw   Container started' }
              ],
              teach: 'Close, but these three are exactly the lines the second window will also produce. They describe the kubelet starting a container, which happens in both scenarios. A discriminator must appear in one case and not the other.'
            } },
          { label: 'The DaemonSet still shows 3 desired and 3 ready',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The DaemonSet, before and after',
                  text: `$ kubectl -n kube-system get ds node-tailer
NAME          DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
node-tailer   3         3         3       3            3           <none>          16d` }
              ],
              teach: 'This is worth checking, because the scoring precondition requires one Pod per node after both actions. It is not evidence of a replacement though. The DaemonSet reported 3/3 before the delete too. Steady state tells you the loop converged; it never tells you what moved.'
            } }
        ]
      },

      /* 4 — what actually goes in the file */
      {
        evidence: [
          { type: 'note', title: 'Grading line for events_pod.log',
            text: 'At least one event whose involvedObject UID is the replacement Pod UID and whose observed time falls inside the first capture window — and no event that fails either filter. An empty file scores 0.' },
          { type: 'note', title: 'Replacement Pod identity',
            text: 'node-tailer-tz6cw   UID 2f10a9c3-7de4-4b62-8a55-9c1e4b7d0e63' }
        ],
        prompt: 'You have the window-1 output on screen. What do you write into events_pod.log?',
        options: [
          { label: 'Re-run the command narrowed to the replacement Pod UID and redirect that into the file',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Narrow, then write',
                  text: `$ kubectl get events -A --sort-by=.metadata.creationTimestamp \\
    --field-selector involvedObject.uid=2f10a9c3-7de4-4b62-8a55-9c1e4b7d0e63 \\
    > /opt/exam/02/events_pod.log

$ cat /opt/exam/02/events_pod.log
NAMESPACE     LAST SEEN   TYPE     REASON      OBJECT                  MESSAGE
kube-system   21s         Normal   Scheduled   pod/node-tailer-tz6cw   Successfully assigned kube-system/node-tailer-tz6cw to amber-worker-2
kube-system   19s         Normal   Pulled      pod/node-tailer-tz6cw   Container image "quay.io/prometheus/node-exporter:v1.8.2" already present on machine
kube-system   19s         Normal   Created     pod/node-tailer-tz6cw   Container created
kube-system   18s         Normal   Started     pod/node-tailer-tz6cw   Container started` }
              ],
              teach: 'Read the grading line twice. It wants at least one matching event <em>and no event that fails the filter</em>, so the file is a filtered sample, not a screenshot. Event supports <code>involvedObject.uid</code> as a field selector, which is the exact filter the grader applies. Note what this costs you: <code>SuccessfulCreate</code> is recorded against the DaemonSet, not the Pod, so it cannot live in this file. You keep it in your head as the proof, and you put the Pod-owned events in the file.'
            } },
          { label: 'Redirect the whole window-1 output into the file — every one of those events is inside the window',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What that file contains',
                  text: `$ cat /opt/exam/02/events_pod.log
NAMESPACE     LAST SEEN   TYPE     REASON             OBJECT                  MESSAGE
default       3m          Normal   Started            pod/tide-runner-5f4b9   Container started      <-- wrong UID
kube-system   14s         Normal   Killing            pod/node-tailer-h9sfm   Stopping container node-tailer   <-- old Pod UID
kube-system   13s         Normal   SuccessfulCreate   daemonset/node-tailer   Created pod: node-tailer-tz6cw   <-- DaemonSet UID
kube-system   13s         Normal   Scheduled          pod/node-tailer-tz6cw   ...` }
              ],
              teach: 'Three of those rows fail the UID filter: an unrelated Pod in default, the deleted Pod, and the DaemonSet itself. The grader rejects any event that fails either filter, so a correct capture with extra rows scores the same as an empty file. <code>-A</code> is the right flag for finding events and the wrong scope for storing them.'
            } },
          { label: 'Write just the SuccessfulCreate line, since that is the event the Pod replacement generated',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Who owns that event',
                  text: `$ kubectl -n kube-system get events \\
    --field-selector reason=SuccessfulCreate \\
    -o custom-columns=REASON:.reason,KIND:.involvedObject.kind,NAME:.involvedObject.name,UID:.involvedObject.uid
REASON             KIND        NAME          UID
SuccessfulCreate   DaemonSet   node-tailer   c04e7b19-2a63-4f8d-b1c7-55e0d3a96f42` }
              ],
              teach: 'A controller records its events against the object it manages, not the object it made. <code>SuccessfulCreate</code> belongs to the DaemonSet, so its involvedObject UID is the DaemonSet UID. It is the best evidence for you and the wrong content for this file.'
            } },
          { label: 'Pipe the output through grep node-tailer-tz6cw',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What grep catches',
                  text: `$ sh /opt/exam/02/commands.txt | grep node-tailer-tz6cw
kube-system   13s   Normal   SuccessfulCreate   daemonset/node-tailer   Created pod: node-tailer-tz6cw
kube-system   13s   Normal   Scheduled          pod/node-tailer-tz6cw   Successfully assigned kube-system/node-tailer-tz6cw to amber-worker-2
kube-system   11s   Normal   Pulled             pod/node-tailer-tz6cw   ...` }
              ],
              teach: 'Nearly. But grep matches text anywhere on the line, and the SuccessfulCreate message ends with the new Pod name, so the DaemonSet row comes along and fails the UID filter. Filter on identity, not on spelling. The API can do it for you with <code>--field-selector involvedObject.uid=</code>.'
            } }
        ]
      },

      /* 5 — window two opens */
      {
        evidence: [
          { type: 'note', title: 'Harness signal: capture window 2 is OPEN',
            text: 'Pre-action snapshot on amber-worker-2\n  Pod        node-tailer-tz6cw\n  Pod UID    2f10a9c3-7de4-4b62-8a55-9c1e4b7d0e63\n  Container  containerd://d7f30b1856c4\nAction: stop and remove that container on the node. The Pod object is not touched.' }
        ],
        prompt: 'Second window. Which capture command do you run for events_container.log?',
        options: [
          { label: 'The same command, still filtered on 2f10a9c3-7de4-4b62-8a55-9c1e4b7d0e63',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The Pod object never moved',
                  text: `$ kubectl -n kube-system get pods -l app=node-tailer -o wide
NAME                READY   STATUS    RESTARTS      AGE   IP          NODE             NOMINATED NODE   READINESS GATES
node-tailer-4wq7d   1/1     Running   0             16d   10.1.0.7    amber-master-1   <none>           <none>
node-tailer-pb2xk   1/1     Running   0             16d   10.1.1.12   amber-worker-1   <none>           <none>
node-tailer-tz6cw   1/1     Running   1 (12s ago)   9m    10.1.2.23   amber-worker-2   <none>           <none>` }
              ],
              teach: 'This is the point of the whole question. The Pod UID is unchanged, so the filter is unchanged. What separates the two logs is the window, not a new identity. The only column that moved is RESTARTS, from 0 to 1, on a Pod that is still nine minutes old.'
            } },
          { label: 'Look up the new Pod UID first, then filter on it',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'There is no new Pod',
                  text: `$ kubectl -n kube-system get pod -l app=node-tailer --field-selector spec.nodeName=amber-worker-2 \\
    -o custom-columns=NAME:.metadata.name,UID:.metadata.uid,AGE:.metadata.creationTimestamp
NAME                UID                                    AGE
node-tailer-tz6cw   2f10a9c3-7de4-4b62-8a55-9c1e4b7d0e63   2026-08-16T09:02:41Z` }
              ],
              teach: 'Removing a container does not touch the Pod object. The Pod is the API record of intent; the container is one realization of it. The kubelet notices the container is gone and makes a new one under the same Pod, so name, UID and creationTimestamp all survive. Only the container ID and the restart count change.'
            } },
          { label: 'Filter on the new container ID instead',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The field selectors Event actually supports',
                  text: `$ kubectl get events -A --field-selector involvedObject.containerID=d7f30b1856c4
Error from server (BadRequest): "involvedObject.containerID" is not a known field selector: only "involvedObject.kind", "involvedObject.namespace", "involvedObject.name", "involvedObject.uid", "involvedObject.apiVersion", "involvedObject.resourceVersion", "involvedObject.fieldPath", "reason", "reportingComponent", "source", "type", "metadata.name", "metadata.namespace"` }
              ],
              teach: 'An Event points at an API object, never at a container ID. Container-level events hang off the Pod and record the container in <code>involvedObject.fieldPath</code>, as <code>spec.containers{node-tailer}</code>. The container ID lives on the node and in the Pod status, not in the event index.'
            } },
          { label: 'Append this window to events_pod.log so both stories stay in one place',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'What the grader would find',
                  text: 'events_pod.log: contains events from windows 1 and 2 — rows fail the window filter → 0 points.\nevents_container.log: empty → 0 points.' }
              ],
              teach: 'Each log gets only its own window. The two files exist precisely so the two signatures stay separated. Merging them destroys the comparison the question is testing and costs both pairs of points.'
            } }
        ]
      },

      /* 6 — read the window-2 output */
      {
        evidence: [
          { type: 'terminal', title: 'Capture window 2, written to events_container.log',
            text: `$ kubectl get events -A --sort-by=.metadata.creationTimestamp \\
    --field-selector involvedObject.uid=2f10a9c3-7de4-4b62-8a55-9c1e4b7d0e63 \\
    > /opt/exam/02/events_container.log

$ cat /opt/exam/02/events_container.log
NAMESPACE     LAST SEEN   TYPE     REASON      OBJECT                  MESSAGE
kube-system   9m          Normal   Scheduled   pod/node-tailer-tz6cw   Successfully assigned kube-system/node-tailer-tz6cw to amber-worker-2
kube-system   9m          Normal   Pulled      pod/node-tailer-tz6cw   Container image "quay.io/prometheus/node-exporter:v1.8.2" already present on machine
kube-system   9m          Normal   Created     pod/node-tailer-tz6cw   Container created
kube-system   9m          Normal   Started     pod/node-tailer-tz6cw   Container started
kube-system   11s         Normal   Pulled      pod/node-tailer-tz6cw   Container image "quay.io/prometheus/node-exporter:v1.8.2" already present on machine
kube-system   11s         Normal   Created     pod/node-tailer-tz6cw   Container created
kube-system   10s         Normal   Started     pod/node-tailer-tz6cw   Container started` },
          { type: 'note', title: 'Grading line for events_container.log',
            text: 'At least one event whose involvedObject UID is the replacement Pod UID and whose observed time falls inside the SECOND capture window — and no event that fails either filter.' }
        ],
        prompt: 'The UID filter is right, but four of those rows are nine minutes old. What do you do?',
        options: [
          { label: 'Keep only the rows created inside window 2 — the second Pulled, Created and Started',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The two windows side by side',
                  text: `window 1  Killing            pod/node-tailer-h9sfm    (old Pod UID 8b3d1c47…)
window 1  SuccessfulCreate   daemonset/node-tailer    Created pod: node-tailer-tz6cw
window 1  Scheduled          pod/node-tailer-tz6cw    assigned to amber-worker-2
window 1  Pulled Created Started   pod/node-tailer-tz6cw   (new UID 2f10a9c3…)

window 2  Pulled Created Started   pod/node-tailer-tz6cw   (same UID 2f10a9c3…)
window 2  no Killing.  no SuccessfulCreate.  no Scheduled.` },
                { type: 'file', title: '/opt/exam/02/events_container.log',
                  text: `NAMESPACE     LAST SEEN   TYPE     REASON    OBJECT                  MESSAGE
kube-system   11s         Normal   Pulled    pod/node-tailer-tz6cw   Container image "quay.io/prometheus/node-exporter:v1.8.2" already present on machine
kube-system   11s         Normal   Created   pod/node-tailer-tz6cw   Container created
kube-system   10s         Normal   Started   pod/node-tailer-tz6cw   Container started` }
              ],
              teach: 'Now the two files say different things. Window 2 has no <code>SuccessfulCreate</code>, because no controller wrote a Pod. It has no <code>Scheduled</code>, because nothing needed placing. It has no <code>Killing</code>, because the kubelet never decided to stop anything — the container vanished under it. All that is left is the kubelet rebuilding a container inside a Pod that never changed.'
            } },
          { label: 'Leave them — the UID filter is what the grader checks',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'The grading line, read literally',
                  text: '"…whose observed time falls inside the second capture window, and no event that fails either filter."' }
              ],
              teach: 'Two filters, not one: identity and time. Four of those rows are the window-1 story and fail the time filter, so the file is rejected. It is the same trap as before with the axes swapped — last time extra objects, this time extra minutes.'
            } },
          { label: 'Wait for a BackOff event to appear, then capture',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Waiting for something that is not coming',
                  text: `$ kubectl -n kube-system get events --field-selector reason=BackOff
No resources found in kube-system namespace.

$ kubectl -n kube-system get pod node-tailer-tz6cw
NAME                READY   STATUS    RESTARTS      AGE
node-tailer-tz6cw   1/1     Running   1 (48s ago)   10m` }
              ],
              teach: '<code>BackOff</code>, message "Back-off restarting failed container", only fires when the kubelet has already restarted a container recently and starts throttling. One removal means one restart, and the first restart is immediate. The container came back Running, so no backoff timer ever opened. Waiting for it costs you the window.'
            } },
          { label: 'Add --field-selector reason!=Scheduled to drop the stale rows',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What that leaves behind',
                  text: `$ kubectl get events -A --sort-by=.metadata.creationTimestamp \\
    --field-selector involvedObject.uid=2f10a9c3-7de4-4b62-8a55-9c1e4b7d0e63,reason!=Scheduled
NAMESPACE     LAST SEEN   TYPE     REASON    OBJECT                  MESSAGE
kube-system   9m          Normal   Pulled    pod/node-tailer-tz6cw   ...
kube-system   9m          Normal   Created   pod/node-tailer-tz6cw   Container created
kube-system   9m          Normal   Started   pod/node-tailer-tz6cw   Container started
kube-system   11s         Normal   Pulled    pod/node-tailer-tz6cw   ...` }
              ],
              teach: 'You dropped one row and kept three stale ones, because Pulled, Created and Started appear in both windows. That is exactly the finding: reason alone cannot separate the two captures on this Pod. Time is the only discriminator left, so cut on time.'
            } }
        ]
      }

    ],
    closing: 'One sentence holds the whole question: a Pod is an API object, a container is one attempt to realize it. Delete the Pod and you get a second object — the DaemonSet controller records SuccessfulCreate against itself, the scheduler records Scheduled against the new Pod, and the new Pod carries a new name and a new UID. Remove only the container and the object is untouched, so no controller and no scheduler ever wake up; the kubelet simply notices the gap and emits Pulled, Created and Started against the same UID, with the restart count moving from 0 to 1. Killing tells you a kubelet stopped a container and nothing more, which is why it appears in the first window and not the second. Both logs are graded on two filters, identity and time, so capture live and narrow with --field-selector involvedObject.uid before you redirect. See "DaemonSet" at kubernetes.io/docs/concepts/workloads/controllers/daemonset/ and the Event API reference at kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/.'
  },

  /* ------------------------------------------------------------------ */
  /* exam-docs-u15-u27-q07 — Pod Security Admission enforce.
     Mechanism: enforce applies to Pods, not to workload resources.       */
  /* ------------------------------------------------------------------ */

  "exam-docs-u15-u27-q07": {
    steps: [

      /* 1 — triage a Deployment with no Pods */
      {
        evidence: [
          { type: 'terminal', title: 'The reported symptom',
            text: `$ kubectl -n guarded get deploy app
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
app    0/1     1            0           7m

$ kubectl -n guarded get rs
NAME             DESIRED   CURRENT   READY   AGE
app-6b7f9c4d8    1         0         0       7m

$ kubectl -n guarded get pods
No resources found in guarded namespace.` },
          { type: 'terminal', title: 'The namespace',
            text: `$ kubectl get ns guarded --show-labels
NAME      STATUS   AGE   LABELS
guarded   Active   21d   kubernetes.io/metadata.name=guarded,pod-security.kubernetes.io/enforce=baseline,pod-security.kubernetes.io/warn=restricted` }
        ],
        prompt: 'DESIRED 1, CURRENT 0, and no Pod at all. Where do you look next?',
        options: [
          { label: 'kubectl -n guarded describe rs app-6b7f9c4d8',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Something is refusing the create',
                  text: `$ kubectl -n guarded describe rs app-6b7f9c4d8 | tail -6
Events:
  Type     Reason        Age                    From                   Message
  ----     ------        ----                   ----                   -------
  Warning  FailedCreate  7m (x18 over 7m)       replicaset-controller  (combined from similar events): Error creating: pods "app-6b7f9c4d8-x2k4m" is forbidden: violates PodSecurity "baseline:latest": privileged (container "nginx" must not set securityContext.privileged=true)` }
              ],
              teach: 'CURRENT 0 means the ReplicaSet controller tried and failed to write a Pod. When an object does not exist, question the controller that should have created it. The controller records its failures against itself, so the ReplicaSet is where the answer lives.'
            } },
          { label: 'kubectl -n guarded describe pod -l app=app',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Nothing to describe',
                  text: `$ kubectl -n guarded describe pod -l app=app
No resources found in guarded namespace.` }
              ],
              teach: 'This is the reflex, and here it is a dead end. Enforce mode rejects the create request itself, so no Pod object is ever persisted. There is nothing to describe, nothing to log, nothing to exec into. Absence of a Pod is itself the clue: go up one level to whoever asked for it.'
            } },
          { label: 'kubectl get nodes and check for taints or pressure',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The nodes are fine',
                  text: `$ kubectl get nodes
NAME             STATUS   ROLES           AGE   VERSION
shoal-cp-1       Ready    control-plane   21d   v1.36.0
shoal-worker-1   Ready    <none>          21d   v1.36.0
shoal-worker-2   Ready    <none>          21d   v1.36.0` }
              ],
              teach: 'Node problems produce a Pending Pod with a FailedScheduling event. You have no Pod at all, which places the failure earlier than scheduling — at admission, before the object was ever stored. Let the stage of the failure tell you where to look.'
            } },
          { label: 'kubectl -n guarded logs deploy/app',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'No container ever ran',
                  text: `$ kubectl -n guarded logs deploy/app
error: no matching resources found` }
              ],
              teach: 'Logs come from containers, containers come from Pods, and there is no Pod. Reach for logs when something ran and misbehaved. When nothing ran, reach for events.'
            } }
        ]
      },

      /* 2 — read the message */
      {
        evidence: [
          { type: 'terminal', title: 'The FailedCreate message, unwrapped',
            text: `Error creating: pods "app-6b7f9c4d8-x2k4m" is forbidden:
  violates PodSecurity "baseline:latest":
    privileged (container "nginx" must not set securityContext.privileged=true)` },
          { type: 'note', title: 'How to read it',
            text: 'violates PodSecurity "<level>:<version>"  →  which policy judged it\n<reason> (<detail>)                      →  which check failed, and the exact field to change' }
        ],
        prompt: 'The message names the policy and the field. What is it telling you to change?',
        options: [
          { label: 'The pod template in Deployment app — a container sets securityContext.privileged=true',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Confirm it in the template',
                  text: `$ kubectl -n guarded get deploy app -o yaml | sed -n '/containers:/,/volumeMounts/p'
      containers:
      - command: ["/bin/sh","-c"]
        args: ["nginx -g 'daemon off;'"]
        image: nginx:1.27-alpine
        name: nginx
        securityContext:
          privileged: true` }
              ],
              teach: 'The detail string is a field path, not prose. It names the container, "nginx", and the exact key, <code>securityContext.privileged</code>. Every PodSecurity denial is written this way, so you never have to guess which of the baseline checks tripped. Read the parentheses and go straight to that field in the template.'
            } },
          { label: 'The namespace enforce level — relabel guarded to privileged',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'It would work, and it would score zero',
                  text: `$ kubectl label ns guarded pod-security.kubernetes.io/enforce=privileged --overwrite
namespace/guarded labeled

$ kubectl -n guarded get deploy app
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
app    1/1     1            1           9m` },
                { type: 'note', title: 'Grading line',
                  text: 'Namespace labels match the snapshot. Setting the namespace to privileged or deleting the enforce label fails the last pair.' }
              ],
              teach: 'This is the trap, and it is dangerous because the Deployment really does go Available. The task said do not weaken the enforcement. Admission caught a genuine violation; deleting the smoke detector is not a fix. Change the workload, never the policy.'
            } },
          { label: 'The warn: restricted label — that is what is blocking the Pod',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'The three modes',
                  text: 'enforce  Policy violations will cause the pod to be rejected.\naudit    Policy violations add an annotation to the audit log entry, but are otherwise allowed.\nwarn     Policy violations trigger a user-facing warning, but are otherwise allowed.' }
              ],
              teach: 'Read the quoted policy in the message: it says <code>baseline:latest</code>, which is the enforce level, not restricted. Only enforce rejects. warn and audit are observability, and they never stop a create. This namespace happens to run both, so you will see restricted warnings later — they are noise for this task.'
            } },
          { label: 'Add a PodSecurityPolicy exemption for this Deployment',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The API is gone',
                  text: `$ kubectl get psp
error: the server doesn't have a resource type "psp"` }
              ],
              teach: 'PodSecurityPolicy was removed in v1.25. Its replacement is Pod Security Admission, which is built into the API server and configured entirely by namespace labels. Exemptions do exist, but they are cluster-level admission configuration for usernames, runtime classes and namespaces — not something you attach to a Deployment.'
            } }
        ]
      },

      /* 3 — why the Deployment applied at all */
      {
        evidence: [
          { type: 'terminal', title: 'The Deployment itself was never rejected',
            text: `$ kubectl -n guarded get deploy app -o jsonpath='{.metadata.creationTimestamp}{"  uid="}{.metadata.uid}{"\\n"}'
2026-08-16T08:41:02Z  uid=6d2b4a91-3c7e-4f05-9a18-b8e2c1d47a30

$ kubectl -n guarded get deploy app -o jsonpath='{.status.conditions[*].reason}{"\\n"}'
MinimumReplicasUnavailable FailedCreate` },
          { type: 'note', title: 'Pod Security Admission, upstream wording',
            text: 'To help catch violations early, both the audit and warning modes are applied to the workload resources. However, enforce mode is not applied to workload resources, only to the resulting pod objects.' }
        ],
        prompt: 'The Deployment was accepted with a privileged template. Why does that matter to how you fix it?',
        options: [
          { label: 'Because enforce judges Pods, the violation is in the template — and the fix must land there, then be re-rolled',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The template is the Pod that will be judged',
                  text: `$ kubectl -n guarded get deploy app -o jsonpath='{.spec.template.spec.containers[0].securityContext}{"\\n"}'
{"privileged":true}` }
              ],
              teach: 'The Deployment and the ReplicaSet are just intent; nothing checks them against enforce. The check runs when the ReplicaSet controller POSTs a Pod, so the offending field is whatever the template will stamp onto that Pod. Fix the template, and the next Pod create passes on its own. There is nothing to retry by hand.'
            } },
          { label: 'Because the Deployment was accepted, the template must be fine and the problem is in the ReplicaSet',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The ReplicaSet is a faithful copy',
                  text: `$ kubectl -n guarded get rs app-6b7f9c4d8 -o jsonpath='{.spec.template.spec.containers[0].securityContext}{"\\n"}'
{"privileged":true}` }
              ],
              teach: 'Acceptance is not approval here. Enforce simply does not look at Deployments or ReplicaSets, so a bad template sails in. The ReplicaSet carries the same template because the Deployment controller copied it. Editing the ReplicaSet would be overwritten on the next Deployment sync anyway.'
            } },
          { label: 'Because you should delete the Deployment and recreate it with a clean template',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'Grading line',
                  text: 'Do not delete Deployment app. Checkable: uid matches the snapshot. Deployment guarded/app has the snapshot uid 6d2b4a91-3c7e-4f05-9a18-b8e2c1d47a30.' }
              ],
              teach: 'A delete and recreate produces a new uid and fails the first pair, even if the running result looks perfect. It also would not teach you anything, because the same admission check would meet the same template. Edit in place.'
            } },
          { label: 'Because warn: restricted must have mutated the template on apply',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'What warn does',
                  text: 'warn is a validating check, not a mutating one. It returns a Warning: header to the client and changes nothing in the stored object.' }
              ],
              teach: 'Pod Security Admission never mutates. It only allows, warns, annotates, or forbids. Whatever is in the template got there from the manifest that created it.'
            } }
        ]
      },

      /* 4 — make the edit */
      {
        evidence: [
          { type: 'file', title: 'The template as stored, trimmed',
            text: `spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: nginx
        image: nginx:1.27-alpine
        command: ["/bin/sh","-c"]
        args: ["nginx -g 'daemon off;'"]
        securityContext:
          privileged: true` },
          { type: 'note', title: 'Grading lines you must not break',
            text: 'Image stays nginx:1.27-alpine. spec.replicas stays 1. Every container command and args equals the snapshot exactly. Namespace labels match the snapshot.' }
        ],
        prompt: 'Which edit do you make?',
        options: [
          { label: 'Drop securityContext.privileged from the container and change nothing else',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The one-field patch',
                  text: `$ kubectl -n guarded patch deploy app --type=json \\
    -p='[{"op":"remove","path":"/spec/template/spec/containers/0/securityContext/privileged"}]'
Warning: would violate PodSecurity "restricted:latest": allowPrivilegeEscalation != false (container "nginx" must set securityContext.allowPrivilegeEscalation=false), unrestricted capabilities (container "nginx" must set securityContext.capabilities.drop=["ALL"]), runAsNonRoot != true (pod or container "nginx" must set securityContext.runAsNonRoot=true), seccompProfile (pod or container "nginx" must set securityContext.seccompProfile.type to "RuntimeDefault" or "Localhost")
deployment.apps/app patched` }
              ],
              teach: 'Baseline forbids exactly one thing here, so remove exactly one thing. Setting <code>privileged: false</code> passes too — the check only trips on true. Notice the Warning line that came back: that is warn mode judging the template against restricted, which the task never asked you to satisfy. The last line, "deployment.apps/app patched", is the one that matters.'
            } },
          { label: 'Remove privileged and add runAsNonRoot, allowPrivilegeEscalation: false, capabilities.drop: ["ALL"] and a seccompProfile',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The warning goes away. So does the Pod.',
                  text: `$ kubectl -n guarded get pods
NAME                     READY   STATUS             RESTARTS      AGE
app-7c4d6f9b2-nq8vt      0/1     CrashLoopBackOff   3 (24s ago)   84s

$ kubectl -n guarded logs app-7c4d6f9b2-nq8vt
2026/08/16 09:12:44 [emerg] 1#1: mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)` }
              ],
              teach: 'You silenced a warning you were never graded on and broke the container. nginx:1.27-alpine wants to write its cache directories as root. Chasing restricted here is scope you invented. Fix what enforce actually rejects; leave warn to warn.'
            } },
          { label: 'Remove privileged and also change command to ["nginx","-g","daemon off;"] while you are in there',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'Grading line',
                  text: 'Every container command and args equals the snapshot exactly. Changing a container command or args to sidestep the check fails the template pair.' }
              ],
              teach: 'The command is snapshotted precisely so you cannot rewrite the workload out of the problem. Tidying an unrelated field costs two points. In an exam, touch only what the task named.'
            } },
          { label: 'Add pod-security.kubernetes.io/enforce-version: v1.24 to the namespace so the older baseline applies',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The check is as old as the policy',
                  text: `CheckPrivileged() → Level: baseline, MinimumVersion: 1.0` },
                { type: 'note', title: 'Grading line',
                  text: 'Do not change guarded labels. Checkable: labels match the snapshot.' }
              ],
              teach: 'Two failures at once. Pinning a version edits the namespace labels, which the task forbids. And it would not help: the privileged check has been part of baseline since v1.0, so no pinnable version exempts it. Version pinning is for surviving a policy that gets stricter later, not for escaping today.'
            } }
        ]
      },

      /* 5 — verify the run */
      {
        evidence: [
          { type: 'terminal', title: 'A minute after the patch',
            text: `$ kubectl -n guarded get deploy,rs,pods
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/app   1/1     1            1           11m

NAME                            DESIRED   CURRENT   READY   AGE
replicaset.apps/app-6b7f9c4d8   0         0         0       11m
replicaset.apps/app-5f8c2d746   1         1         1       48s

NAME                        READY   STATUS    RESTARTS   AGE
pod/app-5f8c2d746-w7k9r     1/1     Running   0          48s` },
          { type: 'terminal', title: 'The events for the new ReplicaSet',
            text: `$ kubectl -n guarded get events --sort-by=.metadata.creationTimestamp | tail -5
48s   Normal   SuccessfulCreate   replicaset/app-5f8c2d746   Created pod: app-5f8c2d746-w7k9r
48s   Normal   Scheduled          pod/app-5f8c2d746-w7k9r    Successfully assigned guarded/app-5f8c2d746-w7k9r to shoal-worker-2
46s   Normal   Pulled             pod/app-5f8c2d746-w7k9r    Container image "nginx:1.27-alpine" already present on machine
46s   Normal   Created            pod/app-5f8c2d746-w7k9r    Container created
45s   Normal   Started            pod/app-5f8c2d746-w7k9r    Container started` }
        ],
        prompt: 'It is Available. Before you move on, what do you check?',
        options: [
          { label: 'That the namespace labels, the uid, the image, replicas and the container command all still match the snapshot',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The four-point sweep',
                  text: `$ kubectl get ns guarded -o jsonpath='{.metadata.labels}{"\\n"}'
{"kubernetes.io/metadata.name":"guarded","pod-security.kubernetes.io/enforce":"baseline","pod-security.kubernetes.io/warn":"restricted"}

$ kubectl -n guarded get deploy app \\
    -o custom-columns=UID:.metadata.uid,REPL:.spec.replicas,IMAGE:.spec.template.spec.containers[0].image,CMD:.spec.template.spec.containers[0].command
UID                                    REPL   IMAGE               CMD
6d2b4a91-3c7e-4f05-9a18-b8e2c1d47a30   1      nginx:1.27-alpine   [/bin/sh -c]

$ kubectl -n guarded get deploy app -o jsonpath='{.spec.template.spec.containers[0].securityContext}{"\\n"}'

` }
              ],
              teach: 'Four of the six points are for what you did not change. The empty last line is the point: no securityContext at all, so nothing sets privileged. Read the constraints back as a checklist and confirm each one from the live object, not from memory of what you typed.'
            } },
          { label: 'Delete the old ReplicaSet app-6b7f9c4d8 to clean up',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What you lose',
                  text: `$ kubectl -n guarded delete rs app-6b7f9c4d8
replicaset.apps "app-6b7f9c4d8" deleted

$ kubectl -n guarded rollout undo deploy/app
error: no rollout history found for deployment "app"` }
              ],
              teach: 'The zero-replica ReplicaSet is the rollback history, kept on purpose by revisionHistoryLimit. Deleting it is not graded but it throws away your undo. Cleanup that removes information is not cleanup.'
            } },
          { label: 'Nothing else — READY 1/1 is the whole task',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'How the points split',
                  text: '2 pts  uid, image, replicas, 1 ready and available\n2 pts  no privileged in the template, and command/args unchanged\n2 pts  namespace labels match the snapshot' }
              ],
              teach: 'Ready is two of six points. This question is built so that the wrong fix also goes Ready, which is exactly why the other four points check what you left alone. A green line is never the whole grade.'
            } },
          { label: 'Restart the Deployment to be sure the new template took',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'A second, identical rollout',
                  text: `$ kubectl -n guarded rollout restart deploy/app
deployment.apps/app restarted

$ kubectl -n guarded get rs
NAME             DESIRED   CURRENT   READY   AGE
app-6b7f9c4d8    0         0         0       12m
app-5f8c2d746    0         0         0       2m
app-9d3e7b154    1         1         1       15s` }
              ],
              teach: 'Harmless, and unnecessary. The new ReplicaSet with a running Pod already proves the template rolled: <code>app-5f8c2d746</code> exists because the template hash changed. A restart only adds another revision and more objects to read.'
            } }
        ]
      }

    ],
    closing: 'Pod Security Admission runs inside the API server and judges Pods, not the things that make Pods. That single fact explains everything you saw: the Deployment with a privileged template was accepted, the ReplicaSet was accepted, and the rejection only landed when the ReplicaSet controller POSTed the actual Pod — which is why there was no Pod to describe and why the evidence lived in a FailedCreate event on the ReplicaSet. The message is a field path in disguise, naming the policy level, the failing check, the container and the exact key, so it tells you to edit the template and nothing else. enforce rejects; warn and audit only report, which is why a restricted warning printed on your patch and cost you nothing. The tempting fix, relabelling the namespace, makes the Deployment Available and fails the question, because the grade is mostly for what you left alone. See "Pod Security Admission" at kubernetes.io/docs/concepts/security/pod-security-admission/ and the level definitions at kubernetes.io/docs/concepts/security/pod-security-standards/.'
  },

  /* ------------------------------------------------------------------ */
  /* exam-docs-u1-u14-q01 — CronJob concurrency.
     Mechanism: a ten-minute Job on a five-minute schedule overlaps unless
     concurrencyPolicy says otherwise, and Forbid skips while Replace kills. */
  /* ------------------------------------------------------------------ */

  "exam-docs-u1-u14-q01": {
    steps: [

      /* 1 — pick the object */
      {
        evidence: [
          { type: 'terminal', title: 'The namespace is empty',
            text: `$ kubectl config current-context
shoal

$ kubectl -n batch get cronjobs,jobs
No resources found in batch namespace.` },
          { type: 'note', title: 'The task, in numbers',
            text: 'Run sleep 600 every 5 minutes. A run lasts 10 minutes. The schedule fires every 5.\nSo every run overlaps the next two ticks. Skip them. Do not cancel the run in progress.' }
        ],
        prompt: 'Ten minutes of work arriving every five. Which object do you reach for?',
        options: [
          { label: 'A CronJob, and the overlap is settled by a field on it',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The field exists and is spelled out',
                  text: `$ kubectl explain cronjob.spec.concurrencyPolicy
KIND:       CronJob
VERSION:    batch/v1
FIELD: concurrencyPolicy <string>
DESCRIPTION:
    Specifies how to treat concurrent executions of a Job. Valid values are:
    - "Allow" (default): allows CronJobs to run concurrently;
    - "Forbid": forbids concurrent runs, skipping next run if previous run
      hasn't finished yet;
    - "Replace": cancels currently running job and replaces it with a new one` }
              ],
              teach: 'Overlap is a scheduling concern, and only the CronJob schedules. The whole question lives in one field. Reach for <code>kubectl explain</code> before the browser: it gives you the field path, the valid values and the default in one line.'
            } },
          { label: 'A Job with parallelism: 1 — one at a time is exactly what is being asked',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'A Job has nowhere to put a schedule',
                  text: `$ kubectl explain job.spec.schedule
error: field "schedule" does not exist

$ kubectl explain job.spec.parallelism
FIELD: parallelism <integer>
DESCRIPTION:
    Specifies the maximum desired number of pods the job should run at any
    given time.` }
              ],
              teach: 'Right instinct, wrong layer. <code>parallelism</code> caps Pods inside one Job. It has no opinion about a second Job starting five minutes later, and a Job has no schedule at all — it runs once, when created. Concurrency between runs belongs to the object that creates runs.'
            } },
          { label: 'A CronJob, and wrap the command in a lock file so the second run exits early',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What the grader reads',
                  text: `$ kubectl -n batch get cronjob ledger-roll -o jsonpath='{.spec.concurrencyPolicy}{"\\n"}'
Allow` },
                { type: 'note', title: 'Grading line',
                  text: 'The container runs sleep 600. Accept command ["sleep","600"], or ["sleep"] with args ["600"], or sh -c whose executed command is sleep 600. .spec.concurrencyPolicy is Forbid.' }
              ],
              teach: 'You would be re-implementing in a shell script what the API already does, and you would fail twice: the command no longer runs sleep 600, and the policy is still the default. The controller decides whether to create a Job at all; a lock inside the container runs after the Job already exists.'
            } },
          { label: 'A Deployment with one replica that sleeps and loops',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'A Deployment never finishes',
                  text: `$ kubectl -n batch get deploy,pods
NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/roll   1/1     1            1           11m

NAME                        READY   STATUS      RESTARTS   AGE
pod/roll-7c9b8d564-5tqxz    0/1     Completed   4          11m` }
              ],
              teach: 'A Deployment is for a process that should always be up. Its restartPolicy is Always, so a Pod that exits is restarted immediately — you get a busy loop, not a schedule, and no run boundaries at all. Batch work needs Job semantics: run to completion, then stop.'
            } }
        ]
      },

      /* 2 — the manifest */
      {
        evidence: [
          { type: 'file', title: '/opt/course/01/ledger-roll.yaml — your draft',
            text: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: ledger-roll
  namespace: batch
spec:
  schedule: "*/5 * * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: roll
            image: busybox:1.36
            command: ["sleep", "600"]` }
        ],
        prompt: 'You copied a manifest from the docs and filled it in. Apply it?',
        options: [
          { label: 'No — fix the schedule to five fields and add concurrencyPolicy: Forbid first',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Applied clean',
                  text: `$ kubectl apply -f /opt/course/01/ledger-roll.yaml
cronjob.batch/ledger-roll created

$ kubectl -n batch get cronjob
NAME          SCHEDULE      TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
ledger-roll   */5 * * * *   <none>     False     0        <none>          4s` },
                { type: 'file', title: 'The two corrected lines',
                  text: `spec:
  schedule: "*/5 * * * *"
  concurrencyPolicy: Forbid` }
              ],
              teach: 'Kubernetes cron is the five-field standard: minute, hour, day of month, month, day of week. There is no seconds field. Fix both problems before the first apply, because a CronJob that ticks before you patch it will already have started an overlapping run you then have to clean up.'
            } },
          { label: 'Yes — apply it, then patch concurrencyPolicy afterwards',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The API refuses it',
                  text: `$ kubectl apply -f /opt/course/01/ledger-roll.yaml
The CronJob "ledger-roll" is invalid: spec.schedule: Invalid value: "*/5 * * * * *": expected exactly 5 fields, found 6: [*/5 * * * * *]` }
              ],
              teach: 'Nothing was created, so there is nothing to patch. Kubernetes validates the cron string at admission using the standard five-field parser. Six fields is the seconds-enabled dialect some other schedulers accept; it is rejected here, and the error tells you exactly how many fields it wanted.'
            } },
          { label: 'Yes — the default concurrency is fine, since each run finishes before the next tick',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'Do the arithmetic',
                  text: '09:00  run A starts, will finish 09:10\n09:05  tick — run A still active\n09:10  tick — run A ends here' }
              ],
              teach: 'The run is <code>sleep 600</code>, ten minutes, and the tick is five. Every run outlives the next tick by design; that is the whole point of the question. Default <code>Allow</code> would stack them. Also, the schedule as written will not even parse.'
            } },
          { label: 'Yes — but change sleep 600 to sleep 240 so runs finish inside the window',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'Grading line',
                  text: 'The container runs sleep 600. echo sleep 600 scores 0 on the first pair — it prints the words and exits at once.' }
              ],
              teach: 'You changed the workload to avoid the problem. The exam pinned the duration precisely so that overlap is unavoidable and the policy field has to carry the answer. In real work the same rule holds: the runtime of a job is a fact about the job, not a knob for the scheduler.'
            } }
        ]
      },

      /* 3 — see the default fail */
      {
        evidence: [
          { type: 'note', title: 'Suppose you had applied it without concurrencyPolicy',
            text: 'Same CronJob, schedule fixed to */5 * * * *, policy left at its default. Fifteen minutes later:' },
          { type: 'terminal', title: 'Two runs alive at once',
            text: `$ kubectl -n batch get cronjob ledger-roll
NAME          SCHEDULE      TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
ledger-roll   */5 * * * *   <none>     False     2        24s             15m

$ kubectl -n batch get jobs
NAME                   STATUS    COMPLETIONS   DURATION   AGE
ledger-roll-29781180   Complete  1/1           10m1s      15m
ledger-roll-29781185   Running   0/1           10m        10m
ledger-roll-29781190   Running   0/1           5m         5m` },
          { type: 'terminal', title: 'The events, in order',
            text: `$ kubectl -n batch get events --sort-by=.metadata.creationTimestamp
LAST SEEN   TYPE     REASON             OBJECT                     MESSAGE
15m         Normal   SuccessfulCreate   cronjob/ledger-roll        Created job ledger-roll-29781180
10m         Normal   SuccessfulCreate   cronjob/ledger-roll        Created job ledger-roll-29781185
5m          Normal   SuccessfulCreate   cronjob/ledger-roll        Created job ledger-roll-29781190
24s         Normal   SawCompletedJob    cronjob/ledger-roll        Saw completed job: ledger-roll-29781180, condition: Complete` }
        ],
        prompt: 'ACTIVE 2. What does this output prove, and what fixes it?',
        options: [
          { label: 'The default Allow created a Job at every tick regardless — set concurrencyPolicy: Forbid',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Patch and watch the next tick',
                  text: `$ kubectl -n batch patch cronjob ledger-roll -p '{"spec":{"concurrencyPolicy":"Forbid"}}'
cronjob.batch/ledger-roll patched` }
              ],
              teach: 'Three ticks, three <code>SuccessfulCreate</code> events, no skip anywhere. That is <code>Allow</code>, and it is the default whenever the field is absent. The ACTIVE column counts Jobs the controller still considers live, so ACTIVE 2 is the overlap made visible in one number.'
            } },
          { label: 'The Jobs are running long — set activeDeadlineSeconds so each run is capped at five minutes',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'What a deadline does to the run',
                  text: `$ kubectl -n batch get jobs
NAME                   STATUS   COMPLETIONS   DURATION   AGE
ledger-roll-29781185   Failed   0/1           5m2s       12m

$ kubectl -n batch describe job ledger-roll-29781185 | grep -A2 Conditions
Conditions:
  Type       Status  Reason
  Failed     True    DeadlineExceeded` }
              ],
              teach: 'That cancels the active run, which the task explicitly forbids, and marks it Failed. A deadline is a timeout on the work. You were asked not to shorten the work but to skip the start.'
            } },
          { label: 'The controller missed nothing yet — set startingDeadlineSeconds: 0 so late starts are dropped',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'It still starts on time, so it still overlaps',
                  text: `$ kubectl -n batch get cronjob ledger-roll
NAME          SCHEDULE      TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
ledger-roll   */5 * * * *   <none>     False     2        11s             20m` }
              ],
              teach: '<code>startingDeadlineSeconds</code> answers a different question: how late may a missed start still be honoured, if the controller was down or paused. It has nothing to say about a run that is on time and simply overlaps a live one. Two fields, two different failure modes.'
            } },
          { label: 'Set concurrencyPolicy: Replace so there is only ever one run',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'One run at a time, at a price',
                  text: `$ kubectl -n batch get events --sort-by=.metadata.creationTimestamp | tail -3
5m1s   Normal   SuccessfulDelete   cronjob/ledger-roll   Deleted job ledger-roll-29781185
5m     Normal   SuccessfulCreate   cronjob/ledger-roll   Created job ledger-roll-29781190
4m     Normal   SawCompletedJob    cronjob/ledger-roll   Saw completed job: ledger-roll-29781185, condition: Failed` }
              ],
              teach: 'Replace does hold ACTIVE at 1, which is why it looks like a solution. Read what it deletes: the run that was five minutes into its work. The task said skip the next scheduled start and do not cancel the active run. <code>SuccessfulDelete</code> is the fingerprint of exactly the thing you were told not to do.'
            } }
        ]
      },

      /* 4 — read the Forbid evidence */
      {
        evidence: [
          { type: 'terminal', title: 'Two ticks after the patch',
            text: `$ kubectl -n batch get events --sort-by=.metadata.creationTimestamp | tail -4
LAST SEEN   TYPE     REASON             OBJECT                MESSAGE
10m         Normal   SuccessfulCreate   cronjob/ledger-roll   Created job ledger-roll-29781195
5m          Normal   JobAlreadyActive   cronjob/ledger-roll   Not starting job because prior execution is running and concurrency policy is Forbid
14s         Normal   JobAlreadyActive   cronjob/ledger-roll   Not starting job because prior execution is running and concurrency policy is Forbid` },
          { type: 'terminal', title: 'The Jobs',
            text: `$ kubectl -n batch get cronjob,jobs
NAME                        SCHEDULE      TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
cronjob.batch/ledger-roll   */5 * * * *   <none>     False     1        10m             35m

NAME                             STATUS    COMPLETIONS   DURATION   AGE
job.batch/ledger-roll-29781195   Running   0/1           10m        10m` }
        ],
        prompt: 'Which line here is the evidence that the requirement is met?',
        options: [
          { label: 'JobAlreadyActive — the tick was skipped and the running Job was left alone',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The run that was skipped over is still the same run',
                  text: `$ kubectl -n batch get job ledger-roll-29781195 \\
    -o custom-columns=NAME:.metadata.name,START:.status.startTime,ACTIVE:.status.active
NAME                   START                  ACTIVE
ledger-roll-29781195   2026-08-16T09:15:00Z   1` }
              ],
              teach: 'The message is the requirement, restated by the controller: "Not starting job because prior execution is running and concurrency policy is Forbid". Two things are true at once — a start was skipped, and no <code>SuccessfulDelete</code> appears, so nothing was cancelled. That pairing is what separates Forbid from Replace in a log.'
            } },
          { label: 'ACTIVE 1 — only one Job is alive, which is what was asked',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Replace shows ACTIVE 1 too',
                  text: `# with concurrencyPolicy: Replace
NAME          SCHEDULE      TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
ledger-roll   */5 * * * *   <none>     False     1        22s             35m` }
              ],
              teach: 'True but not decisive. Forbid and Replace both hold ACTIVE at 1; they differ in which run survives. Only the events say which mechanism produced that 1 — JobAlreadyActive for a skip, SuccessfulDelete for a cancel. When two policies produce the same number, the number is not your evidence.'
            } },
          { label: 'SuccessfulCreate at the top — the CronJob is still creating Jobs, so it is not stuck',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'What that line dates from',
                  text: '10m ago: the tick when nothing was active. Forbid does not stop creation, it only stops overlapping creation.' }
              ],
              teach: 'That event is from the tick that was allowed to start, ten minutes ago, before any overlap existed. It shows the CronJob is alive, which is a useful negative check, but it says nothing about concurrency.'
            } },
          { label: 'The absence of a MissSchedule warning',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'note', title: 'When MissSchedule fires',
                  text: 'Warning MissSchedule — "Missed scheduled time to start a job: <time>". Emitted when the controller could not evaluate a tick in time, typically after a controller-manager outage or a too-small startingDeadlineSeconds.' }
              ],
              teach: 'A skip under Forbid is a deliberate decision, not a miss, so it gets its own Normal event. <code>MissSchedule</code> is a Warning about the controller failing to keep up. Confusing the two would have you debugging the control plane instead of reading your own policy.'
            } }
        ]
      },

      /* 5 — verify for the grader */
      {
        evidence: [
          { type: 'note', title: 'The grading lines',
            text: '2 pts  batch/ledger-roll exists and is the only CronJob in batch; suspend false or unset; image busybox:1.36; runs sleep 600\n2 pts  schedule fires every five minutes\n2 pts  concurrencyPolicy is Forbid' }
        ],
        prompt: 'Last minute on the clock. How do you confirm all six points?',
        options: [
          { label: 'kubectl -n batch get cronjob to count them, then -o yaml on ledger-roll to read the fields',
            verdict: 'right',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'Count, then read',
                  text: `$ kubectl -n batch get cronjob
NAME          SCHEDULE      TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
ledger-roll   */5 * * * *   <none>     False     1        3m              38m

$ kubectl -n batch get cronjob ledger-roll -o yaml | sed -n '/^spec:/,/jobTemplate/p'
spec:
  concurrencyPolicy: Forbid
  failedJobsHistoryLimit: 1
  schedule: '*/5 * * * *'
  successfulJobsHistoryLimit: 3
  suspend: false
  jobTemplate:

$ kubectl -n batch get cronjob ledger-roll \\
    -o jsonpath='{.spec.jobTemplate.spec.template.spec.containers[0].image}{"  "}{.spec.jobTemplate.spec.template.spec.containers[0].command}{"\\n"}'
busybox:1.36  ["sleep","600"]` }
              ],
              teach: 'Two commands, six points. The bare <code>get</code> proves the only-CronJob constraint, which nothing else will tell you. The YAML proves the three fields, including the defaults the server filled in — note <code>suspend: false</code> appeared on its own. Verify from the stored object, never from the file you applied.'
            } },
          { label: 'kubectl -n batch get cronjob — the table shows everything that is graded',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'The columns you actually get',
                  text: `$ kubectl -n batch get cronjob
NAME          SCHEDULE      TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
ledger-roll   */5 * * * *   <none>     False     1        3m              38m` }
              ],
              teach: 'Name, schedule and suspend are there. Concurrency policy, image and command are not — the CronJob printer has no column for any of them. That is four of six points unverified. Whenever a graded field has no column, you must ask for it.'
            } },
          { label: 'Re-read /opt/course/01/ledger-roll.yaml to confirm what you applied',
            verdict: 'wrong',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'File and cluster can disagree',
                  text: `$ grep concurrencyPolicy /opt/course/01/ledger-roll.yaml
$ kubectl -n batch get cronjob ledger-roll -o jsonpath='{.spec.concurrencyPolicy}{"\\n"}'
Forbid` }
              ],
              teach: 'The file is your intent; the grader reads the cluster. Here they differ because the policy arrived by <code>patch</code> and never went back into the manifest. Server-side defaults widen the gap further. Always check the live object.'
            } },
          { label: 'kubectl -n batch describe cronjob ledger-roll and read the summary',
            verdict: 'partial',
            feedback: {
              evidence: [
                { type: 'terminal', title: 'describe does show it',
                  text: `$ kubectl -n batch describe cronjob ledger-roll | head -8
Name:                       ledger-roll
Namespace:                  batch
Schedule:                   */5 * * * *
Concurrency Policy:         Forbid
Suspend:                    False
Successful Job History Limit:  3
Failed Job History Limit:      1
Starting Deadline Seconds:  <unset>` }
              ],
              teach: 'This is genuinely good for five of the six points — describe prints Concurrency Policy, Schedule and Suspend, and lists the pod template further down. What it cannot tell you is whether a second CronJob exists in the namespace, which is a scored constraint. Pair it with a bare <code>get</code>.'
            } }
        ]
      }

    ],
    closing: 'A CronJob controller wakes on each scheduled tick and asks one question before it creates anything: is a previous run still active? concurrencyPolicy is the answer it consults, and the default is Allow, which means it never asks — it simply creates, and a ten-minute run on a five-minute schedule stacks up as ACTIVE 2. Forbid makes it skip the new start and leave the live run untouched, logging JobAlreadyActive with the message "Not starting job because prior execution is running and concurrency policy is Forbid". Replace also holds ACTIVE at 1, but it gets there by deleting the run in progress, which shows up as SuccessfulDelete — the same number, the opposite behaviour, and the reason the task spelled out both halves of the requirement. Neither activeDeadlineSeconds nor startingDeadlineSeconds is a substitute: one caps how long work may run, the other how late a missed start may be honoured. See "Concurrency policy" on the CronJob page at kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/.'
  }

};
