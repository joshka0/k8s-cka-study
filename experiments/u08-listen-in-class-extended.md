# Listen-in classroom, extended: DNS resolves, traffic stops

Extended format of the u08 classroom script. Same facts, same cast, same
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

### One timeout, three owners

**Teacher:** [warm] Name resolution and packet delivery are
different owners — and the trap is treating one success as both. Name resolution and packet delivery are different owners. Maya, has
DNS proved the Kubernetes network is healthy?

**Listener pause: 3 seconds**

**Maya:** Yes. Once the name resolves, the network path exists.

**Teacher:** What separate problems remain after name resolution?

**Listener pause: 5 seconds**

**Leon:** The Pod must be reachable, the Service must identify usable backends,
and a Service data plane must translate the virtual address to one backend.

**Teacher:** Which three owners map to those problems?

**Listener pause: 5 seconds**

**Maya:** The network implementation through CNI for Pod reachability, the
EndpointSlice controller for backends and conditions, and kube-proxy or its
replacement for Service translation.

**Teacher:** Good. We will test those three owners in that order. Checkpoint, Leon. One line: the three owners after DNS succeeds.

**Listener pause: 3 seconds**

**Leon:** The network implementation, through CNI, owns Pod reachability; the
EndpointSlice controller owns backends; the Service data plane owns
translation.

### How the Pod got an address

**Teacher:** Start with how the Pod even received an address. Leon, is a CNI
plugin a long-running network service?

**Listener pause: 3 seconds**

**Leon:** Yes. The kubelet calls the CNI service whenever it needs an address.

**Teacher:** What kind of thing is the CNI plugin itself?

**Listener pause: 3 seconds**

**Maya:** A short-lived program.

**Teacher:** What shape does its execution contract have?

**Listener pause: 5 seconds**

**Maya:** The caller starts it, puts the requested operation in the
environment — CNI calls that marker CNI_COMMAND — sends JSON configuration on
standard input, reads a JSON result from standard output, and the plugin
exits.

**Teacher:** Where does it run relative to the Pod?

**Listener pause: 3 seconds**

**Leon:** In the host network domain, not inside the container.

**Teacher:** Products can also run a long-lived node agent. Is that agent the
CNI plugin?

**Listener pause: 3 seconds**

**Leon:** Yes. The names refer to the same process.

**Teacher:** What is the distinction?

**Listener pause: 3 seconds**

**Maya:** The plugin is the invoked CNI program. A product's node agent is a
separate long-running component the plugin may use.

**Teacher:** Before we move on — Maya, one line. What is the CNI plugin?

**Listener pause: 3 seconds**

**Maya:** A short-lived host program invoked for one network operation — not
the long-running agent.

### Who executes the plugin

**Teacher:** The runtime path is where CNI detail lives. Maya, who directly executes that CNI program for our Pod?

**Listener pause: 3 seconds**

**Maya:** The kubelet.

**Teacher:** What request does the kubelet make first?

**Listener pause: 3 seconds**

**Leon:** It asks the CRI runtime to create the Pod sandbox.

**Teacher:** What do common runtimes do next?

**Listener pause: 4 seconds**

**Leon:** They establish the network namespace, load CNI configuration, and
execute the plugin chain.

**Teacher:** Does the CNI specification require configuration to live in one
particular file path?

**Listener pause: 3 seconds**

**Maya:** Yes. CNI always reads a fixed directory.

**Teacher:** What is required instead?

**Listener pause: 3 seconds**

**Leon:** [realizing] The execution contract and configuration content. CNI does
not require one storage location for that configuration.

**Teacher:** Where should we look first, then deeper, when setup fails?

**Listener pause: 4 seconds**

**Maya:** Start with Pod events and kubelet logs. Use runtime logs for plugin
detail because the runtime executed the chain.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: who executes CNI, and where
to look when it fails.

**Listener pause: 3 seconds**

**Leon:** The runtime executes the plugin chain — events first, runtime logs
for detail.

### Where the address comes from

**Teacher:** A direct Pod test is the first split. Does the main network plugin always allocate the Pod address by
itself?

**Listener pause: 3 seconds**

**Leon:** Yes. Address management is part of every CNI network plugin.

**Teacher:** What optional delegation can it use?

**Listener pause: 3 seconds**

**Maya:** An IPAM plugin can receive the configuration and return addresses,
gateways, routes, and DNS data.

**Teacher:** Is IPAM delegation universal?

**Listener pause: 2 seconds**

**Maya:** No. Some implementations allocate through their own node agent.

**Teacher:** Our checkout Pod has an address. A direct connection to that address
from the failing client succeeds. What layer has that test largely cleared?

**Listener pause: 4 seconds**

**Leon:** Basic Pod reachability from that source, including the route and the
destination process on that port.

