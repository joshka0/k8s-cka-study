[u06] First prove who owns Pending · regression
  problem: The checkpoint says an empty nodeName means the scheduler still owns the Pod. The approved section also names scheduling gates. A gated Pod has no nodeName because the scheduler deliberately skips it, not because placement failed.
  fix:     **Maya:** Empty means no node assignment yet — read FailedScheduling
           events and scheduling gates; set means the kubelet owns startup.

[u07] Three probes, three jobs · regression
  problem: The checkpoint reduces startup to gating liveness and readiness. It drops the approved correction that the kubelet kills the container when startup-probe failures exhaust failureThreshold.
  fix:     **Maya:** Startup gates the other probes and kills after its
           threshold; liveness stops the container; readiness marks the Pod not
           ready.

[u08] One timeout, three owners · misleading
  problem: The checkpoint calls the first owner "CNI reachability." CNI is the execution contract. The network implementation owns Pod reachability. The compression changes a deliberately separated contract into an owner.
  fix:     **Leon:** The network implementation, through CNI, owns Pod
           reachability; the EndpointSlice controller owns backends; the
           Service data plane owns translation.

[u14] Four candidates, one symptom · misleading
  problem: The checkpoint omits the application that read the projected file once and cached it. That is a distinct approved cause. It is not repaired by waiting for projection or changing the Pod template.
  fix:     **Maya:** Environment needs restart; a file may be early, subPath,
           or immutable; the app may cache; or the template never changed.

[u24] Opening · regression
  problem: The checkpoint says "Nothing was stored." That is true for a rejected direct Pod create, but the approved correction also covers a controller path: the parent remains and records FailedCreate events while no child Pod is stored.
  fix:     **Maya:** A rejected direct create stores no Pod; a controller parent
           can remain with FailedCreate events — look at admission, not placement.

[u12] Classify here, serve there · pattern
  problem: The extension deletes Maya's approved answer after a listener pause and leaves an empty student turn.
  fix:     **Maya:** Classification and execution policy are different
           decisions.

[u19] Opening · pattern
  problem: The added checkpoint has a listener pause but no spoken answer.
  fix:     **Maya:** Find the holding mechanism and the protection it provides
           before you change it.

[u14] Opening · pattern
  problem: Leon answers "Environment values, and files on a volume." The checkpoint then asks Maya for the same distinction, and she gives a near-verbatim duplicate. The checkpoint does not add retrieval from a different angle.
  fix:     **Teacher:** Checkpoint, Maya. One line: which delivery shape can
           change after process start?

           **Listener pause: 3 seconds**

           **Maya:** Projected files can update eventually; environment values
           cannot.

[u12] The ninety-second answer · pattern
  problem: The added recall asks where admitted intent is persisted and gets "etcd." The teacher immediately asks the same question again and gets the same answer. This pads a rapid-fire drill that the extension contract says to leave terse.
  fix:     **Teacher:** First, a recall — Maya, remind us. Where is admitted
           intent persisted?

           **Listener pause: 2 seconds**

           **Maya:** etcd.

           **Teacher:** Hold that. Who reconciles objects? Who binds Pods?

[u18] Ask without becoming them · pattern
  problem: The added recall asks whether ValidatingAdmissionPolicy can mutate, then moves to access-review APIs without reusing that fact. Mutation is not load-bearing for SubjectAccessReview, SelfSubjectAccessReview, TokenReview, or impersonation.
  fix:     **Teacher:** You need to know whether some user can do something.
           Leon, which review asks the authorizer about a named subject?

[u19] Four gates, four transitions · pattern
  problem: The added recall retrieves the holder, renewal, and duration fields of a leadership Lease. The section then changes to four gate transitions and never reuses those fields. This is a recall of non-load-bearing detail.
  fix:     **Teacher:** Now the gates. Each blocks exactly one transition. Leon,
           what do scheduling gates keep a Pod out of?

[u22] Preserve the perishable first · pattern
  problem: The added recall retrieves the resource-metrics pipeline immediately before a crash-loop evidence drill. The pipeline is not reused in that section and does not help order perishable evidence.
  fix:     **Teacher:** Crash loop. Maya, what do you do first — restart clean,
           or read?

[u25] An address is not reachability · pattern
  problem: Leon recalls that a load-balancer address proves provisioning only. The teacher immediately asks what the address proves, and Leon repeats the same answer. The recall and the section question are one retrieval duplicated.
  fix:     **Teacher:** First, a recall — Leon, remind us. What does a
           load-balancer address prove?

           **Listener pause: 2 seconds**

           **Leon:** Provisioning only.

           **Teacher:** Hold that. Name independent failures that can still sit
           behind that green address.

[u27] Choosing between them · pattern
  problem: Leon recalls what RuntimeClass selects. After one intervening question, the teacher asks what RuntimeClass selects again and Maya repeats the answer. The added recall duplicates the approved repair instead of preparing a later reuse.
  fix:     **Teacher:** Are RuntimeClass and user namespaces alternatives, or
           complementary?

           **Listener pause: 3 seconds**

           **Leon:** [uncertain] Alternatives — pick one isolation story.

           **Teacher:** [gentle] Complementary. What does RuntimeClass select?

ACCURACY: 5 findings
PATTERN: 9 findings
