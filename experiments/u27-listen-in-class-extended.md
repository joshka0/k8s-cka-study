# Listen-in classroom, extended: admission, runtime, and isolation boundaries

Extended format of the u27 classroom pilot. Same facts, same cast, same
scenario — with in-session reinforcement built in:

1. **Term reuse**: when an important term returns after minutes away, a student
 is asked to recall it before the new question uses it. The reminder is
 itself retrieval.
2. **New terms**: behaviour first, then the name, then a student echoes the
 name in their answer, so it lands twice within a minute.
3. **Micro-checkpoints**: each section ends with one student restating the
 section's rule in one line before the class moves on.
4. **Adaptive teacher turns**: story at section openings, fuller where context
 helps, terse in drills.

## Cast

- **Teacher** — asks short, cumulative questions and repairs reasoning without
 turning the exchange into a lecture.
 Voice: the course narrator (`c023b17b38144a60b3984153247d993f`).
- **Maya** — experienced engineer, quick and confident; often reaches the
 operational conclusion before accounting for every Kubernetes boundary.
 Voice: Kaya (`531f90254e3d4810a047a90b9309fdd0`) — warm, unhurried.
- **Leon** — deliberate and precise; more likely to confuse similar object
 names or lose the causal sequence.
 Voice: Wheatley (`ac6474da3a324e0c8edf6d796fe59f4d`) — quick, a little
 anxious; the self-corrections land naturally in it.
- **Listener pause** — a few seconds of silence before a student answers.
 The listener should answer in that gap.

The different student profiles matter. Their mistakes should remain natural,
not theatrical. Neither student is the permanently weak or permanently strong
one.

---

## Script

### Opening

**Teacher:** [warm, unhurried] Pod Security Admission passed. A pass is not a complete security claim. Maya, what claim do
people hear in that sentence?

**Listener pause: 3 seconds**

**Maya:** The Pod is secure — restricted enough to run.

**Teacher:** One investigation: what admission actually checked, and what a real
isolation boundary must still provide. We separate modes, then the spec from
the runtime, then choose RuntimeClass and user namespaces deliberately. Leon,
is a pass a complete security claim?

**Listener pause: 3 seconds**

**Leon:** [realizing] No — not by itself.

**Teacher:** Checkpoint, Maya. One line: what a pass does not prove.

**Listener pause: 3 seconds**

**Maya:** That the Pod is secure — pass is not a complete security claim.

### Three modes, one blocks

**Teacher:** [curious] How is Pod Security Admission selected?

**Listener pause: 3 seconds**

**Maya:** Namespace labels — level and mode.

**Teacher:** Name the three standard levels.

**Listener pause: 3 seconds**

**Leon:** Privileged, baseline, and restricted.

**Teacher:** What does enforce do?

**Listener pause: 2 seconds**

**Maya:** Rejects the Pod.

**Teacher:** What does audit do?

**Listener pause: 3 seconds**

**Leon:** Records it in the audit log.

**Teacher:** What does warn do?

**Listener pause: 3 seconds**

**Maya:** Returns a message to the client and creates it anyway.

**Teacher:** Which mode blocks anything?

**Listener pause: 2 seconds**

**Leon:** Only enforce.

**Teacher:** A namespace labelled warn — what is it doing with violations?

**Listener pause: 3 seconds**

**Maya:** [realizing] Telling you about them while accepting every one.

**Teacher:** Before we move on — Leon, one line. Which mode blocks?

**Listener pause: 3 seconds**

**Leon:** Only enforce — audit logs, warn warns and still creates.

### It evaluates the spec

**Teacher:** Runtime and kernel enforcement are separate questions. What does Pod Security Admission evaluate — the running process, or
the Pod spec?

**Listener pause: 3 seconds**

**Leon:** [uncertain] Both — otherwise it would not be security.

**Teacher:** [gentle] Name settings it checks against the
standard.

**Listener pause: 5 seconds**

**Maya:** securityContext fields, host namespaces, volume types, privileged
mode, and related settings — before the object is stored.

**Teacher:** Who answers whether the runtime and kernel actually enforce those
settings on the node?

**Listener pause: 3 seconds**

**Leon:** The runtime and the kernel — not the API server.

**Teacher:** Are those the same question as admission?

**Listener pause: 2 seconds**

**Maya:** No. Separate questions.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: what admission evaluates.

**Listener pause: 3 seconds**

**Maya:** The Pod spec before storage — not the running process on the node.

### Passing Restricted is not a claim

**Teacher:** First, a recall — Leon, remind us. What does admission evaluate?

**Listener pause: 2 seconds**

**Leon:** The Pod spec — not the running process.

**Teacher:** Hold that. The Pod passed Restricted admission. Maya, is that a
complete security claim?

**Listener pause: 3 seconds**

**Maya:** [confident] Restricted is the hard bar — that is the claim.

**Teacher:** [gentle] Are the standards the whole of policy?

**Listener pause: 2 seconds**

**Leon:** No. A bounded baseline.

**Teacher:** What did admission check — a running process, or a spec?

**Listener pause: 2 seconds**

**Maya:** A spec.

**Teacher:** What still has to enforce the mechanisms?

**Listener pause: 3 seconds**

**Leon:** The runtime implementation selected through RuntimeClass, and the
kernel.

**Teacher:** Name controls this never looked at.

**Listener pause: 4 seconds**

**Maya:** Network, identity, image provenance, and secret handling.

**Teacher:** Checkpoint, Leon. One line: why Restricted pass is incomplete.

**Listener pause: 3 seconds**

