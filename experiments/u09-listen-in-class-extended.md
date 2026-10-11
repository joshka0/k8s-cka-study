# Listen-in classroom, extended: The name that was queried five ways

Extended format of the u09 classroom script. Same facts, same cast, same
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

### The name the client did not send

**Teacher:** [warm] A payment Pod looks up an internal Service name. Each lookup
is slow, and the answer sometimes points to a backend that has gone. The name
the application typed is not always the name that left the Pod. The name the application typed is not always the name that left the Pod. Maya, what
DNS query did the Pod send?

**Listener pause: 3 seconds**

**Maya:** Exactly the name the application supplied.

**Teacher:** What inside the Pod can transform a partial name before any query
leaves?

**Listener pause: 4 seconds**

**Leon:** Its resolver configuration: the DNS endpoint, search domains, and the
ndots option.

**Teacher:** Who writes that resolver configuration for the Pod?

**Listener pause: 2 seconds**

**Maya:** The kubelet.

**Teacher:** What is our first evidence, then?

**Listener pause: 3 seconds**

**Leon:** Read the actual resolver configuration inside the affected Pod and
derive the queries it will emit.

**Teacher:** Checkpoint, Maya. One line: first evidence for a DNS incident.

**Listener pause: 3 seconds**

**Maya:** The Pod's resolver configuration — endpoint, search list, and ndots.

### A complete-looking name can expand

**Teacher:** The application name contains several dots and looks fully
qualified. The Pod's ndots threshold is higher than that count. Dots do not make a name absolute by themselves. Maya, does the
resolver try the name as absolute first?

**Listener pause: 4 seconds**

**Maya:** Yes. Dots in the name mean the search list is skipped.

**Teacher:** What does ndots compare?

**Listener pause: 3 seconds**

**Leon:** The number of dots in the name with the configured threshold.

**Teacher:** If the name falls below that threshold, what happens first?

**Listener pause: 4 seconds**

**Leon:** The resolver appends each search domain and sends those expanded
queries before trying the absolute name.

**Teacher:** What does each unsuccessful expansion cost?

**Listener pause: 3 seconds**

**Maya:** A real failed round trip. Across uncached requests, that becomes
latency and DNS load.

**Teacher:** How can a client mark the name as absolute and stop expansion?

**Listener pause: 3 seconds**

**Maya:** Use the DNS root terminator at the end, commonly called a trailing
dot. Then the resolver sends one absolute query.

**Teacher:** Before we move on — Leon, one line. What does ndots control?

**Listener pause: 3 seconds**

**Leon:** Whether a dotted name expands through the search list before the
absolute query.

### The first cache

**Teacher:** The configured DNS endpoint belongs to a cache running on every
node. A local cache is another surface, not pure truth. What feature is that?

**Listener pause: 2 seconds**

**Leon:** NodeLocal DNSCache.

**Teacher:** What two pressures can it reduce?

**Listener pause: 4 seconds**

**Maya:** Query load on CoreDNS and connection-tracking pressure on the node.

**Teacher:** Does adding it move the Pod closer to unquestionable truth?

**Listener pause: 3 seconds**

**Maya:** Yes. A local cache only removes latency and failure modes.

**Teacher:** What new surfaces did we add?

**Listener pause: 4 seconds**

**Leon:** Another cache, listener, and configuration layer between the
application and the authoritative state.

**Teacher:** So can stale data live there even while CoreDNS is correct?

**Listener pause: 2 seconds**

**Leon:** Yes.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: what NodeLocal DNSCache
adds and costs.

**Listener pause: 3 seconds**

**Maya:** It cuts central load — and inserts another cache that can go stale.

### DNS depends on Service routing

**Teacher:** DNS timeouts can be routing, not CoreDNS death. Without NodeLocal DNSCache, what kind of address does a Pod normally
query for cluster DNS?

**Listener pause: 3 seconds**

**Maya:** The ClusterIP of the DNS Service.

**Teacher:** If that Service route breaks, what symptom does the application
report?

**Listener pause: 3 seconds**

**Leon:** A DNS timeout.

**Teacher:** Does that prove CoreDNS itself failed?

