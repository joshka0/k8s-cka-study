# Technical review: modules 07 and 08

Baseline: Kubernetes v1.36. The latest published CKA curriculum is v1.35. [Kubernetes v1.36 release](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/), [CKA curriculum](https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.35.pdf).

[u07] node-order · wrong
  claim:   “Once a Pod is bound, the order on the node is fixed. The sandbox is created first. Its network is attached. Volumes are mounted.”
  problem: Kubernetes does not define this total order. Volume work runs asynchronously. The kubelet waits for required mounts before container startup. Sandbox networking and required storage must both become ready, but the API does not promise the narrated sequence. The fixed-sequence visual is also wrong. [Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
  fix:     “Node setup is not one fixed sequence. Before containers start, the sandbox network and required volumes must be ready. Init containers then run to completion in order. Application containers start after them.”

[u07] sandbox-why · misleading
  claim:   “A Pod can therefore have a perfectly healthy runtime and no network at all — the sandbox came up, the attachment did not.”
  problem: A successful CRI RunPodSandbox must return a ready sandbox. An initial network failure normally prevents application-container startup and leaves the Pod in ContainerCreating. The visual must not show a healthy sandbox with running application containers after initial attachment failure. Only the Pod network namespace is the portable contract; IPC and UTS details depend on OS, host namespace options, and runtime design. [CRI specification](https://github.com/kubernetes/kubernetes/blob/v1.36.0/staging/src/k8s.io/cri-api/pkg/apis/runtime/v1/api.proto)
  fix:     “On a typical Linux runtime, the sandbox anchors the Pod network namespace. Containers share that namespace and use localhost. If initial network setup fails, application containers do not start. A running Pod can lose network later.”

[u07] four-boundaries · misleading
  claim:   “Each has its own failure mode and its own logs, so knowing which boundary broke tells you which log to open.”
  problem: OCI is a specification, not a component with its own log. Short-lived CNI plugin output is normally captured by the runtime. Kubelet events and logs can also contain CRI, CNI, and CSI failures. [Kubernetes network plugins](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/)
  fix:     “Each boundary has its own failure signature. Pod events and kubelet logs show CRI and CSI call failures. Runtime logs usually hold sandbox, CNI, and OCI detail. CSI node-plugin logs hold storage detail.”

[u07] cri-vs-oci · imprecise
  claim:   “The kubelet speaks CRI and only CRI.”
  problem: This is true only for container and image runtime operations. The kubelet also communicates with the API server, CSI plugins, device plugins, and other node integrations. Kubernetes v1.36 requires CRI v1 for the runtime boundary. [Container runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/)
  fix:     “For container and image operations, the kubelet uses CRI. CRI exposes runtime and image services over gRPC. The kubelet does not call OCI runtimes such as runc directly.”

[u07] phase-is-not-health · wrong
  claim:   “Running is a phase. It means the process is alive. Ready is a separate signal, and it means the application will accept traffic.”
  problem: Pod phase Running means the Pod is bound, all containers are created, and at least one container is running, starting, or restarting. It does not prove that a particular process is alive or healthy. Ready reports configured readiness checks and gates. It cannot guarantee that the application will accept real traffic. [Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
  fix:     “Running is a Pod phase. It means the Pod is bound, all containers are created, and at least one is running, starting, or restarting. It does not prove application health. Ready means the configured checks and readiness gates pass, so matching Services can use the Pod.”

[u07] three-probes · wrong
  claim:   “Startup gates the other two while a slow application initialises, and nothing else runs until it passes. Liveness restarts the container when it fails. Readiness removes the Pod from endpoints without restarting anything.”
  problem: A startup probe gates only liveness and readiness probes for the same container. The container continues to run. Probe failure takes effect after failureThreshold. Readiness normally changes the EndpointSlice endpoint’s ready condition; it does not remove the endpoint from the slice. [Probe behavior](https://kubernetes.io/docs/concepts/workloads/pods/probes/), [EndpointSlice conditions](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
  fix:     “A startup probe gates liveness and readiness probes for the same container. The container keeps running. After its failure threshold, a failed liveness probe stops the container. Its restart policy controls what follows. A failed readiness probe marks the Pod not ready. It does not remove the address from its EndpointSlice.”

[u07] running-no-traffic · wrong
  claim:   “Is the Pod in the EndpointSlice. Does the Service selector actually match its labels, and does the target port match the container port.”
  problem: For a selector Service, label matching controls EndpointSlice membership. Readiness controls an endpoint condition. The selector therefore comes before the EndpointSlice check. A numeric targetPort can work without a declared containerPort; it must reach the port where the process actually listens. [Services](https://kubernetes.io/docs/concepts/services-networking/service/), [EndpointSlices](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
  fix:     “Does the Service selector match the Pod labels. Does an EndpointSlice contain the Pod IP with ready true. Does targetPort reach the port where the process listens. Check those links in that order.”

[u07] running-no-traffic · omission
  claim:   “Each link is checkable in a second, and the first one that fails is the answer.”
  problem: The script provides no actual checks. The CKA is performance-based and tests service, networking, node, and output-stream troubleshooting. [CKA objectives](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/)
  fix:     “Run kubectl describe pod and read its events. List EndpointSlices with the Service-name label. Inspect the Service selector and ports. Read current and previous output with kubectl logs and kubectl logs --previous.”

[u07] termination · misleading
  claim:   “The PreStop hook runs, then TERM is delivered. At the same time, not before, the Pod is being removed from endpoints. A PreStop sleep is a real fix for that, not a hack.”
  problem: The runtime can use an image STOPSIGNAL or configured stop signal instead of TERM. A terminating endpoint normally remains in its EndpointSlice with terminating:true and ready:false. Service proxies can still use a serving terminating endpoint when all endpoints terminate. A fixed sleep can reduce a race, but it cannot prove propagation or close the overlap. The visual must not show that guarantee. [Pod termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/), [terminating endpoints](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
  fix:     “Deletion sets a timestamp and starts the grace period. The EndpointSlice controller marks the endpoint terminating while the kubelet starts local shutdown. A PreStop hook runs before the runtime sends the configured stop signal. These paths overlap. A bounded delay can reduce the race, but it cannot prove propagation. The application must drain work. The runtime force-kills remaining processes at expiry.”

[u07] stale-status · imprecise
  claim:   “The node lease has to expire, the node controller has to mark the node unreachable, and only then do other controllers react.”
  problem: The Lease object does not expire itself. The kubelet stops updating renewTime and Node status. After the configured monitoring grace period, the node controller marks Ready as Unknown and adds the unreachable taint. Eviction then depends on tolerations and controller policy. [Node heartbeats](https://kubernetes.io/docs/concepts/architecture/nodes/), [Leases](https://kubernetes.io/docs/concepts/architecture/leases/)
  fix:     “The kubelet updates Node status and Lease renewTime. If updates stop, the stored Pod phase can remain Running. After the monitoring grace period, the node controller marks the Node Ready condition Unknown and adds the unreachable taint. Eviction follows taint tolerations and controller policy.”

[u07] close · misleading
  claim:   “The Pod has a node, the node accepted it, and something on that node did not finish. The API tells you very little, because the API is only repeating what the kubelet last said.”
  problem: Binding does not prove kubelet admission or acceptance. The API also stores conditions and events from several components. Those often identify scheduling, mount, image, sandbox, and probe failures.
  fix:     “A failure here often means the Pod is bound and node-side setup did not finish. Binding does not prove the kubelet admitted the Pod. The API stores conditions, events, and last reported status. Node logs show the current failure.”

[u08] locate · imprecise
  claim:   “A container exists on a node and it has no address yet. This module is how it gets one.”
  problem: The network address belongs to the Pod sandbox network namespace, not to each container. Standard application containers start after sandbox networking succeeds. Host-network Pods do not receive normal CNI attachment. [Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
  fix:     “The runtime is creating a Pod sandbox, and that sandbox needs network. CNI configures the network before application containers start. Host-network Pods use the node network instead.”

[u08] three-owners · imprecise
  claim:   “CNI makes Pods reachable — it gives them addresses and routes. EndpointSlices record which backends are ready.”
  problem: CNI defines an execution contract. The complete network implementation supplies addressing and reachability, and it can delegate IP allocation. EndpointSlice is an API object, not an active owner. The EndpointSlice controller records selector-matched endpoints and their conditions, including unready endpoints. [Network plugins](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/), [EndpointSlices](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
  fix:     “The network implementation configures Pod reachability. The EndpointSlice controller records selector-matched backends and their conditions. kube-proxy or a replacement data plane turns Service addresses into backend traffic. These are separate owners.”

[u08] readiness-is-the-gate · wrong
  claim:   “What puts a Pod's address into an EndpointSlice is readiness. Readiness, and nothing else. It changes EndpointSlice membership.”
  problem: For selector Services, label matching controls membership. Unready Pod addresses remain in EndpointSlices with ready:false. publishNotReadyAddresses also overrides normal readiness treatment. The visual must show the endpoint condition changing, not the address being held outside the slice. [EndpointSlice API](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/)
  fix:     “For a selector Service, label matching puts a Pod address in an EndpointSlice. Readiness normally sets the endpoint ready condition. The address can remain in the slice with ready false. Service data planes normally avoid it. publishNotReadyAddresses changes that behavior.”

[u08] headless · wrong
  claim:   “It also means you get no load balancing at all. The client picks, and most clients pick the first address they are given.”
  problem: Kubernetes provides no virtual-IP proxying or platform load balancing for a headless Service. Clients can still load-balance. DNS ordering and client selection differ by resolver and application. “Most clients pick the first” is unsupported, and the visual must not show that behavior as universal. [Headless Services](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services)
  fix:     “Setting clusterIP to None removes the Service virtual IP. DNS returns endpoint records. kube-proxy does not handle that Service. The client or resolver chooses an endpoint, so balancing depends on client behavior. StatefulSet per-Pod DNS uses this headless Service.”

[u08] policy-is-permission · wrong
  claim:   “A NetworkPolicy that allows traffic from another namespace has proven one thing: the traffic is permitted.”
  problem: A matching ingress rule proves only destination-side permission. Any isolating egress policy on the source must also allow the connection. Core NetworkPolicy also has no enforcement status, so the visual must not draw a green policy state. [NetworkPolicy behavior](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
  fix:     “A matching ingress rule permits the flow at the destination. An isolating egress policy at the source must also permit it. Policies combine additively. NetworkPolicy creates no route. If the network implementation does not enforce NetworkPolicy, the API stores the object without enforcement status.”

[u08] policy-is-permission · omission
  claim:   “A NetworkPolicy that allows traffic from another namespace…”
  problem: The script does not teach selector scope or default deny. The CKA objective explicitly requires candidates to define and enforce NetworkPolicies. [CKA objectives](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/)
  fix:     “podSelector chooses the Pods the policy protects. A peer podSelector alone stays in the policy namespace. namespaceSelector chooses peer namespaces. An empty podSelector with no ingress rules creates default-deny ingress.”

[u08] implementations-not-apis · imprecise
  claim:   “iptables, IPVS, nftables and eBPF are implementations, not APIs.”
  problem: iptables, IPVS, and nftables are Linux kube-proxy modes. eBPF is a technology used by separate data-plane products; it is not one standardized fourth kube-proxy backend. [Service proxy modes](https://kubernetes.io/docs/reference/networking/virtual-ips/#proxy-modes)
  fix:     “iptables, IPVS, and nftables are kube-proxy modes on Linux. eBPF data planes are separate implementations that can replace kube-proxy. Service manifests usually stay the same, but behavior depends on each implementation and feature set.”

[u08] beyond-the-slogan · omission
  claim:   “Current clusters may well be running nftables.”
  problem: Kubernetes v1.35 deprecated kube-proxy IPVS mode and recommends nftables as its Linux replacement. IPVS remains available in v1.36 but emits a warning. Omitting this makes IPVS sound like an equal current choice. [Kubernetes v1.35 release](https://kubernetes.io/blog/2025/12/17/kubernetes-v1-35-release/)
  fix:     “Kubernetes 1.35 deprecated kube-proxy IPVS mode. It remains available in 1.36 and warns at startup. nftables is the recommended Linux replacement. Compare existing data planes by lookup cost, update cost, locality, kernel support, and Service semantics.”

[u08] conntrack-moves · misleading
  claim:   “What changes is where that state lives. It moves out of the netfilter table and into BPF maps.”
  problem: eBPF does not define one connection-tracking design. Some products use BPF maps. Others retain kernel conntrack for some traffic or modes. The visual must not show a universal migration. [Calico eBPF example](https://docs.tigera.io/calico/latest/about/kubernetes-training/about-ebpf)
  fix:     “An eBPF data plane does not guarantee where flow state lives. Some implementations replace netfilter conntrack with BPF maps. Others still use kernel conntrack for some traffic or modes. Check the product and mode.”

[u08] who-execs-it · misleading
  claim:   “The runtime creates the network namespace, reads the CNI configuration from disk, and execs the plugin chain against that namespace. So a network setup failure lives in the runtime's logs, not the kubelet's.”
  problem: Since Kubernetes 1.24, kubelet delegates network setup through CRI, but CRI does not require CNI or a specific namespace implementation. The CNI specification does not require configuration to reside on disk. Kubelet logs and Pod events also report the failed CRI call. Runtime logs usually contain deeper plugin detail. [Kubernetes network plugins](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/), [CNI specification](https://github.com/containernetworking/cni/blob/main/SPEC.md)
  fix:     “Since Kubernetes 1.24, the kubelet asks the CRI runtime to create the sandbox. Common runtimes load CNI configuration and execute the plugin chain. CNI does not require configuration to live on disk. Start with Pod events and kubelet logs. Use runtime logs for plugin detail.”

[u08] ipam-delegation · wrong
  claim:   “The main plugin delegates allocation to an IPAM plugin. That plugin receives the full configuration and returns an address, a gateway and routes.”
  problem: Delegated IPAM is optional. Some products allocate addresses through a node agent or another internal mechanism. Even a delegated CNI result does not have to contain a gateway or routes. The visual must not show delegation as mandatory. [CNI delegation and result types](https://github.com/containernetworking/cni/blob/main/SPEC.md)
  fix:     “A network plugin can delegate address allocation to an IPAM plugin. The delegated plugin receives the full configuration and can return addresses, gateways, routes, and DNS. Other implementations allocate addresses through their own agent.”

[u08] clusterip-timeout · misleading
  claim:   “Inspect the data-plane programming… Verify routing, MTU and NetworkPolicy. Finally confirm the target is listening on that port.”
  problem: Listener and resolved targetPort checks belong immediately after endpoint selection. Waiting until the end wastes the direct-Pod split. Data-plane inspection is useful only after the direct endpoint path works. [Debug Services](https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/)
  fix:     “Check the Service selector, ports, and EndpointSlices. Confirm the target process listens on the resolved endpoint port. From the same source, test the ready Pod IP and port. If the direct path works, inspect the Service data plane. If it fails, inspect routing, MTU, and NetworkPolicy.”

[u08] close · misleading
  claim:   “A failure here has two signatures. Either the name resolves and nothing answers, or the Pod never got an address at all.”
  problem: A Pod can have an address while routes, MTU, policy, cross-node forwarding, or Service programming fail. The two signatures do not cover the failures taught in this script.
  fix:     “Ask which path failed. Did the sandbox get an address. Can peers reach that Pod address. Does the Service address reach a ready endpoint. Each answer points to a different owner.”

[u08] implementations-not-apis · omission
  claim:   “The Service object does not change when the backend does.”
  problem: The script covers ClusterIP and headless Services but omits NodePort and LoadBalancer. The current CKA curriculum explicitly tests ClusterIP, NodePort, LoadBalancer, and endpoints. [CKA objectives](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/)
  fix:     “ClusterIP exposes a Service inside the cluster. NodePort adds a port on each node. LoadBalancer asks an external implementation for a load balancer. All three still use Service endpoints.”

u07 CKA: Exam-aligned claims cover extension interfaces, probes and self-healing, Pod status, node failure, container output, and node or component troubleshooting. OCI and runc internals, sandbox namespace implementation, exact termination races, and Lease sequencing are mainly interview depth.

u08 CKA: Exam-aligned claims cover Pod connectivity, EndpointSlices, NetworkPolicy, ClusterIP, and service or networking troubleshooting. kube-proxy performance, eBPF internals, CNI execution, connection-tracking maps, and IPAM delegation are mainly interview depth.

u07 VERDICT: 11 CORRECTIONS NEEDED
u08 VERDICT: 14 CORRECTIONS NEEDED