**Teacher:** Checkpoint, Maya. One line: what a successful direct Pod test
clears.

**Listener pause: 3 seconds**

**Maya:** Basic Pod reachability from that source — route and listening process.

### Membership and readiness differ

**Teacher:** Now inspect the checkout EndpointSlice. Membership and readiness
are easy to collapse. Membership and readiness are easy to collapse. What puts a selector-matched Pod address into it?

**Listener pause: 3 seconds**

**Maya:** A passing readiness probe.

**Teacher:** Which relationship supplies membership?

**Listener pause: 3 seconds**

**Leon:** The Service selector matching the Pod labels.

**Teacher:** What does readiness change instead?

**Listener pause: 3 seconds**

**Maya:** The endpoint's ready condition.

**Teacher:** The Pod becomes unready. Does its address have to disappear from the
EndpointSlice?

**Listener pause: 3 seconds**

**Maya:** Yes. Readiness removes it.

**Teacher:** What can remain?

**Listener pause: 3 seconds**

**Leon:** The address remains with ready false, and Service data planes normally
avoid it.

**Teacher:** Which Service field changes that normal treatment of unready
addresses?

**Listener pause: 2 seconds**

**Leon:** publishNotReadyAddresses.

**Teacher:** Before we move on — Leon, one line. Membership versus readiness.

**Listener pause: 3 seconds**

**Leon:** Selector puts the address in; readiness flips the ready condition.

### Permission has two sides

**Teacher:** First, a recall — Maya, remind us. What three owners remain after
DNS succeeds?

**Listener pause: 2 seconds**

**Maya:** The network implementation for Pod reachability, the EndpointSlice
controller for backends, the Service data plane for translation.

**Teacher:** Hold that. The EndpointSlice has a ready backend. A destination
NetworkPolicy permits ingress from our client. Does that policy create the
route?

**Listener pause: 3 seconds**

**Maya:** Yes. An allow rule opens the path between the Pods.

**Teacher:** What does NetworkPolicy supply: reachability or permission?

**Listener pause: 3 seconds**

**Leon:** Permission. Routing must already exist.

**Teacher:** The source is isolated by an egress policy. Is destination ingress
permission enough?

**Listener pause: 3 seconds**

**Leon:** Yes. Ingress is decided at the destination.

**Teacher:** What must the source policy also do?

**Listener pause: 3 seconds**

**Maya:** Permit the egress flow. Applicable policies combine additively within
each direction, but both isolated sides must allow the connection.

**Teacher:** What does podSelector choose inside a NetworkPolicy?

**Listener pause: 2 seconds**

**Leon:** The Pods the policy protects.

**Teacher:** What does an empty podSelector with no ingress rules mean?

**Listener pause: 3 seconds**

**Maya:** Default-deny ingress for every Pod in that policy's namespace.

**Teacher:** The API accepted the policy. Does core NetworkPolicy report whether
the network implementation enforces it?

**Listener pause: 3 seconds**

**Maya:** Yes. A green status confirms enforcement.

**Teacher:** What happens if the implementation lacks policy support?

**Listener pause: 4 seconds**

**Leon:** [realizing] The object can be stored with no core enforcement status,
while traffic remains open. Acceptance does not prove enforcement.

**Teacher:** Checkpoint, Maya. One line: what NetworkPolicy is and is not.

**Listener pause: 3 seconds**

**Maya:** Permission on top of an existing route — not a route, and not proof
of enforcement.

### The Service data plane

**Teacher:** Direct Pod traffic works and policy allows it, but ClusterIP still
times out. Direct Pod traffic worked; ClusterIP still times out. Which owner remains?

**Listener pause: 3 seconds**

**Maya:** The Service data plane: kube-proxy or a replacement.

**Teacher:** Which Linux implementations can kube-proxy use?

**Listener pause: 3 seconds**

**Leon:** iptables, IPVS, or nftables.

**Teacher:** Is IPVS still a recommended choice for its lookup cost?

**Listener pause: 3 seconds**

**Maya:** [confident] Yes — order-one lookup is why people pick it.

**Teacher:** [gentle] The slogan is right about lookup and incomplete as a
recommendation. Kubernetes one point thirty-five deprecated kube-proxy's IPVS
mode. It still runs and warns at startup. What is the recommended Linux
replacement?

**Listener pause: 3 seconds**

**Leon:** [realizing] nftables.

**Teacher:** And compare data planes on more than lookup: update cost under
churn, locality, kernel support, and Service semantics.

Is an eBPF data plane another kube-proxy mode?

**Listener pause: 3 seconds**

**Leon:** Yes, alongside those three.

**Teacher:** What is it instead?

**Listener pause: 3 seconds**

**Maya:** A separate implementation that can replace kube-proxy.

**Teacher:** What usually stays stable when the implementation changes?