**Listener pause: 3 seconds**

**Leon:** Yes. The DNS endpoint did not answer.

**Teacher:** What bypass test separates the server from its Service route?

**Listener pause: 4 seconds**

**Maya:** Ask a CoreDNS Pod address directly. If that succeeds while the DNS
Service address fails, CoreDNS is reachable but Service routing is broken.

**Teacher:** What underlying dependency made the symptom confusing?

**Listener pause: 3 seconds**

**Leon:** Name resolution itself depends on the Service data plane before the
query reaches CoreDNS.

**Teacher:** Checkpoint, Leon. One line: how do you separate CoreDNS from its
Service route?

**Listener pause: 3 seconds**

**Leon:** Query a CoreDNS Pod address directly and compare it with the Service
address.

### Ready proves only readiness

**Teacher:** The CoreDNS Pods report Ready. Ready is one local signal, not end-to-end proof. Maya, does that clear the DNS path
and the stale-answer complaint?

**Listener pause: 3 seconds**

**Maya:** Yes. Ready proves CoreDNS, its upstreams, caches, and Service route are
healthy.

**Teacher:** What did its readiness check actually establish for the kubernetes
plugin at startup?

**Listener pause: 4 seconds**

**Leon:** That the readiness check passed, including the plugin's initial API
sync.

**Teacher:** Did it test the client's resolver policy?

**Listener pause: 2 seconds**

**Maya:** No.

**Teacher:** Did it test Service routing from this Pod or NodeLocal cache
freshness?

**Listener pause: 3 seconds**

**Maya:** No.

**Teacher:** Did it prove the API watch stayed fresh or that an external
upstream remained healthy later?

**Listener pause: 3 seconds**

**Leon:** No.

**Teacher:** Before we move on — Maya, one line. What CoreDNS Ready does not
prove.

**Listener pause: 3 seconds**

**Maya:** Client path, later watch freshness, upstreams, or caches.

### Answers from watched state

**Teacher:** First, a recall — Leon, remind us. What does CoreDNS Ready prove
at plugin startup?

**Listener pause: 2 seconds**

**Leon:** The readiness check passed, including the initial API sync.

**Teacher:** Hold that. Leon, does the CoreDNS kubernetes plugin query the API
server for every DNS request?

**Listener pause: 3 seconds**

**Leon:** Yes. That keeps every record current.

**Teacher:** What local source does it use instead?

**Listener pause: 3 seconds**

**Maya:** Watched Service and EndpointSlice state.

**Teacher:** The watch stalls after a backend is removed. Does CoreDNS become
unready?

**Listener pause: 3 seconds**

**Maya:** Yes. Stale watch state should stop DNS.

**Teacher:** What can it continue doing?

**Listener pause: 4 seconds**

**Leon:** [realizing] Answer from its frozen local view. It can confidently
return stale records for a backend that no longer exists.

**Teacher:** Which signal must we inspect to distinguish a dead server from a
stale watch?

**Listener pause: 4 seconds**

**Maya:** CoreDNS logs and watch behavior, compared with current Service and
EndpointSlice state.

**Teacher:** Checkpoint, Leon. One line: where kubernetes answers come from, and
what a stalled watch can do.

**Listener pause: 3 seconds**

**Leon:** Watched Service and EndpointSlice state — a stall can return stale
records while still answering.

### Configuration is not compiled order

**Teacher:** We suspect cache placement in CoreDNS. Leon proposes moving the
cache line above the kubernetes line in the Corefile. Corefile lines do not reorder compiled plugin execution. Will that reorder plugin
execution?

**Listener pause: 3 seconds**

**Leon:** Yes. The Corefile runs top to bottom.

**Teacher:** What does the Corefile control?

**Listener pause: 3 seconds**

**Maya:** Which plugins, server blocks, and zones are configured.

**Teacher:** Where does execution order come from?

**Listener pause: 3 seconds**

**Leon:** [realizing] A fixed order compiled into CoreDNS — the build reads it
from a file called plugin.cfg.

**Teacher:** What would genuinely change that order?

**Listener pause: 3 seconds**

