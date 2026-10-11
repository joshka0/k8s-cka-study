# Listen-in classroom: The database API that outlived its first design

This is the classroom-dialogue version of An API You Cannot Take Back. The
learner listens to a teacher work with two students and answers mentally before
hearing their attempts. The students make only the plausible custom-resource
mistakes identified in the reviewed narration.

The reviewed CRD and operator narration is the factual authority. This is an
audio script, not a video script.

The dialogue follows one managed-database custom resource from creation through
reconciliation, version migration, and deletion. Commands, manifest fragments,
and literal finalizer strings are not spoken. CRD fields and API terms remain
spoken vocabulary after their behavior is introduced.

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

### The object that changes nothing

**Teacher:** [warm] A platform team registers a new managed-database kind. A
developer creates one database object. The API accepts and lists it, but no
database appears. Maya, is the CRD broken?

**Listener pause: 3 seconds**

**Maya:** Yes. If the custom object stores successfully, the CRD should create
the database.

**Teacher:** What does a CustomResourceDefinition provide by itself?

**Listener pause: 4 seconds**

**Leon:** It registers the API kind and schema. The API server can validate,
store, serve, list, and delete objects of that kind.

**Teacher:** What is one stored object of that kind called?

**Listener pause: 2 seconds**

**Maya:** A custom resource, or CR.

**Teacher:** What component turns that stored intent into a database?

**Listener pause: 3 seconds**

**Leon:** A controller that watches the custom resources and reconciles them.

**Teacher:** When does that controller become an operator?

**Listener pause: 3 seconds**

**Maya:** When it is domain-specific and encodes operational knowledge such as
the managed application's lifecycle and upgrades.

**Teacher:** So what did the successful create prove?

**Listener pause: 3 seconds**

**Leon:** The custom API worked. It did not prove the domain behavior existed or
ran.

### Preserve the request and report the gap

**Teacher:** The operator starts. The developer requests ten database replicas,
but the provider can supply only six. Maya, should the controller change the
request to six so the object matches reality?

**Listener pause: 4 seconds**

**Maya:** Yes. Reconciliation means making spec equal what was achieved.

**Teacher:** Which part of the object records desired state?

**Listener pause: 2 seconds**

**Leon:** spec.

**Teacher:** Which part records observed state?

**Listener pause: 2 seconds**

**Maya:** status.

**Teacher:** If the controller rewrites spec to six, what fact disappears?

**Listener pause: 4 seconds**

**Leon:** That the user still wants ten and the system is short by four.

**Teacher:** Where should the controller report the shortfall?

**Listener pause: 3 seconds**

**Maya:** In status, with a condition that explains why only six exist.

**Teacher:** Which status field can show that the controller evaluated the
current spec generation?

**Listener pause: 3 seconds**

**Leon:** observedGeneration.

**Teacher:** Does Kubernetes add conditions and observedGeneration to a CRD
automatically?

**Listener pause: 3 seconds**

**Leon:** Yes. They are standard status fields.

**Teacher:** Who must define and update them?

**Listener pause: 3 seconds**

**Leon:** [realizing] The API designer defines them, and the controller updates
them. Kubernetes does not add them for us.

### The published contract

**Teacher:** The API gains users. We rewrite the operator in another language.
Have we broken the custom API contract?

**Listener pause: 3 seconds**

**Maya:** Yes. The controller implementation is part of the operator API.

**Teacher:** What can clients actually observe?

**Listener pause: 5 seconds**

**Leon:** The schema, defaulting and validation, pruning, list and map behavior,
and how server-side apply merges fields.

**Teacher:** Can clients observe the language used inside the controller?

**Listener pause: 2 seconds**

**Maya:** No. We can replace the implementation if the observable API contract
and behavior remain sound.

**Teacher:** Which validation is easier to change after clients depend on it:
the private implementation or the published schema?

**Listener pause: 3 seconds**

**Leon:** The implementation. Publishing the CRD commits us to observable API
semantics.

### A new served version

**Teacher:** We introduce a new API version for managed databases. For a while,
the CRD serves both old and new versions. How many storage versions may it have?

**Listener pause: 3 seconds**

**Maya:** One for each served version.

**Teacher:** How many encodings does the API choose for new stored writes?

**Listener pause: 3 seconds**

**Leon:** Exactly one storage version.

**Teacher:** We move the storage marker to the new version. Maya, are all old
objects now rewritten?

**Listener pause: 3 seconds**

**Maya:** Yes. Changing the marker migrates the stored objects.

**Teacher:** What did the marker actually change?

**Listener pause: 4 seconds**

**Leon:** The encoding for new writes. Existing objects remain in their old
encoding and convert when read.

**Teacher:** Which path must remain available while those old encodings exist?

**Listener pause: 3 seconds**

**Maya:** Conversion between the served version and the stored encoding.

### Migration before retirement

**Teacher:** Leon, give the safe migration order. Start before the storage marker
moves.

**Listener pause: 7 seconds**

**Leon:** Serve both versions and verify conversion. Mark the new version for
storage. Rewrite every stored object. Confirm the new storage and old clients.
Then stop serving the old version.

