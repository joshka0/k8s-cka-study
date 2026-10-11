[u02-api-path] close · misleading
  problem: The sentence “Both leave a trace in the API response, and neither produces a pod” blurs admission with later reconciliation. An accepted workload write can lead to Pods after persistence.
  fix:     Both outcomes appear in the API response. A refused write produces no object, but an accepted workload object can lead to Pods after a controller acts.

[u03-reconciliation] open · imprecise
  problem: “A lost message does not matter” omits the recovery condition, and “the shared cache they read” makes every controller read sound cached. Recovery depends on level-based logic and another observation of current state.
  fix:     It covers how controllers notice work, the shared cache they usually read, and why level-based reconciliation can recover when current state is observed again.

[u05-crds] close · wrong
  problem: Custom resources do not wait on the same controllers as built-in objects. A CRD provides API storage, while behavior depends on code that watches its kind.
  fix:     They pass through the Kubernetes API and use its store. Any reconciliation behavior depends on a controller that watches their kind.

[u10-storage] close · wrong
  problem: CSI failures do not share the stated signature. Provisioning, binding, capacity, or topology can block scheduling before a Pod has a node or a mounting event. One command also cannot always identify the failed driver half.
  fix:     The CSI segment, then. A storage failure can block scheduling before a Pod has a node, or block setup after binding. First check whether the claim is bound and whether the Pod has a node name. Then decide whether the failed step is an object update, an RPC, or a mount. Read the events and the log that owns that step.

[u11-etcd-ha] open · imprecise
  problem: “An even member count buys you nothing” is absolute. Adding a member to make an odd cluster even adds no fault tolerance, but that is the supported claim.
  fix:     It covers quorum arithmetic, why adding one member to make an odd cluster even adds no fault tolerance, and what a snapshot omits.

[u11-etcd-ha] close · wrong
  problem: Healthy etcd does not acknowledge a write and then silently lose it. Without quorum, writes fail or time out. A timeout can leave the client uncertain whether the operation committed.
  fix:     Underneath the storage segment, then. Without quorum, etcd cannot commit new writes. It does not make acknowledged writes silently disappear. Check member health, endpoint status, and quorum before you trust a green front end. A backup you have not restored is only a hypothesis. Restore one in isolation before you need it.

[u13-bootstrap] open · wrong
  problem: A missing control-plane container does not mean nothing will restore it. The kubelet restarts a failed static Pod while its valid local manifest remains.
  fix:     A control-plane container is missing after a reboot. If its static Pod manifest is missing, the kubelet has no desired state from which to recreate it.

[u14-config-qos] close · imprecise
  problem: “The node still holds the rest” guarantees evidence that can expire or become unreachable. Kubelet and kernel logs are not durable object status.
  fix:     Evicted and OOMKilled often appear in object status. If they do not, inspect kubelet and kernel logs while that node evidence is still available.

[u02-api-path] close · style
  problem: “You are into the next one” restores the linked-list dependency and sends a standalone viewer to another module.
  fix:     If you got the expected object back and nothing happened afterwards, inspect the controller that should watch it.

[u04-workloads] open · style
  problem: The opening assumes a habit instead of showing a concrete failure or contradiction. “One of them is probably the one you needed” is also vague.
  fix:     Your Deployment replaces a Pod, and the Pod's name changes. The controller kept its promise, but the workload needed a stable identity.

[u08-networking] close · style
  problem: Three diagnostic questions end with periods. The punctuation makes spoken questions sound like declarations and weakens the sequence.
  fix:     Did the sandbox get an address? Can peers reach that address? Does traffic to the Service reach a ready endpoint?

[u12-scale-evidence] close · style
  problem: “Twelve modules” restores the count dependency that this rewrite must remove. The claim about every interviewer's intent is not a portable diagnostic rule.
  fix:     If you can name the request-path segment that owns a symptom, you have the next diagnostic question. That separates command recall from system understanding. Name the owner, choose its evidence, and test that layer before you move.

ACCURACY: 8 findings
WRITING: 4 findings
