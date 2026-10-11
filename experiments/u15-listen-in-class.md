# Listen-in classroom pilot: routes, ownership, and inert policy

This is the classroom-dialogue version of Module 15. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u15`, plus its
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

**Teacher:** [warm, unhurried] Your route is stored. Nothing is being served. On
Gateway API that often looks Accepted with no working listener. On Ingress the
object can exist with the same inert result. Maya, what do people conclude when
they see the object?

**Listener pause: 3 seconds**

**Maya:** That the edge is configured and traffic should flow.

**Teacher:** One investigation: an object that looks right while nothing moves
— first a route that does not serve, later a NetworkPolicy that does not
enforce. Same question both times: is the object the thing that acts? Leon,
what two families of routing intent will we use?

**Listener pause: 2 seconds**

**Leon:** Ingress, and the Gateway API.

### The object is not the proxy

**Teacher:** [curious] Do Ingress or Gateway API objects forward packets?

**Listener pause: 3 seconds**

**Leon:** [uncertain] Gateway does the forwarding... Ingress is just the rule?

**Teacher:** Neither forwards. What do they describe?

**Listener pause: 2 seconds**

**Maya:** Intent.

**Teacher:** What must sit between the object and real traffic?

**Listener pause: 3 seconds**

**Maya:** A controller that observes those objects and configures a real proxy
or load balancer.

**Teacher:** Without that controller, what are the objects?

**Listener pause: 2 seconds**

**Leon:** Inert records. Valid, and nothing moves.

**Teacher:** [pleased] Objects describe. Controllers forward.

### Accepted is not served

**Teacher:** An HTTPRoute is valid in the API. Maya, does that prove a listener
serves it?

**Listener pause: 3 seconds**

**Maya:** [confident] If it was accepted, the controller should be serving it.

**Teacher:** [gentle] Are API acceptance and controller implementation the same
event?

**Listener pause: 2 seconds**

**Leon:** No. Two different events.

**Teacher:** Where are acceptance and resolution actually reported?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] In... status? Parents and conditions on the object?

**Teacher:** The same route can be Accepted by its parent while a listener or
a downstream boundary still fails to serve it. Which place reports acceptance
and resolution separately?

**Listener pause: 2 seconds**

**Maya:** Status.

### Who owns which object

**Teacher:** Leon, what is the strongest thing Gateway API adds over a single
Ingress object?

**Listener pause: 5 seconds**

**Leon:** Ownership split. Platform owns the infrastructure side.
Applications own their routes.

**Teacher:** Name the platform objects.

**Listener pause: 3 seconds**

**Leon:** GatewayClass and Gateway — the infrastructure and its listeners.

**Teacher:** What do application teams own?

**Listener pause: 2 seconds**

**Maya:** Their Routes, attached explicitly.

**Teacher:** Is attachment a pile of annotations in one shared object?

**Listener pause: 3 seconds**

**Leon:** No. It is a declared relationship, with status on both sides.

### Six programmable boundaries

**Teacher:** Trace an external request to a Pod. Maya, what is programmable
first, at the edge?

**Listener pause: 4 seconds**

**Maya:** The external address and its listener.

**Teacher:** After the listener, what comes next?

**Listener pause: 3 seconds**

**Maya:** The controller's data plane. Then the route match.

**Teacher:** Leon, continue inward — name the remaining boundaries, plus any
policy between them.

**Listener pause: 5 seconds**

**Leon:** [working it out] Service translation... EndpointSlice readiness... then
the Pod's own listener... and any policy in between.

**Teacher:** How many of those boundaries can fail on its own?

**Listener pause: 2 seconds**

**Maya:** Each one — and each has a different owner and different evidence.

### Policy permits, it does not route

**Teacher:** A NetworkPolicy selects Pods and the peers and ports allowed for
ingress and for egress. Maya, who enforces it?

**Listener pause: 3 seconds**

**Maya:** [confident] The NetworkPolicy object — that is what it is for.

**Teacher:** [gentle] Does the object enforce, or does the network
implementation?

**Listener pause: 3 seconds**

**Leon:** The network implementation.

**Teacher:** Is permission a path that carries traffic?

**Listener pause: 2 seconds**

**Leon:** No. Permission is not a path.

**Teacher:** Name four independent layers you diagnose separately.

**Listener pause: 6 seconds**

**Maya:** Routing. Endpoint selection. Policy. Whether the application is
listening.

**Teacher:** Does a fix in one prove the others?

**Listener pause: 2 seconds**

**Leon:** No.

### Diagnose a Service timeout in order

**Teacher:** A Service times out. Leon, where do you start — at the edge, or
near identity?

**Listener pause: 3 seconds**

**Leon:** [uncertain] At the Ingress, because that is where the user hits.

**Teacher:** [gentle] Move from identity outward. What do you confirm first?

**Listener pause: 3 seconds**

**Maya:** The Service and its selector.

**Teacher:** Then what about the backends?

**Listener pause: 3 seconds**

**Maya:** That the EndpointSlices actually contain ready backends.

**Teacher:** Then you test a Pod address directly. What does that split prove?

**Listener pause: 4 seconds**

**Leon:** [realizing] Whether the problem is the Service path or the Pod itself.

**Teacher:** Only after that split — translation and policy. Why that order?

**Listener pause: 3 seconds**

**Maya:** One layer at a time. That is what makes the answer trustworthy.

### Accepted, and doing nothing

**Teacher:** Last trap — same shape as the inert route. A NetworkPolicy object
is accepted. Maya, does that mean it enforces?

**Listener pause: 3 seconds**

**Maya:** It should — it is stored and valid.

**Teacher:** Is API storage the same as enforcement?

**Listener pause: 2 seconds**

**Leon:** No.

**Teacher:** Give me independent reasons a stored policy can still do nothing.

**Listener pause: 6 seconds**

**Leon:** The network implementation may not support NetworkPolicy
at all. The selector may match no Pods. Ingress and egress isolation are
separate, so covering one leaves the other open.

**Teacher:** Does core NetworkPolicy expose enforcement status?

**Listener pause: 3 seconds**

**Maya:** No. The object looks identical whether the implementation enforces
it or ignores it.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — why a routing object is not a proxy, and what makes it live;

two — why Accepted is not the same claim as served, and where to read the
difference;

three — how Gateway API splits ownership between platform and application;

four — the programmable boundaries from external request to Pod; and

five — why a stored NetworkPolicy may enforce nothing, and how you order a
Service-timeout diagnosis.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

Ingress and Gateway API describe intent. They do not forward packets. A
controller must observe the objects and configure a real data plane; without
it the objects are inert. A valid route proves the API accepted it, not that a
listener serves it. Parents and conditions in status report attachment and
resolution. Gateway API splits ownership: platform teams own GatewayClass and
Gateway; application teams own Routes and attach them explicitly.

An external request crosses the listener, the controller data plane, the route
match, Service translation, EndpointSlice readiness, the Pod listener, and any
policy — each a separate programmable boundary. NetworkPolicy permits; it does
not route. Enforcement is the network implementation's job. Permission is not
a path. Diagnose routing, endpoints, policy, and the application listener as
independent layers. When a Service times out, move from Service and selector,
to ready endpoints, to a direct Pod test, then translation and policy. A stored
NetworkPolicy can still do nothing if the implementation does not enforce, the
selector matches nothing, or only one direction is covered. Storage is not
action — for routes and for policy alike.

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
for the expository Module 15. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
