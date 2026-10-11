# Listen-in classroom pilot: Service layers and endpoint eligibility

This is the classroom-dialogue version of Module 25. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u25`, plus its
reviewed upstream sources. This is an audio script, not a video script.

The dialogue stays at the level of concepts. No command lines, no flag
strings, no literal identity strings. Where the expository module teaches an
exact string, this script teaches the *shape* of the string — what the parts
are and which contains which — and leaves the exact characters to the module
and the deck. A listener in a car cannot read, so nothing here should need
reading.

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
- **Listener pause** — two or three seconds of silence before a student answers.
  The listener should answer in that gap.

The different student profiles matter. Their mistakes should remain natural,
not theatrical. Neither student is the permanently weak or permanently strong
one.

---

## Script

### Opening

**Teacher:** [warm, unhurried] A load balancer has an address. Maya, what do people
conclude?

**Listener pause: 3 seconds**

**Maya:** Something answers — provisioning succeeded, so traffic works.

**Teacher:** One investigation: everything looks present and nothing is
eligible. We stack Service types as layers, then read EndpointSlice conditions
until membership and eligibility come apart. Leon, what does that address
prove about whether anything answers?

**Listener pause: 3 seconds**

**Leon:** [realizing] Almost nothing — only that provisioning happened.

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

### Local is not a hint

**Teacher:** externalTrafficPolicy set to Local. Maya, what two benefits do
people want?

**Listener pause: 4 seconds**

**Maya:** Preserve the client source address, and avoid an extra hop.

**Teacher:** Which endpoints are eligible at the receiving node under Local?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] All ready endpoints... across the cluster?

**Teacher:** [gentle] Only node-local ones. Is that a performance hint?

**Listener pause: 2 seconds**

**Maya:** No. A real behaviour change.

**Teacher:** What happens on a node with no local endpoint?

**Listener pause: 3 seconds**

**Leon:** [realizing] It will not serve the traffic at all.

**Teacher:** Is that the trade you are making?

**Listener pause: 2 seconds**

**Maya:** Yes.

### An address is not reachability

**Teacher:** LoadBalancer shows an ingress address. What one thing does that
prove?

**Listener pause: 3 seconds**

**Leon:** Provisioning happened.

**Teacher:** Name independent failures that can still sit behind that green
address.

**Listener pause: 7 seconds**

**Maya:** Backend health. Wrong Service ports. EndpointSlices empty or unready.
Traffic policy excluding every endpoint on the node that got the packet. The
Pod's own listener or policy refusing.

**Teacher:** How many of those can fail while the address stays green?

**Listener pause: 2 seconds**

**Leon:** All of them. Five independent breaks.

### Ready, serving, terminating

**Teacher:** Where does membership come from when the Service has a selector?

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

**Teacher:** [gentle] Terminating and still serving is what lets a graceful
shutdown drain. What does membership alone tell you?

**Listener pause: 3 seconds**

**Leon:** [realizing] That an address exists — not that anything will use it.

### A requirement, or a preference

**Teacher:** Locality comes in two strengths. Leon, what does strict internal
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

### The shortest diagnosis

**Teacher:** Five steps, EndpointSlice-centred. First?

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
- The listener pause always precedes the student's attempt. This preserves
  retrieval while still providing vicarious learning.
- Never make one student the designated wrong student. Rotate errors according
  to their reasoning profiles.
- Do not add background music. Silence is instructional space.
- Preserve small teacher prompts such as "which object supplied the reach?";
  these reveal how to repair reasoning without giving away the whole answer.
- No command lines, flags, or literal identity strings anywhere in dialogue.
  The exact characters live in the module and the deck; this format teaches
  the shape and the order of the parts.

## Comparison test

After one listen, use the same ninety-second cold-reconstruction prompt used
for the expository Module 25. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