**Listener pause: 3 seconds**

**Maya:** The Service API and its EndpointSlices, though exact behavior still
depends on the implementation.

**Teacher:** What requirement survives even if eBPF replaces netfilter rules?

**Listener pause: 4 seconds**

**Leon:** Something must remember which connection a returning packet belongs
to.

**Teacher:** Does eBPF universally remove kernel conntrack?

**Listener pause: 3 seconds**

**Leon:** Yes. Connection tracking disappears.

**Teacher:** Where can that state live instead, or still remain?

**Listener pause: 4 seconds**

**Maya:** Some implementations use BPF maps. Others retain kernel conntrack for
certain traffic or modes. We must check the product and mode.

**Teacher:** Carry this one forward, Leon. This line is the hinge for what comes next. One line: what the Service data plane
must still do under any implementation.

**Listener pause: 3 seconds**

**Leon:** Translate the virtual address to a backend — and remember connection
identity for return traffic.

### The headless counterexample

**Teacher:** First, a recall — Maya, remind us. Which owner translates a
ClusterIP?

**Listener pause: 2 seconds**

**Maya:** The Service data plane — kube-proxy or its replacement.

**Teacher:** Hold that. Suppose checkout were headless, with clusterIP set to
None. Would kube-proxy translate a virtual Service address?

**Listener pause: 3 seconds**

**Maya:** Yes. Headless changes DNS but keeps Service load balancing.

**Teacher:** What does DNS return instead?

**Listener pause: 3 seconds**

**Leon:** Endpoint records rather than one virtual Service address.

**Teacher:** Who chooses an endpoint then?

**Listener pause: 3 seconds**

**Maya:** The client or its resolver.

**Teacher:** Does that guarantee even balancing?

**Listener pause: 3 seconds**

**Maya:** No. Selection depends on resolver and application behavior. Stable
per-Pod DNS can use this shape, but kube-proxy is not balancing the Service.

**Teacher:** Checkpoint, Leon. One line: what headless removes from the path.

**Listener pause: 3 seconds**

**Leon:** The virtual Service address and kube-proxy load balancing — DNS
returns endpoints instead.

### Locate the timeout

**Teacher:** Give the shortest diagnostic split for our normal ClusterIP
timeout. Start with API objects. One split separates Pod path from Service translation.

**Listener pause: 6 seconds**

**Leon:** Check the Service selector and ports. Check its EndpointSlices and
ready conditions. Confirm the process listens on the endpoint port. From the
same source, test a ready Pod address and port directly.

**Teacher:** If direct Pod traffic works, where do we look?

**Listener pause: 3 seconds**

**Maya:** The Service data plane and its programmed translation.

**Teacher:** If direct Pod traffic fails?

**Listener pause: 3 seconds**

**Leon:** Pod routing, MTU, and NetworkPolicy permission, using the logs of the
network implementation and runtime path.

**Teacher:** What three concepts must stay separate?

**Listener pause: 3 seconds**

**Maya:** Reachability, permission, and Service translation.

**Teacher:** Before we move on — Maya, one line. How does the direct Pod test
split the failure?

**Listener pause: 3 seconds**

**Maya:** Success points to Service translation; failure points to Pod path or
policy.

### Listener reconstruction

**Teacher:** Your turn, without the students.

For the checkout timeout, explain:

one — the three owners of Pod reachability, endpoint state, and Service
translation;

two — how the runtime executes CNI and how a Pod can get its address;

three — why selector membership differs from endpoint readiness;

four — why NetworkPolicy permission is not a route and may need both directions;
and

five — how a direct Pod test divides Pod-path failure from Service-data-plane
failure.

**Listener pause: 35 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

The network implementation creates Pod reachability through the CNI execution
contract. The EndpointSlice controller records selector-matched addresses and
their conditions. kube-proxy or its replacement translates a Service address
to usable endpoints. The kubelet asks the CRI runtime for a sandbox; common
runtimes execute short-lived CNI programs. Address allocation may be delegated
to IPAM or handled by an implementation's node agent.

Label matching supplies EndpointSlice membership. Readiness changes the ready
condition, so an unready address can remain present and normally unused.
NetworkPolicy grants permission and creates no route. Destination ingress and
isolated source egress must both permit the flow. API acceptance alone does not
prove enforcement.

When DNS resolves but ClusterIP times out, inspect Service selection, ports,
EndpointSlices, and the listening process. Test a ready Pod address from the
same source. Success points toward Service translation. Failure points toward
Pod routing, MTU, or policy. Keep reachability, permission, and translation
separate.

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

After one listen, ask the learner to split the ClusterIP timeout among Pod
reachability, policy permission, endpoint condition, and Service translation in
ninety seconds. Score causal ordering and boundary discrimination, not verbatim
recall or learner preference.