**Leon:** It is a bounded baseline on the spec — not network, identity, images,
or secrets.

### What actually reduces privilege

**Teacher:** Name settings that genuinely reduce privilege at runtime. Labels and revisions do not isolate a process.

**Listener pause: 6 seconds**

**Leon:** [deliberate] Non-root user. Dropping capabilities rather than adding
them. A seccomp profile. A read-only root filesystem. Disallowing privilege
escalation.

**Teacher:** Do those shape the process and runtime boundary?

**Listener pause: 2 seconds**

**Maya:** Yes.

**Teacher:** Does a controller revision or a label carry isolation?

**Listener pause: 2 seconds**

**Leon:** No. Nothing at runtime.

**Teacher:** Before we move on — Maya, one line. What actually reduces privilege.

**Listener pause: 3 seconds**

**Maya:** Process and runtime settings — not labels or controller revisions.

### RuntimeClass is a selector

**Teacher:** A selector without a configured handler buys you nothing. What does RuntimeClass name?

**Listener pause: 3 seconds**

**Maya:** A CRI runtime handler — and it can carry scheduling constraints and
Pod overhead.

**Teacher:** Can it select a sandboxed runtime?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Is the object the implementation, or a selector and contract?

**Listener pause: 3 seconds**

**Maya:** A selector and contract. Implementation lives in the node's runtime
configuration.

**Teacher:** If the handler is not configured on eligible nodes, what does
RuntimeClass buy you?

**Listener pause: 3 seconds**

**Leon:** [realizing] Nothing. The Pod simply fails to run there.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: what RuntimeClass is and is
not.

**Listener pause: 3 seconds**

**Leon:** A selector and contract — not the implementation itself.

### Remapping the identity

**Teacher:** Identity remapping does not depend on the workload behaving. What do user namespaces do to container user IDs?

**Listener pause: 4 seconds**

**Maya:** Remap them — root inside can be unprivileged on the host.

**Teacher:** Where does that change the kernel's identity mapping?

**Listener pause: 3 seconds**

**Leon:** At the container boundary.

**Teacher:** Is that stronger than any single spec field that depends on the
workload behaving?

**Listener pause: 3 seconds**

**Maya:** Yes — it does not depend on the workload behaving.

**Teacher:** Checkpoint, Maya. One line: what user namespaces change.

**Listener pause: 3 seconds**

**Maya:** Kernel identity mapping — root inside can be unprivileged on the host.

### Choosing between them

**Teacher:** Are RuntimeClass and user namespaces alternatives, or
complementary?

**Listener pause: 3 seconds**

**Leon:** [uncertain] Alternatives — pick one isolation story.

**Teacher:** [gentle] What does RuntimeClass select?

**Listener pause: 3 seconds**

**Maya:** A node-configured runtime and isolation implementation — with
possible scheduling constraints and overhead.

**Teacher:** When do user namespaces remap identities?

**Listener pause: 3 seconds**

**Leon:** Within a supported runtime when the Pod opts in.

**Teacher:** What costs do you account for on each?

**Listener pause: 4 seconds**

**Maya:** Handler placement and overhead for RuntimeClass. Node support and
volume limits for user namespaces.

**Teacher:** What unites admission pass and boundary choice?

**Listener pause: 4 seconds**

**Leon:** [realizing] Admission checks the spec you submitted. If you need a
runtime boundary, choose one deliberately — pass is not that boundary.

**Teacher:** Before we move on — Maya, one line. How the two boundaries relate.

**Listener pause: 3 seconds**

**Maya:** Complementary — RuntimeClass selects the runtime; user namespaces
remap identity inside it.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — Pod Security Admission levels and modes, and which mode blocks;

two — why it evaluates the spec, not the running process;

three — why Restricted pass is not a complete security claim, and what
actually reduces privilege;

four — RuntimeClass as selector versus implementation; and

five — user namespaces, and how the two boundaries complement each other.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

Namespace labels select level and mode: privileged, baseline, restricted;
enforce rejects, audit logs, warn warns and creates — only enforce blocks.
Admission evaluates the Pod spec against the standard before storage. Runtime
and kernel enforcement are separate. Restricted pass is a bounded baseline, not
whole policy; network, identity, images, and secrets were never checked.
Privilege reducers at runtime: non-root, drop capabilities, seccomp, read-only
root, no privilege escalation — not labels or revisions. RuntimeClass names a
CRI handler and may add scheduling and overhead; the node must configure the
handler. User namespaces remap container root to unprivileged host identity.
The two are complementary; account for placement, overhead, support, and volume
limits. Admission checks the spec. Choose a runtime boundary deliberately.

If your answer had that causal shape, exact wording does not matter. If it did
not, replay only the dialogue where your reconstruction first diverged.

---

## Production notes

- Synthesised voices: normalise loudness across all three and keep one gain
 for the whole piece, so it feels like one room rather than edited clips.
- Keep student hesitations and self-corrections, but remove theatrical filler.
- The listener pause always precedes the student's attempt — including recall
 reminders and checkpoints, which are retrieval, not narration.
- Never make one student the designated wrong student. Rotate errors according
 to their reasoning profiles.
- Do not add background music. Silence is instructional space.
- No command lines, flags, or literal identity strings anywhere in dialogue.
 Speakable Kubernetes terms are vocabulary and stay.
- Extended-format additions: recall-before-reuse for important terms,
 behaviour-name-echo for new terms, a one-line student checkpoint closing
 each section, adaptive teacher turns (story at openings, terse in drills).

## Comparison test

After one listen, use the same ninety-second cold-reconstruction prompt used
for the expository module. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
