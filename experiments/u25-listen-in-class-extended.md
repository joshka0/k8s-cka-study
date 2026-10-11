# Listen-in classroom, extended: Service layers and endpoint eligibility

Extended format of the u25 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] A load balancer has an address. Everything can look present while nothing is eligible. Maya, what do people
conclude?

**Listener pause: 3 seconds**

**Maya:** Something answers — provisioning succeeded, so traffic works.

**Teacher:** One investigation: everything looks present and nothing is
eligible. We stack Service types as layers, then read EndpointSlice conditions
until membership and eligibility come apart. Leon, what does that address
prove about whether anything answers?

**Listener pause: 3 seconds**

**Leon:** [realizing] Almost nothing — only that provisioning happened.

**Teacher:** Checkpoint, Maya. One line: what a load-balancer address proves.

**Listener pause: 3 seconds**

**Maya:** Provisioning only — not that anything answers.

### Each type adds a layer

**Teacher:** [curious] Are Service types alternatives, or layers?

**Listener pause: 3 seconds**

**Leon:** [uncertain] Alternatives — you pick ClusterIP or NodePort or
LoadBalancer.

**Teacher:** What is the base layer?

**Listener pause: 2 seconds**

**Maya:** ClusterIP.

**Teacher:** What does NodePort add on top?

**Listener pause: 3 seconds**

**Leon:** A port on nodes.

**Teacher:** What does LoadBalancer ask for, still using Service semantics
underneath?

**Listener pause: 3 seconds**

**Maya:** External reachability from an implementation.

**Teacher:** So is a LoadBalancer Service still a ClusterIP Service with more
in front?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Can every layer below still be the thing that is broken?

**Listener pause: 2 seconds**

**Maya:** Yes.

**Teacher:** Before we move on — Leon, one line. Service types as layers.

**Listener pause: 3 seconds**

**Leon:** ClusterIP base, NodePort adds a node port, LoadBalancer adds external
reachability — every inner layer can still break.

### Local is not a hint

**Teacher:** externalTrafficPolicy set to Local. Local is a real eligibility change, not a performance tip. Maya, what two benefits do
people want?

**Listener pause: 4 seconds**

**Maya:** Preserve the client source address, and avoid an extra hop.

**Teacher:** Which endpoints are eligible at the receiving node under Local?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] All ready endpoints... across the cluster?

**Teacher:** [gentle] Is that a performance hint?

**Listener pause: 2 seconds**

**Maya:** No. A real behaviour change.

**Teacher:** What happens on a node with no local endpoint?

**Listener pause: 3 seconds**

**Leon:** [realizing] It will not serve the traffic at all.

**Teacher:** Is that the trade you are making?

**Listener pause: 2 seconds**

**Maya:** Yes.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: what Local changes about
eligibility.

**Listener pause: 3 seconds**

**Maya:** Only node-local endpoints are eligible — no local endpoint, no serve.

### An address is not reachability

**Teacher:** First, a recall — Leon, remind us. What does a load-balancer
address prove?

**Listener pause: 2 seconds**

**Leon:** Provisioning only.

**Teacher:** Hold that. Name independent failures that can still sit behind
that green address.

**Listener pause: 7 seconds**

**Maya:** Backend health. Wrong Service ports. EndpointSlices empty or unready.
Traffic policy excluding every endpoint on the node that got the packet. The
Pod's own listener or policy refusing.

**Teacher:** How many of those can fail while the address stays green?

**Listener pause: 2 seconds**

**Leon:** All of them. Five independent breaks.

**Teacher:** Checkpoint, Leon. One line: what still fails behind a green
address.

**Listener pause: 3 seconds**

**Leon:** Health, ports, slices, traffic policy, or the Pod listener — all of
them.

### Ready, serving, terminating

**Teacher:** Present is not ready; terminating can still serve for drain. Where does membership come from when the Service has a selector?

**Listener pause: 3 seconds**

**Maya:** The Service selector.

**Teacher:** And without a selector?

**Listener pause: 3 seconds**

**Leon:** Manually managed Endpoints or EndpointSlices.

**Teacher:** EndpointSlice conditions distinguish three states. Name them.

**Listener pause: 4 seconds**

**Maya:** Ready, serving, and terminating.

**Teacher:** Can an endpoint be present and not ready?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Can it be terminating and still serving?

**Listener pause: 3 seconds**

**Maya:** [uncertain] Terminating means drop it.

**Teacher:** [gentle] What does membership alone tell you?

**Listener pause: 3 seconds**

**Leon:** [realizing] That an address exists — not that anything will use it.

**Teacher:** Before we move on — Maya, one line. Membership versus eligibility.

**Listener pause: 3 seconds**

**Maya:** Membership is presence; ready, serving, and terminating decide
eligibility.

### A requirement, or a preference

**Teacher:** Locality comes in two strengths. Only a requirement can strand you with no traffic. Leon, what does strict internal
traffic policy require?

**Listener pause: 4 seconds**

**Leon:** A node-local endpoint — no local endpoint, no traffic.

**Teacher:** What do topology-aware routing and traffic distribution express?

**Listener pause: 3 seconds**

**Maya:** A preference — they will fall back.

**Teacher:** During failure analysis, can a hint be the reason nothing is
served?

**Listener pause: 3 seconds**

**Leon:** [realizing] No. Only a requirement can strand you that way.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: requirement versus
preference.

**Listener pause: 3 seconds**

**Leon:** A requirement can strand you; a preference falls back.

### The shortest diagnosis

**Teacher:** First, a recall — Maya, remind us. What three EndpointSlice
conditions matter?

**Listener pause: 2 seconds**

**Maya:** Ready, serving, and terminating.

**Teacher:** Hold that. Five steps, EndpointSlice-centred. First?

**Listener pause: 3 seconds**

**Maya:** Verify selector membership.

**Teacher:** Second?

**Listener pause: 3 seconds**

**Leon:** Inspect ready, serving, and terminating conditions.

**Teacher:** Third?

**Listener pause: 2 seconds**

**Maya:** Check the IP family and the port.

**Teacher:** Fourth?

**Listener pause: 4 seconds**

**Leon:** Apply traffic policy and locality rules — which endpoints are
actually eligible.

**Teacher:** Fifth?

**Listener pause: 2 seconds**

**Maya:** Test the Pod's listener directly.

**Teacher:** What is the module's core distinction?

**Listener pause: 3 seconds**

**Leon:** Selected is not eligible.

**Teacher:** Checkpoint, Maya. One line: the core distinction.

**Listener pause: 3 seconds**

**Maya:** Selected is not eligible — membership is not serve.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — Service types as layers with ClusterIP at the core;

two — what externalTrafficPolicy Local changes about eligibility;

three — why a load-balancer address proves almost nothing;

four — ready, serving, and terminating on EndpointSlices; and

five — strict requirement versus preference, and the five-step slice diagnosis.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

Service types stack: ClusterIP base, NodePort adds a node port, LoadBalancer
adds external reachability on the same semantics. Every inner layer can still
be broken. externalTrafficPolicy Local preserves source address and avoids a
hop, but only node-local endpoints are eligible — a node with none does not
serve. A provisioned address proves provisioning only. Behind it: health,
ports, empty or unready slices, traffic policy, listener or policy.

Membership comes from selector or manual endpoints. Conditions encode ready,
serving, and terminating — present is not ready; terminating can still serve
for drain. Strict internal traffic policy is a requirement; topology preference
falls back. Diagnose: membership, conditions, family and port, eligibility
under policy, then the Pod listener. Selected is not eligible.

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
