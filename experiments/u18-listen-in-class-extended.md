# Listen-in classroom, extended: aggregation, watches, and in-process policy

Extended format of the u18 classroom pilot. Same facts, same cast, same
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

**Teacher:** [warm, unhurried] Who serves the path is the first question on every custom API. Maya, what do people usually assume about every
custom type?

**Listener pause: 3 seconds**

**Maya:** That it is a CRD sitting in the same storage as built-in types.

**Teacher:** One investigation for this session: what actually serves the path
you called — first aggregation versus a CRD, then what a watch owes you, then
policy that never leaves the process. Same question throughout: who answers,
and at what cost? Leon, where are we on the request path?

**Listener pause: 2 seconds**

**Leon:** At the front — the API machinery itself.

**Teacher:** Checkpoint, Maya. One line: the question for every custom path.

**Listener pause: 3 seconds**

**Maya:** Who serves this path — and at what cost?

### Claiming a path

**Teacher:** [curious] An APIService claims a group and version path. One surface, two implementations — the hop is the difference. After the main
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

**Teacher:** [pleased] What is the hop that
makes aggregation different?

**Listener pause: 2 seconds**

**Leon:** The proxy hop.

**Teacher:** Before we move on — Leon, one line. Aggregation versus CRD.

**Listener pause: 3 seconds**

**Leon:** Aggregation proxies to an extension server; a CRD uses generic main
server storage.

### When aggregation earns its cost

**Teacher:** Prefer the generic path unless you need the rare behaviour. When does an aggregated API beat a CRD, Maya?

**Listener pause: 4 seconds**

**Maya:** [confident] Whenever you want richer behaviour than a plain object.

**Teacher:** [gentle] What do CRDs already give
you on the generic server, Leon?

**Listener pause: 4 seconds**

**Leon:** Create, read, update, delete, watch, and schema. Status and scale
when you enable them on the CRD.

**Teacher:** What kinds of behaviour only an extension server can supply?

**Listener pause: 5 seconds**

**Maya:** Custom storage, unusual subresources, or responses computed rather
than stored.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: when aggregation earns its
cost.

**Listener pause: 3 seconds**

**Maya:** Only for custom storage, unusual subresources, or computed responses.

### What a watch owes you

**Teacher:** Two watch behaviours by name. Resume points and expired history have different correct responses. Maya, does a BOOKMARK event carry an
object change?

**Listener pause: 3 seconds**

**Maya:** [uncertain] Yes — that is why you apply it.

**Teacher:** [gentle] What does it tell you about
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

**Teacher:** Checkpoint, Leon. One line: BOOKMARK versus Gone.

**Listener pause: 3 seconds**

**Leon:** BOOKMARK advances the resume point; Gone means rebuild — do not invent
missed events.

### What registering costs you

**Teacher:** First, a recall — Maya, remind us. What hop makes aggregation
different?

**Listener pause: 2 seconds**

**Maya:** The proxy hop to the extension server.

**Teacher:** Hold that. You register an APIService. Maya, what new dependency
sits on every matching request?

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

**Teacher:** Before we move on — Leon, one line. What registering an APIService
puts on the path.

**Listener pause: 3 seconds**

**Leon:** Extension latency, transport trust, and discovery blast radius.

### Policy without a network call

**Teacher:** In-process policy removes the webhook hop, not the design work. Leon, how do you enforce policy without putting a service on the
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

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: what ValidatingAdmissionPolicy
removes from the hot path.

**Listener pause: 3 seconds**

**Maya:** The webhook network hop — CEL runs in process.

### Safer, not free

**Teacher:** Safer is not free of scope, cost, and failure-policy decisions. Maya, does safer mean free of design work?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes. With no network dependency, we can apply it broadly
without careful scoping or cost limits.

**Teacher:** [gentle] Can ValidatingAdmissionPolicy mutate an
object?

**Listener pause: 2 seconds**

**Leon:** No. Validation only.

**Teacher:** What decisions still remain your job?

**Listener pause: 4 seconds**

**Maya:** Matching scope, expression cost, and failure policy.

**Teacher:** What did it remove, and what did it not?

**Listener pause: 3 seconds**

**Leon:** It removes the network dependency, not the design work.

**Teacher:** Checkpoint, Leon. One line: safer, not free.

**Listener pause: 3 seconds**

**Leon:** No network hop — but scope, cost, and failure policy remain design
work.

### Ask without becoming them

**Teacher:** You need to know whether some user can do something.
Leon, which review asks the authorizer about a named subject?

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

**Teacher:** Before we move on — Maya, one line. Access review versus
TokenReview.

**Listener pause: 3 seconds**

**Maya:** Access reviews ask the authorizer; TokenReview asks for identity.

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