**Maya:** Rebuilding CoreDNS with a different plugin.cfg. Moving Corefile lines
alone does not.

**Teacher:** Carry this one forward, Maya. This line is the hinge for what comes next. One line: Corefile versus plugin
order.

**Listener pause: 3 seconds**

**Maya:** Corefile selects and configures; compiled plugin.cfg sets execution
order.

### Stay inside or leave the server

**Teacher:** The queried name is outside the cluster zone. The kubernetes plugin
declines it. Fallthrough and forwarding have different owners. Is that forwarding?

**Listener pause: 3 seconds**

**Maya:** Yes. It forwards to the next CoreDNS plugin.

**Teacher:** What is movement to the next local plugin called?

**Listener pause: 2 seconds**

**Leon:** Fallthrough.

**Teacher:** What is forwarding?

**Listener pause: 3 seconds**

**Leon:** Sending the query out to a different upstream DNS server.

**Teacher:** Why does the distinction matter in our incident?

**Listener pause: 4 seconds**

**Maya:** A local chain decision and an unreachable upstream have different
paths, logs, and owners.

**Teacher:** Checkpoint, Leon. One line: fallthrough versus forwarding.

**Listener pause: 3 seconds**

**Leon:** Fallthrough stays in the local plugin chain; forwarding leaves for an
upstream server.

### Reconstruct the layered test

**Teacher:** First, a recall — Maya, remind us. What first evidence do we read
inside the client Pod?

**Listener pause: 2 seconds**

**Maya:** Its resolver configuration — endpoint, search domains, ndots.

**Teacher:** Hold that. Give the diagnostic order for our slow, stale lookup.
Start inside the client Pod.

**Listener pause: 7 seconds**

**Leon:** Read its resolver configuration and account for search expansion.
Test the configured DNS endpoint. Compare the DNS Service address with a direct
CoreDNS Pod address. Inspect the Corefile and CoreDNS logs. Compare watched
Service and EndpointSlice state. Then account for NodeLocal and CoreDNS caches.

**Teacher:** Which observation explains the slowness?

**Listener pause: 3 seconds**

**Maya:** ndots-driven search expansions that fail before the absolute query.

**Teacher:** Which observation explains the removed backend still resolving?

**Listener pause: 3 seconds**

**Leon:** A stale watched view or cache, located by comparing each layer with
current API state.

**Teacher:** Before we move on — Maya, one line. What separates the slow
symptom from the stale symptom?

**Listener pause: 3 seconds**

**Maya:** Search expansion explains slowness; a stale watch or cache explains
the dead backend.

### Listener reconstruction

**Teacher:** Your turn, without the students.

For the slow, stale Service lookup, explain:

one — how resolver search domains and ndots change the query that leaves;

two — how an absolute name stops that expansion;

three — why the DNS Service route and NodeLocal cache are separate layers;

four — why CoreDNS Ready and Corefile line order prove less than they appear;
and

five — how watched state, fallthrough, and forwarding produce different failure
paths.

**Listener pause: 35 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

The kubelet writes the Pod's resolver configuration. Search domains and ndots
can expand one complete-looking name into several failed queries before the
absolute query. Marking the name as absolute with the trailing-dot convention
ends search expansion.

The configured endpoint may be NodeLocal DNSCache or the ClusterIP of the DNS
Service. NodeLocal reduces central and conntrack load but adds a cache and
configuration surface. A direct CoreDNS Pod test separates CoreDNS from its
Service route. CoreDNS Ready proves its readiness check and initial sync, not
the client path, later watch freshness, upstreams, or caches.

The kubernetes plugin answers from watched Service and EndpointSlice state, so a
stalled watch can return stale records while the server stays available. The
Corefile selects and configures plugins; compiled order controls their sequence.
Fallthrough stays inside the local chain. Forwarding leaves for an upstream.
Test resolver policy, Service routing, CoreDNS, watched state, and caches as
separate layers.

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

After one listen, ask the learner to trace one query from client expansion
through Service routing, CoreDNS watched state, and caches in ninety seconds.
Score causal ordering and boundary discrimination, not verbatim recall or
learner preference.