**Teacher:** What status record must be cleared before we stop serving it?

**Listener pause: 3 seconds**

**Leon:** Um, the list of served versions?

**Teacher:** Which list records encodings that can still exist in storage?

**Listener pause: 3 seconds**

**Leon:** [realizing] status.storedVersions. Remove the old entry only after the
rewrite proves no object uses that encoding.

**Teacher:** What order follows that proof?

**Listener pause: 4 seconds**

**Maya:** Mark the old version unserved, then remove that version and its
conversion support.

**Teacher:** What happens if we remove conversion before old objects are
rewritten?

**Listener pause: 3 seconds**

**Maya:** Old objects can become unreadable. A marker change alone was not a
migration.

### Deletion that waits

**Teacher:** Months later, the developer deletes the database CR. The object
gets a deletionTimestamp but remains. Leon, does that mean garbage collection
failed?

**Listener pause: 3 seconds**

**Leon:** Yes. The owner reference must be blocking deletion.

**Teacher:** What does an owner reference request?

**Listener pause: 3 seconds**

**Maya:** Delete this dependent when its owner goes. Garbage collection follows
that relationship.

**Teacher:** What does a finalizer request?

**Listener pause: 3 seconds**

**Leon:** Keep this object until the responsible cleanup completes and its
finalizer key is removed.

**Teacher:** Must that responsible controller own the object?

**Listener pause: 3 seconds**

**Leon:** Yes. Only an owner may finalize its dependent.

**Teacher:** Is ownership the same relationship as cleanup responsibility?

**Listener pause: 3 seconds**

**Leon:** [realizing] No. A controller can own a finalizer without being the
object's owner.

**Teacher:** What likely causes our CR to remain Terminating?

**Listener pause: 4 seconds**

**Maya:** The finalizer's controller is down, crash-looping, or blocked while
cleaning the external database.

### Removing the evidence is not cleanup

**Teacher:** Maya, should we remove the finalizer now to clear the incident?

**Listener pause: 4 seconds**

**Maya:** Yes. The object will disappear, so deletion is complete.

**Teacher:** What happens to the external database if cleanup never ran?

**Listener pause: 3 seconds**

**Leon:** It remains, but the tracking object disappears.

**Teacher:** What must we determine before finalizer removal?

**Listener pause: 4 seconds**

**Maya:** Which controller owns the cleanup, why it is blocked, and whether the
external resource has actually been removed.

**Teacher:** When is manual removal defensible?

**Listener pause: 3 seconds**

**Leon:** After cleanup happened, either through the controller or through a
verified manual action. Removing the finalizer is a decision, not a fix.

### Reject before storage

**Teacher:** The root cause was an invalid database combination that the
controller noticed only after creation. Should that rule live only in the
controller next time?

**Listener pause: 3 seconds**

**Maya:** Yes. Domain validation belongs with domain reconciliation.

**Teacher:** By the time the controller complains, where is the invalid object?

**Listener pause: 3 seconds**

**Leon:** Already stored and visible to other clients.

**Teacher:** Where should a rule expressible from the object be enforced?

**Listener pause: 3 seconds**

**Maya:** In the CRD's API validation, so admission rejects the object before
storage.

**Teacher:** When is an operator worth this permanent contract and failure
handling?

**Listener pause: 4 seconds**

**Leon:** When work is continuous and must be watched, repaired, and reconciled
without a human. A fixed occasional sequence may be more honestly a Job or a
script.

### Listener reconstruction

**Teacher:** Your turn, without the students.

For the managed-database object, explain:

one — the roles of the CRD, CR, controller, and operator;

two — why desired state stays in spec while shortfalls go to status;

three — why changing the storage marker is not migration;

four — the safe order for retiring an API version; and

five — how finalizers differ from owner references and when manual removal is
safe.

**Listener pause: 35 seconds**

**Teacher:** [calm, measured] Check your reconstruction against this compressed
answer.

A CRD registers a kind and schema. A CR is one stored object. A controller
reconciles that object's spec. An operator is a domain-specific controller that
encodes ongoing operational knowledge. The CRD alone gives API behavior, not
domain behavior. Users write desired state in spec. The controller reports
observed state, conditions, and observedGeneration in status without erasing
the unmet request.

A CRD may serve several versions but has exactly one storage version for new
writes. Moving that marker does not rewrite old objects. Serve both versions,
verify conversion, select the new storage version, rewrite all objects, confirm
storage and old clients, remove the old entry from status.storedVersions, stop
serving it, and only then remove its conversion support.

Owner references request garbage collection when an owner disappears. A
finalizer delays removal until its responsible controller completes cleanup.
Force-removing it can orphan the external database. Diagnose the cleanup owner
and remove the key only after cleanup is verified. Express object-only validity
rules at the API so bad intent is rejected before storage.

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

After one listen, ask the learner to reconstruct the custom API lifecycle from
registration through version retirement and finalization in ninety seconds.
Score causal ordering and boundary discrimination, not verbatim recall or
learner preference.
