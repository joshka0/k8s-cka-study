# Listen-in classroom pilot: aggregation, watches, and in-process policy

This is the classroom-dialogue version of Module 18. The learner listens to a
teacher work with two students and answers mentally before hearing their
attempts. The students are not scripted as answer dispensers: they hesitate,
compress too early, and make plausible mistakes which expose the mechanism.

Factual authority remains `assets/cka-deep-content.js`, unit `u18`, plus its
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

**Teacher:** [warm, unhurried] Some of the APIs you query are not stored by the API
server you are talking to. Maya, what do people usually assume about every
custom type?

**Listener pause: 3 seconds**

**Maya:** That it is a CRD sitting in the same storage as built-in types.

**Teacher:** One investigation for this session: what actually serves the path
you called — first aggregation versus a CRD, then what a watch owes you, then
policy that never leaves the process. Same question throughout: who answers,
and at what cost? Leon, where are we on the request path?

**Listener pause: 2 seconds**

**Leon:** At the front — the API machinery itself.

### Claiming a path

**Teacher:** [curious] An APIService claims a group and version path. After the main
API server authenticates the request, what does it do?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] It is... stored by the extension server?

**Teacher:** It proxies to an extension API server. Can that server implement
its own storage and subresources?

**Listener pause: 2 seconds**

**Maya:** Yes.

**Teacher:** How is a CRD different?

**Listener pause: 4 seconds**

**Maya:** A CRD uses the generic storage and generic behaviour on the main API
server. No separate server.

**Teacher:** [pleased] One surface, two implementations. What is the hop that
makes aggregation different?

**Listener pause: 2 seconds**

**Leon:** The proxy hop.

### When aggregation earns its cost

**Teacher:** When does an aggregated API beat a CRD, Maya?

**Listener pause: 4 seconds**

**Maya:** [confident] Whenever you want richer behaviour than a plain object.

**Teacher:** [gentle] Rarely, and only deliberately. What do CRDs already give
you on the generic server, Leon?

**Listener pause: 4 seconds**

**Leon:** Create, read, update, delete, watch, and schema. Status and scale
when you enable them on the CRD.

**Teacher:** What kinds of behaviour only an extension server can supply?

**Listener pause: 5 seconds**

**Maya:** Custom storage, unusual subresources, or responses computed rather
than stored.

### What a watch owes you

**Teacher:** Two watch behaviours by name. Maya, does a BOOKMARK event carry an
object change?

**Listener pause: 3 seconds**

**Maya:** [uncertain] Yes — that is why you apply it.

**Teacher:** [gentle] It carries no object change. What does it tell you about
resource version?

**Listener pause: 3 seconds**

**Leon:** That the resource version has advanced, so you can resume from a
newer point.

**Teacher:** Is BOOKMARK required, or optional?

**Listener pause: 2 seconds**

**Maya:** Optional — an optimisation.

**Teacher:** Leon, an HTTP four-ten Gone means the history you tried to resume
from has expired. Can you infer what you missed?

**Listener pause: 3 seconds**

**Leon:** [realizing] No. There is no way to infer it.

**Teacher:** What is the only correct response?

**Listener pause: 3 seconds**

**Leon:** Rebuild current state — relist, then watch again.

### What registering costs you

**Teacher:** You register an APIService. Maya, what new dependency sits on every
matching request?

**Listener pause: 4 seconds**

**Maya:** The extension server's latency — and trust for transport and
request-header identity.

**Teacher:** Can the main API server answer on that path if your extension is
down?

**Listener pause: 3 seconds**

**Leon:** No. It proxies rather than stores.

**Teacher:** Can a failure there degrade discovery for clients that never
wanted your API?

**Listener pause: 2 seconds**

**Maya:** Yes. That is the blast radius.

### Policy without a network call

**Teacher:** Leon, how do you enforce policy without putting a service on the
hot path?

**Listener pause: 5 seconds**

**Leon:** [working it out] In-process admission policy — CEL evaluated inside the
API server.

**Teacher:** What object holds the CEL logic?

**Listener pause: 2 seconds**

**Maya:** A ValidatingAdmissionPolicy.

**Teacher:** What does the binding do?

**Listener pause: 3 seconds**

**Maya:** Scopes it and chooses what enforcement actions apply.

**Teacher:** What does an optional parameter resource supply?

**Listener pause: 2 seconds**

**Leon:** Data to the expression.

**Teacher:** Webhook, Service, DNS, TLS on the deadline path — present or
absent?

**Listener pause: 2 seconds**

**Maya:** Absent.

### Safer, not free

**Teacher:** Maya, does safer mean free of design work?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes. With no network dependency, we can apply it broadly
without careful scoping or cost limits.

**Teacher:** [gentle] Safer, not free. Can ValidatingAdmissionPolicy mutate an
object?

**Listener pause: 2 seconds**

**Leon:** No. Validation only.

**Teacher:** What decisions still remain your job?

**Listener pause: 4 seconds**

**Maya:** Matching scope, expression cost, and failure policy.

**Teacher:** What did it remove, and what did it not?

**Listener pause: 3 seconds**

**Leon:** It removes the network dependency, not the design work.

### Ask without becoming them

**Teacher:** You need to know whether some user can do something. Leon, which
review asks the authorizer about a named subject?

**Listener pause: 3 seconds**

**Leon:** SubjectAccessReview.

**Teacher:** About the caller?

**Listener pause: 2 seconds**

**Maya:** SelfSubjectAccessReview.

**Teacher:** TokenReview asks a different subsystem. Which question — identity
or authorization?

**Listener pause: 4 seconds**

**Leon:** [uncertain] Authorization as that token?

**Teacher:** Identity evidence — authentication, not authorization. What verb
does impersonation need?

**Listener pause: 3 seconds**

**Maya:** Impersonate.

**Teacher:** Does audit retain both original and impersonated identity?

**Listener pause: 2 seconds**

**Leon:** Yes.

### Listener reconstruction

**Teacher:** Your turn, without the students.

Explain, in causal order:

one — how an aggregated API path differs from a CRD path;

two — when aggregation earns its cost, and what it costs availability;

three — BOOKMARK versus Gone on a watch;

four — how ValidatingAdmissionPolicy, binding, and parameters assemble, and
what CEL cannot do; and

five — how access-review APIs differ from TokenReview and impersonation.

**Listener pause: 30 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed answer.

An APIService claims a path. The main API server authenticates, then proxies
to an extension server, which can supply custom storage, unusual subresources,
or computed responses. A CRD uses generic storage on the main server. Prefer CRDs unless you need custom storage, unusual subresources,
or computed responses. Registering an APIService puts extension latency,
transport trust, and proxy behaviour on the path, and can degrade discovery for
unrelated clients.

A BOOKMARK advances the resume point without an object change. A Gone response
means history expired — rebuild state; do not invent missed events.
ValidatingAdmissionPolicy evaluates CEL in process; a binding scopes and
enforces; parameters feed the expression. No webhook hot path, but validation
only — scope, cost, and failure policy remain design work. SubjectAccessReview
and SelfSubjectAccessReview ask the authorizer. TokenReview asks authenticators
about identity. Impersonation needs the impersonate verb, with both identities
in audit. Always ask who serves the path before you debug the client.

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
for the expository Module 18. Score causal ordering and boundary discrimination,
not verbatim recall or learner preference.
