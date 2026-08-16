/* Kubernetes Beyond YAML — lesson content.
   Loaded as a plain global so the course still works opened straight from file://
   (fetch + JSON would be blocked by the file: origin).

   Item shapes
     teach   { t, h, p, flow?, note? }                       concept card, no grading
     mcq     { t, q, o[], a:index, why, src? }               one correct option
     multi   { t, q, o[], a:[index], why, src? }             select every correct option
     order   { t, q, o[] in correct order, why, src? }       tap chips into sequence
     cloze   { t, q with ___, o[], a:index, why, src? }      tap the term that fills the blank
     recall  { t, q, pts[], model, src? }                    say it out loud, then self-grade

   Every graded item states the discriminator in `why`, because the interview
   answer is the discriminator, not the label.                                    */

window.COURSE = {
  title: 'Kubernetes Beyond YAML',
  subtitle: 'Follow intent all the way to a packet.',
  units: []
};

window.COURSE.units.push(

{
  id: 'u1', n: 1, ref: 'm1',
  title: 'The control-plane map',
  tag: 'Orientation',
  blurb: 'Five actors, no pipeline. Learn who owns what before anything else.',
  lessons: [
    {
      id: 'u1l1', title: 'Who does what',
      items: [
        { t: 'teach',
          h: 'No component "runs a Deployment"',
          p: 'Several independent loops advance distinct API objects until a kubelet has enough durable intent to start containers. That sentence is the whole course in one line — every later module is one loop seen up close.',
          flow: ['API write', 'Persist object', 'Controllers create dependents', 'Scheduler binds Pod', 'Kubelet realizes it'],
          note: 'The arrows are a learning order, not a synchronous pipeline. These loops run concurrently and retry independently.',
          clip: ['PLCt3lSoXOw', 29, 'The whole cluster in three lanes'] },

        { t: 'mcq',
          q: 'Which component is the HTTP API and the policy boundary that every other component coordinates through?',
          o: ['kube-apiserver', 'etcd', 'kube-controller-manager', 'kubelet'],
          a: 0,
          why: 'The API server exposes the supported API, applies request policy and conversion, and serves reads and watches. Components talk to <em>it</em>, not to each other and not to storage.',
          src: ['Cluster architecture', 'https://kubernetes.io/docs/concepts/architecture/'],
          clip: ['gjk82Y2vyro', 900, 'The API server handling a create request'] },

        { t: 'mcq',
          q: 'What does etcd actually hold in a Kubernetes cluster?',
          o: ['Container images and layers', 'Node CPU and memory metrics', 'API-server data, in a strongly consistent Raft-backed store', 'Pod stdout and stderr logs'],
          a: 2,
          why: 'etcd is the strongly consistent store behind the API server. Images live in a registry and on nodes, metrics come from a metrics pipeline, and logs stay on the node unless shipped elsewhere.',
          src: ['Kubernetes components', 'https://kubernetes.io/docs/concepts/overview/components/'] },

        { t: 'cloze',
          q: 'Choosing which node a Pod runs on is the job of the ___.',
          o: ['scheduler', 'kubelet', 'API server', 'ReplicaSet controller'],
          a: 0,
          why: 'The scheduler decides placement and records it as a binding. The kubelet then executes whatever was assigned to its node — it never picks the node itself.' },

        { t: 'mcq',
          q: 'A colleague proposes that a controller read etcd directly for speed. What is the strongest objection?',
          o: [
            'etcd cannot serve concurrent readers',
            'It bypasses authn, authz, admission, defaulting, validation, conversion and audit, and couples the controller to storage layout',
            'etcd stores data in a binary format no client can parse',
            'Only one process is permitted to open the etcd data directory'
          ],
          a: 1,
          why: 'The API server adds identity, policy, defaulting, validation, versioned conversion, audit and supported watch semantics. A direct read skips all of them. It also pins the controller to a storage layout that is not a public contract.',
          src: ['kube-apiserver architecture', 'https://github.com/kubernetes/apiserver/blob/master/ARCHITECTURE.md'] },

        { t: 'recall',
          q: 'Who starts a container after a Deployment is created? Trace the chain out loud.',
          pts: [
            'The Deployment controller creates a ReplicaSet',
            'The ReplicaSet controller creates Pods',
            'The scheduler binds each Pod to a node',
            'That node\'s kubelet asks the runtime for a sandbox and containers'
          ],
          model: 'The Deployment controller creates a ReplicaSet, the ReplicaSet controller creates Pods, the scheduler binds each Pod, and the selected node\'s kubelet asks the runtime to create its sandbox and containers. Four independent loops, each triggered by an API object the previous one wrote.' }
      ]
    },
    {
      id: 'u1l2', title: 'What an outage really costs',
      items: [
        { t: 'teach',
          h: '"Traffic still flows" is not "the cluster is healthy"',
          p: 'Already-running processes and already-programmed data paths can survive a control-plane outage. What stops is <em>change</em>: API writes, placement, repair, endpoint updates, leases, and most day-two operations. Interviewers ask this to see whether you separate the data plane from the control plane.',
          clip: ['gjk82Y2vyro', 64, 'What happens if the control plane goes down'] },

        { t: 'multi',
          q: 'The control plane is fully down. Select everything that degrades.',
          o: [
            'New Pods being placed on nodes',
            'Packets between two already-running Pods on programmed data paths',
            'Self-healing after a Pod or node fails',
            'EndpointSlice updates when a Pod becomes unready',
            'The processes already running inside live containers'
          ],
          a: [0, 2, 3],
          why: 'Placement, repair and endpoint churn all require API writes and controllers, so they stop. Existing processes and already-programmed forwarding rules can keep working — which is exactly why the cluster looks deceptively fine.',
          src: ['Control-plane communication', 'https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/'] },

        { t: 'order',
          q: 'Put one Deployment write in the order the system actually advances it.',
          o: ['Client writes the Deployment', 'API server persists the canonical object', 'Controllers create dependent objects', 'Scheduler binds each Pod to a node', 'Kubelet realizes the Pod on that node'],
          why: 'Each stage is a separate loop reacting to the object the previous stage wrote. No single component drives the sequence end to end, which is why any stage can stall independently.',
          clip: ['PLCt3lSoXOw', 119, 'Desired state is only a record in a database'] },

        { t: 'mcq',
          q: 'Which statement about the control plane is <em>false</em>?',
          o: [
            'Controllers decide what objects should exist',
            'The scheduler chooses a node for a Pod',
            'The kubelet executes the Pods assigned to its node',
            'The Deployment controller starts containers on the node it selects'
          ],
          a: 3,
          why: 'The Deployment controller neither selects nodes nor starts containers. It only manages ReplicaSets — placement is the scheduler\'s and execution is the kubelet\'s.' },

        { t: 'recall',
          q: 'What survives a control-plane outage, and what does not?',
          pts: [
            'Existing processes and programmed data paths may continue',
            'API writes, placement, repair and endpoint changes degrade',
            'Leases and most day-two actions degrade',
            '"Traffic still flows" does not mean healthy'
          ],
          model: 'Existing processes and already-programmed data paths may keep serving, but API writes, placement, repair, endpoint changes, leases and most day-two actions degrade. Reporting "traffic still flows" as health is the mistake — the cluster has simply stopped being able to change or heal.' }
      ]
    }
  ]
},

{
  id: 'u2', n: 2, ref: 'm2',
  title: 'The API request path',
  tag: 'Policy & persistence',
  blurb: 'Authenticate, authorize, mutate, validate, persist. Every gate is a separate failure.',
  lessons: [
    {
      id: 'u2l1', title: 'Five gates',
      items: [
        { t: 'teach',
          h: 'A write is a gauntlet, not a save',
          p: 'A request is authenticated, authorized, admitted, defaulted and validated before persistence. Audit and flow control surround that path. Each success only advances the request to the next boundary — so "it was allowed" is never a complete explanation of why something worked.',
          flow: ['Authenticate identity', 'Authorize attributes', 'Mutate / default', 'Validate / admit', 'Persist + notify watches'],
          clip: ['jqelVFwhx4g', 32, 'Admission as the building security gate'] },

        { t: 'order',
          q: 'Order the gates a write passes through.',
          o: ['Authenticate: who is this?', 'Authorize: may they do this?', 'Mutating admission', 'Validating admission', 'Persist to etcd and notify watchers'],
          why: 'Mutation runs before validation so that what gets validated is the final object. Persistence is last, and only then do watchers learn anything.',
          src: ['API access control', 'https://kubernetes.io/docs/reference/access-authn-authz/'],
          clip: ['jqelVFwhx4g', 176, 'Why mutating runs before validating'] },

        { t: 'mcq',
          q: 'What does RBAC do?',
          o: [
            'Establishes which user and groups a request belongs to',
            'Decides whether an already-identified subject may perform the verb on the resource',
            'Rewrites objects to satisfy cluster policy',
            'Encrypts secrets at rest in etcd'
          ],
          a: 1,
          why: 'RBAC grants permissions; it does not authenticate. Authentication establishes the identity and groups first, and only then can an authorizer judge the verb against the resource.',
          src: ['Authorization reference', 'https://kubernetes.io/docs/reference/access-authn-authz/authorization/'] },

        { t: 'cloze',
          q: '___ admission may change an object; validating admission may only accept or reject it.',
          o: ['Mutating', 'Structural', 'Defaulting', 'Converting'],
          a: 0,
          why: 'Only mutating admission edits the object. Keeping the two halves distinct matters because mutations must be idempotent under reinvocation while validation must be deterministic and fast.' },

        { t: 'mcq',
          q: 'RBAC allows the request, but the API server still rejects it. What layers remain?',
          o: [
            'None — authorization is the final decision',
            'Only the network path to etcd',
            'Admission policies and webhooks, schema validation, quotas, immutable-field rules, conversion and storage failures',
            'Only TLS certificate verification'
          ],
          a: 2,
          why: 'A successful authorization decision clears exactly one gate. Quota, immutability, schema, admission and storage all sit downstream and reject with quite different messages.' },

        { t: 'recall',
          q: 'Trace an API request from HTTP to a stored object, naming what can reject it at each step.',
          pts: [
            'Flow control may queue or reject before execution',
            'Authentication establishes user and groups',
            'Authorization judges verb plus resource attributes',
            'Mutating then validating admission',
            'Schema validation, quota and immutability rules',
            'Persistence, then watch notification'
          ],
          model: 'API Priority and Fairness can queue or reject the request before it runs. Authentication then establishes the user and groups. Authorization decides whether that identity may perform the verb on the resource. Mutating admission can edit the object, and validating admission can reject it. Defaulting, schema validation, quota and immutability rules then apply. Finally the API server stores the object and notifies watchers. Audit records stages around the whole path.' },

        { t: 'mcq',
          q: 'Your request comes back <code>403 Forbidden</code> rather than <code>401 Unauthorized</code>. What does that tell you?',
          o: [
            'Your credentials were rejected — the token is bad or expired',
            'Your identity was established, but no rule grants it that verb on that resource',
            'An admission webhook rejected the object',
            'The resource does not exist'
          ],
          a: 1,
          why: '401 means authentication failed — the API server does not know who you are. 403 means it does, and authorization found no grant. Reading which one you got tells you whether to fix the credential or the RoleBinding.',
          src: ['Authorization reference', 'https://kubernetes.io/docs/reference/access-authn-authz/authorization/'] },

        { t: 'mcq',
          q: 'You are hunting for the RBAC rule that is <em>blocking</em> a request. What is wrong with that search?',
          o: [
            'Nothing — deny rules are stored in the ClusterRole',
            'RBAC only grants; there is no deny rule, so the thing to look for is a missing grant',
            'Deny rules live in the webhook configuration',
            'RBAC denies by default only in kube-system'
          ],
          a: 1,
          why: 'RBAC is purely additive — it accumulates permissions and denies by default. There is no rule to find and remove, only a grant to add, which is why "which rule is blocking this?" is the wrong question.',
          src: ['Authorization reference', 'https://kubernetes.io/docs/reference/access-authn-authz/authorization/'] }
      ]
    },
    {
      id: 'u2l2', title: 'Webhooks on the hot path',
      items: [
        { t: 'teach',
          h: 'A webhook puts your Service in the API server\'s critical path',
          p: 'Every matching request now synchronously depends on a Service, its DNS, its TLS trust and its response deadline. This is the single most common way a well-meaning policy change takes out an unrelated team.',
          note: 'failurePolicy is a domain decision: fail closed for safety, fail open for availability. There is no universally correct answer, and saying so is part of a strong response.',
          clip: ['jqelVFwhx4g', 90, 'Mutating webhooks injecting sidecars'] },

        { t: 'mcq',
          q: 'Why can one admission webhook stall deployments in a namespace its owners have never heard of?',
          o: [
            'Webhooks are always cluster-wide and cannot be scoped',
            'If its rules match broadly, every matching API request waits on that webhook\'s Service, TLS and deadline',
            'The API server serializes all requests while any webhook is registered',
            'Webhooks disable the watch cache'
          ],
          a: 1,
          why: 'Breadth of the match rules is the blast radius. Scope rules and object selectors are the fix; failure policy only decides what a timeout <em>means</em>.',
          src: ['Admission webhook good practices', 'https://kubernetes.io/docs/concepts/cluster-administration/admission-webhooks-good-practices/'] },

        { t: 'multi',
          q: 'A webhook is timing out. Select the things genuinely worth checking.',
          o: [
            'Scope rules and object selectors — should this request call the webhook at all?',
            'Service endpoints, DNS, TLS trust and API-server reachability',
            'The failurePolicy setting and the configured timeout',
            'Whether the cluster has an odd number of etcd members'
          ],
          a: [0, 1, 2],
          why: 'Matching scope, reachability and failure policy are the live variables. etcd membership is a consensus concern with no bearing on whether a webhook call completes.' },

        { t: 'mcq',
          q: 'A mutating webhook is invoked more than once for the same object. What must be true of it?',
          o: [
            'It must be idempotent — reapplying its mutation must not compound',
            'It must reject the second invocation',
            'It must be registered as validating instead',
            'It must return the original unmodified object'
          ],
          a: 0,
          why: 'Reinvocation is a normal part of the admission chain when other webhooks mutate the object. A non-idempotent mutation quietly accumulates — appending a sidecar twice, for example.' },

        { t: 'recall',
          q: 'You are designing a validating webhook for a large cluster. What do you decide before writing any code?',
          pts: [
            'Match scope: rules and object selectors, as narrow as correctness allows',
            'failurePolicy: fail closed or fail open, argued from the domain',
            'Timeout and latency budget on the API hot path',
            'Availability of the webhook Service itself, and its certificate lifecycle',
            'Determinism — the same object must always get the same verdict'
          ],
          model: 'Narrow the match rules and object selectors so unrelated traffic never reaches it. Choose failurePolicy from the domain: fail closed when admitting a bad object is worse than blocking writes, fail open when availability wins. Budget the timeout against API latency, run the webhook with enough replicas and a managed certificate lifecycle, and keep validation deterministic and fast so verdicts never depend on when they ran.' }
      ]
    },
    {
      id: 'u2l3', title: 'Two writers, one object',
      items: [
        { t: 'teach',
          h: 'Concurrency is part of the API contract',
          p: '<code>resourceVersion</code> gives updates optimistic concurrency, and server-side apply records field ownership in managed fields. Both exist because more than one actor legitimately writes to the same object — and both are routinely defeated by a blind retry. The version string belongs to the server: pass it back unmodified, and only order two decimal values that came from the same API group and resource type.',
          src: ['Resource versions', 'https://kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions'] },

        { t: 'mcq',
          q: 'Your controller\'s update fails with a conflict. What is the safe response?',
          o: [
            'Retry the same request immediately with the same body',
            'Fetch the latest object, recompute the desired delta, and retry with bounded backoff',
            'Re-send the update with force so it always wins',
            'Delete the object and recreate it from your local copy'
          ],
          a: 1,
          why: 'A conflict means someone else changed the object. Replaying your stale body destroys their change; recomputing from current state is the only safe path.',
          src: ['Kubernetes API concepts', 'https://kubernetes.io/docs/reference/using-api/api-concepts/'] },

        { t: 'mcq',
          q: 'A server-side apply conflict tells you what?',
          o: [
            'The object is corrupt and should be deleted',
            'Another field manager already owns the field paths you are trying to set',
            'The API server has run out of storage',
            'Your client is using the wrong API version'
          ],
          a: 1,
          why: 'Managed fields record ownership per field path, so a conflict is an ownership signal. Unconditional force suppresses the signal and silently takes the field from its owner.' },

        { t: 'cloze',
          q: 'Optimistic concurrency on updates is enforced through the object\'s ___.',
          o: ['resourceVersion', 'generation', 'uid', 'creationTimestamp'],
          a: 0,
          why: '<code>resourceVersion</code> is the token that makes an update conditional on the state you read. <code>generation</code> tracks spec changes and <code>uid</code> identifies an object instance. Neither guards a write.' },

        { t: 'recall',
          q: 'When is <code>force</code> on a server-side apply actually the right call?',
          pts: [
            'When you have decided your manager should own those fields',
            'After identifying the current owner and why it set them',
            'Never as an unconditional default to silence conflicts'
          ],
          model: 'When ownership is genuinely being transferred and you know who held the fields and why — a migration between controllers, for example. Forcing by default converts a designed ownership signal into a silent overwrite, and the previous owner will simply fight you on its next reconcile.' }
      ]
    }
  ]
},

{
  id: 'u3', n: 3, ref: 'm3',
  title: 'Reconciliation & watches',
  tag: 'Control loops',
  blurb: 'Events are hints. Current state is truth. This is why Kubernetes tolerates lost messages.',
  lessons: [
    {
      id: 'u3l1', title: 'The informer loop',
      items: [
        { t: 'teach',
          h: 'List, watch, cache, queue, reconcile',
          p: 'A controller lists to establish current state and a collection resource version, watches for later changes, caches objects, enqueues a stable key, and reconciles by reading the latest state. Expired history arrives as <code>410 Gone</code>: the client drops its cache, runs a fresh get or list, and restarts the watch from the resource version that call returned. <code>BOOKMARK</code> events carry the client forward without an object change, so the window expires less often.',
          flow: ['List + resourceVersion', 'Watch changes', 'Cache objects', 'Queue namespace/name key', 'Reconcile latest state'],
          src: ['Efficient detection of changes', 'https://kubernetes.io/docs/reference/using-api/api-concepts/#efficient-detection-of-changes'],
          clip: ['kss081c8EqY', 152, 'The control loop: observe, compare, act'] },

        { t: 'order',
          q: 'Order the informer-to-worker path.',
          o: ['Reflector lists and watches the API server', 'Objects land in the shared cache', 'A handler enqueues the namespace/name key', 'A worker pops the key', 'The reconciler reads current state and acts'],
          why: 'Notice what is <em>not</em> carried across: the event payload. Only a key travels to the worker, which then reads the cache for truth.',
          src: ['client-go informer/cache', 'https://pkg.go.dev/k8s.io/client-go/tools/cache'],
          clip: ['kss081c8EqY', 1103, 'Shared informers: one watch, many controllers'] },

        { t: 'mcq',
          q: 'Why does a controller queue a namespace/name key instead of the event payload?',
          o: [
            'Keys are smaller and use less memory',
            'A key deduplicates bursts and forces the worker to read current truth',
            'Payloads cannot be serialized into a workqueue',
            'The API server refuses to send payloads to controllers'
          ],
          a: 1,
          why: 'Deduplication and freshness, not size. A payload preserves a stale intermediate state and invites event-replay logic that breaks the moment an event is missed.' },

        { t: 'cloze',
          q: 'Correctness that comes from recomputing what should be true now, rather than replaying transitions, is called ___ behavior.',
          o: ['level-based', 'edge-triggered', 'event-sourced', 'transactional'],
          a: 0,
          why: 'Level-based means you look at the current level of the signal. Edge-triggered logic depends on catching every transition, which no distributed watch can promise.',
          src: ['Controller pattern', 'https://kubernetes.io/docs/concepts/architecture/controller/'] },

        { t: 'recall',
          q: 'A watch event is lost. Is correctness lost?',
          pts: [
            'No, not in a correctly written controller',
            'Relist or reconnect restores current state',
            'Resync or a related change schedules reconciliation anyway',
            'Reconciliation compares current levels, not history',
            'Events improve latency, not correctness'
          ],
          model: 'No. The controller relists or reconnects, and resync or any related change schedules a reconcile that compares current state against intent. Events are a latency optimisation — they make convergence fast, they do not make it correct.' },

        { t: 'mcq',
          q: 'Config-management veterans often map Kubernetes onto Puppet. Which component is the closest analogue of a <em>Puppet agent</em>?',
          o: [
            'The Deployment controller',
            'The kubelet',
            'The API server',
            'kube-proxy'
          ],
          a: 1,
          why: 'A Puppet agent runs on the host it manages and converges <em>that host</em>. So does the kubelet: it watches for state assigned to its node, makes the node match, and reports status back. Most controllers converge API objects rather than machines — the Deployment controller creates a ReplicaSet and never touches a node.',
          src: ['Controller pattern', 'https://kubernetes.io/docs/concepts/architecture/controller/'] }
      ]
    },
    {
      id: 'u3l2', title: 'Loops that misbehave',
      items: [
        { t: 'teach',
          h: 'A controller that writes on every pass will trigger itself',
          p: 'Its own write produces a watch event, which enqueues the key, which reconciles, which writes again. Status timestamps and reordered list fields are the classic culprits: semantically nothing changed, but the serialized object differs every time.',
          clip: ['PLCt3lSoXOw', 187, 'Controllers continuously closing the gap'] },

        { t: 'mcq',
          q: 'A controller is hot-looping at thousands of writes per minute against unchanged objects. What is the most likely cause?',
          o: [
            'The workqueue rate limiter is misconfigured',
            'It writes on every pass even when semantic state is unchanged, re-triggering its own watch',
            'The informer cache is too small',
            'The API server is not compacting etcd'
          ],
          a: 1,
          why: 'Self-triggering is the shape of a hot loop. Compare before patching, and avoid writing timestamps or reordered fields that always differ from what is stored.' },

        { t: 'multi',
          q: 'Your controller creates a cloud load balancer. Select the practices that make it safe to reconcile repeatedly.',
          o: [
            'Use a stable external idempotency key derived from the object',
            'Observe whether the resource exists before creating it',
            'Persist the provider identity back onto the object',
            'Create the resource once and record success in controller memory'
          ],
          a: [0, 1, 2],
          why: 'Every phase must be resumable by a fresh process. In-memory success is lost on restart, and the next reconcile then creates a duplicate that nobody is tracking.' },

        { t: 'mcq',
          q: 'The watch reports an expired resource version. What does a correct reflector do?',
          o: [
            'Fail permanently and require an operator restart',
            'Relist to establish current state and resume watching from the new version',
            'Replay the missing events from an API-server buffer',
            'Reconcile every object from its last known payload'
          ],
          a: 1,
          why: 'Expired history is expected, not exceptional. The reflector relists — which is also precisely why a lost event costs latency rather than correctness.',
          src: ['Efficient change detection', 'https://kubernetes.io/docs/reference/using-api/api-concepts/#efficient-detection-of-changes'] },

        { t: 'recall',
          q: 'Explain to an interviewer why reconciliation makes unreliable event delivery acceptable.',
          pts: [
            'Events only schedule work; they are not the input to the decision',
            'The reconciler reads current state and compares it with intent',
            'Each step is idempotent, so repeats are harmless',
            'Relist, resync and related changes all re-schedule the same key'
          ],
          model: 'Events only schedule work. The reconciler reads current state, compares it against declared intent, and takes an idempotent step toward convergence — so running it twice, late, or out of order produces the same result. Delivery can be lossy because nothing about the decision depends on having seen the transition.' }
      ]
    }
  ]
},

{
  id: 'u4', n: 4, ref: 'm4',
  title: 'Workloads & disruption',
  tag: 'Lifecycle promises',
  blurb: 'Deployment, StatefulSet, DaemonSet, Job — four different state machines, not four YAML flavours.',
  lessons: [
    {
      id: 'u4l1', title: 'Four different promises',
      items: [
        { t: 'teach',
          h: 'Pick the controller by the invariant it protects',
          p: 'A Deployment manages ReplicaSets of replaceable Pods with controlled rollouts. A StatefulSet adds stable ordinal identity, ordered lifecycle and per-Pod claims. A DaemonSet targets eligible nodes. A Job targets successful completion. The discriminator is always which invariant your application actually needs.',
          clip: ['gjk82Y2vyro', 600, 'The controllers inside kube-controller-manager'] },

        { t: 'teach',
          h: 'A rolling update is arithmetic you choose',
          p: 'On a RollingUpdate Deployment, <code>maxSurge</code> bounds how far above the replica count the controller may go and <code>maxUnavailable</code> bounds how far below. Both default to 25%. A percentage <code>maxUnavailable</code> rounds down; a percentage <code>maxSurge</code> rounds up. The two cannot both be 0 — something has to move for a Pod to be replaced. Recreate removes the old-revision Pods before it creates new ones during a template upgrade, which is a rollout guarantee, not an at-most-N guarantee after a manual delete.',
          flow: ['template change', 'new ReplicaSet', 'surge up to +maxSurge', 'wait for Ready', 'scale old down within maxUnavailable'],
          src: ['Deployment max surge', 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#max-surge'] },

        { t: 'teach',
          h: 'A CronJob decides what a late tick does',
          p: 'A CronJob writes Jobs on a five-field schedule. <code>concurrencyPolicy</code> says what happens when the next tick arrives while the previous run is still active: Allow, the default, lets runs overlap; Forbid skips the new run and leaves the live one alone; Replace cancels the live Job and starts a fresh one. <code>startingDeadlineSeconds</code> and the history limits are separate knobs, and <code>suspend</code> stops new runs without deleting the object.',
          src: ['CronJob', 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/'] },

        { t: 'mcq',
          q: 'What does a StatefulSet <em>not</em> give you?',
          o: [
            'Stable ordinal identity per Pod',
            'Ordered lifecycle operations',
            'Per-Pod persistent volume claims',
            'A replicated, consistent application'
          ],
          a: 3,
          why: 'It provides identity and ordering primitives. Replication and consistency are properties of the application running inside — a StatefulSet cannot make a single-writer database into a cluster.',
          src: ['Workload controllers', 'https://kubernetes.io/docs/concepts/workloads/controllers/'] },

        { t: 'cloze',
          q: 'A workload that must run on every eligible node belongs in a ___.',
          o: ['DaemonSet', 'StatefulSet', 'Job', 'Deployment with node affinity'],
          a: 0,
          why: 'A DaemonSet targets node membership directly, so it adapts as nodes join and leave. Pinning replicas with affinity gets you a count that stops matching the cluster the moment it scales.' },

        { t: 'mcq',
          q: 'An interviewer asks how you choose between Deployment and StatefulSet. Which answer is strongest?',
          o: [
            'Use a StatefulSet whenever the workload has a database',
            'Use a StatefulSet when stable network and storage identity and ordered lifecycle are part of correctness',
            'Use a Deployment unless you need more than three replicas',
            'Use a StatefulSet whenever the Pod mounts any volume'
          ],
          a: 1,
          why: 'Interviewers probe the answer "it has a database". Name the invariant instead: stable identity and ordered lifecycle. Then say what the application\'s own replication and failure semantics need.' },

        { t: 'recall',
          q: 'Distinguish a DaemonSet from a Job by what each one is trying to guarantee.',
          pts: [
            'A DaemonSet targets eligible nodes; membership drives replacement',
            'A Job targets successful completion; retries drive replacement',
            'Their replacement and retry semantics solve different invariants'
          ],
          model: 'A DaemonSet guarantees coverage: one Pod per eligible node, replaced when a node changes eligibility or the Pod dies. A Job guarantees completion: Pods are retried until the configured number of successes, then it stops. One tracks the node set, the other tracks a success count.' }
      ]
    },
    {
      id: 'u4l2', title: 'Autoscaling and disruption',
      items: [
        { t: 'teach',
          h: 'HPA and VPA can fight over the same number',
          p: 'HPA changes replica count from metrics. VPA recommends or changes resource requests. If both act on CPU or memory requests, the denominator of HPA\'s utilisation calculation moves underneath it — the classic conflict.',
          note: 'Stateful systems add identity, quorum, storage and disruption constraints on top, which is why "just autoscale it" rarely survives follow-up questions.',
          clip: ['fEZezc_zqJg', 464, 'Why VPA and HPA cannot both target requests'] },

        { t: 'mcq',
          q: 'Why can HPA and VPA conflict on one workload?',
          o: [
            'They both write to the replicas field',
            'VPA changes the CPU/memory requests that HPA uses as its utilisation denominator',
            'They cannot be installed in the same cluster',
            'VPA deletes the HPA object during a recommendation'
          ],
          a: 1,
          why: 'Utilisation is usage relative to requests. Move the requests and the same usage reports a different utilisation, so HPA scales on a number that VPA is redefining under it.',
          src: ['Horizontal Pod Autoscaling', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/'] },

        { t: 'mcq',
          q: 'You want HPA and VPA on the same Deployment anyway. What is the defensible design?',
          o: [
            'Set both to aggressive update modes and let them settle',
            'Separate the signals — HPA on queue depth, VPA on requests — or constrain update modes and test disruption',
            'Run VPA only on odd-numbered days',
            'Disable readiness probes so scaling is faster'
          ],
          a: 1,
          why: 'The conflict is a shared signal, so remove the sharing. Scale horizontally on something VPA does not touch, and bound VPA\'s update mode so it cannot churn Pods unexpectedly.',
          clip: ['fEZezc_zqJg', 210, 'VPA update modes and the risk to stateful Pods'] },

        { t: 'multi',
          q: 'A PodDisruptionBudget is in place. Select what it actually constrains.',
          o: [
            'Voluntary eviction through the Eviction API, such as a node drain',
            'A node losing power',
            'A container being OOM-killed',
            'Direct deletion of a Pod with kubectl delete'
          ],
          a: [0],
          why: 'A PDB limits API-initiated voluntary disruption only. Hardware failure, OOM kills and direct deletion all bypass it. A PDB is a safety rail for maintenance, not an availability guarantee.',
          src: ['Disruptions and PDBs', 'https://kubernetes.io/docs/concepts/workloads/pods/disruptions/'] },

        { t: 'mcq',
          q: 'Scheduler preemption and kubelet eviction are often confused. Which pairing is right?',
          o: [
            'Preemption reacts to node pressure; eviction makes room for a higher-priority Pod',
            'Preemption makes room for a pending higher-priority Pod; eviction reacts to node pressure',
            'Both are driven by the PodDisruptionBudget controller',
            'Both are performed by the API server during admission'
          ],
          a: 1,
          why: 'Different actors, different triggers. The scheduler preempts to place a pending Pod; the kubelet evicts because its own node is under pressure.' },

        { t: 'recall',
          q: 'Does a PodDisruptionBudget guarantee availability? Answer as you would in an interview.',
          pts: [
            'No — it constrains voluntary eviction through the Eviction API',
            'It cannot stop involuntary failure',
            'It is only useful alongside replicas, readiness, topology spread and spare capacity'
          ],
          model: 'No. It constrains voluntary eviction through the Eviction API, so it protects you during drains and upgrades. It cannot stop node failure, OOM kills or direct deletion, and it is only meaningful alongside enough replicas, working readiness, topology spread and spare capacity to reschedule into.' }
      ]
    }
  ]
},

{
  id: 'u5', n: 5, ref: 'm5',
  title: 'CRDs & operators',
  tag: 'Extending the API',
  blurb: 'A CRD is a public API. Once someone stores an object in it, you own it forever.',
  lessons: [
    {
      id: 'u5l1', title: 'Four words, four things',
      items: [
        { t: 'teach',
          h: 'CRD, CR, controller, operator',
          p: 'A CRD registers a resource and its schema. A CR is one stored object of that kind. A controller reconciles those objects. An operator packages a controller together with domain-specific lifecycle knowledge, RBAC, installation and upgrades. Interviewers use this quartet to check whether you have built one or only used one. At <code>apiextensions.k8s.io/v1</code> the schema is not optional: the API server rejects a version with no <code>openAPIV3Schema</code>, because it needs a structural schema to validate and prune your objects. Exactly one version is the storage version, and the kind is only servable once the CRD reports <code>Established</code>.',
          flow: ['CRD registers GVK', 'API validates CR', 'Controller observes', 'Children / external state', 'Status reports'],
          src: ['CustomResourceDefinitions', 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/'],
          clip: ['mTC3UZ8bHJc', 70, 'Manual deployment versus the operator pattern'] },

        { t: 'mcq',
          q: 'What exactly does a CustomResourceDefinition give you on its own?',
          o: [
            'A running controller that acts on your objects',
            'A registered API kind with a schema, served and validated by the API server',
            'A namespace dedicated to your application',
            'Automatic backup of the objects you create'
          ],
          a: 1,
          why: 'A CRD is registration and schema only. Without a controller the API server stores your objects and nothing happens. That surprises most people new to operators.',
          src: ['Custom resources', 'https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/'],
          clip: ['mTC3UZ8bHJc', 292, 'The CRD defines; the CR is an instance'] },

        { t: 'cloze',
          q: 'Intent lives in <code>spec</code>; observation — including conditions and <code>observedGeneration</code> — lives in ___.',
          o: ['status', 'metadata', 'annotations', 'the finalizer list'],
          a: 0,
          why: 'Keeping observation out of spec is what lets a controller be restarted, or replaced, without losing the ability to tell what it has actually done.' },

        { t: 'mcq',
          q: 'Your controller cannot satisfy the requested replica count, so it rewrites <code>spec.replicas</code> down to what it managed. What is wrong with that?',
          o: [
            'Nothing — the object should reflect reality',
            'It rewrites the user\'s intent to hide a limitation, so the gap becomes invisible',
            'It will be rejected by the API server automatically',
            'Only the API server may write to spec'
          ],
          a: 1,
          why: 'Spec is the user\'s declaration. Editing it destroys the record of what was asked for; the honest move is to leave spec alone and report the shortfall through status conditions.' },

        { t: 'multi',
          q: 'Which of these are genuinely part of the API contract you sign when you publish a CRD?',
          o: [
            'The structural schema, including list and map semantics',
            'Pruning, defaulting and validation behaviour',
            'How server-side apply merges the fields',
            'The programming language the controller is written in'
          ],
          a: [0, 1, 2],
          why: 'Everything a client can observe or depend on is contract. The implementation language is not — you can rewrite the controller entirely without breaking a single user.' },

        { t: 'recall',
          q: 'Distinguish CRD, CR, controller and operator in one breath each.',
          pts: [
            'CRD registers an API kind and schema',
            'CR is one instance of that kind',
            'Controller reconciles state toward the spec',
            'Operator packages controller plus domain lifecycle, RBAC, install and upgrade'
          ],
          model: 'The CRD registers an API kind and its schema. A CR is one instance of that kind stored in the API. A controller reconciles those objects toward their declared spec. An operator is the packaging: a controller plus domain-specific lifecycle knowledge, RBAC, installation and upgrade handling for a particular application.',
          clip: ['xlBMpLNaPlg', 472, 'What makes a controller special'] }
      ]
    },
    {
      id: 'u5l2', title: 'APIs you cannot take back',
      items: [
        { t: 'teach',
          h: 'Several versions may be served; exactly one is the storage version',
          p: 'Changing which version is marked for storage does not migrate anything already stored. Old objects keep their old encoding until something rewrites them. Remove an old version too early and you strand data nobody can read.',
          clip: ['7IA-Vw1K7eg', 100, 'Designing an API version for the long haul'] },

        { t: 'order',
          q: 'Order a safe migration from v1 to v2 of your CRD.',
          o: ['Serve both v1 and v2', 'Verify conversion round-trips in both directions', 'Mark v2 as the storage version', 'Migrate existing stored objects', 'Confirm stored versions and client usage', 'Retire v1'],
          why: 'Every step gates the next. Skipping the migration step is the classic failure: storage flips, old objects are never rewritten, and removing v1 makes them unreadable.',
          src: ['CRD versioning', 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/'] },

        { t: 'mcq',
          q: 'You set the storage version to v2 this morning. What is true of an object created last week?',
          o: [
            'It was rewritten to v2 automatically when the marker changed',
            'It is still stored in v1 and is converted on read until something rewrites it',
            'It is now unreadable',
            'It was deleted by the API server'
          ],
          a: 1,
          why: 'The storage marker only affects new writes. Existing objects stay in their original version and convert on the way out. The conversion path must keep working until you have migrated them.',
          clip: ['7IA-Vw1K7eg', 480, 'A field that turned into a breaking change'] },

        { t: 'mcq',
          q: 'Owner references and finalizers do different jobs. Which pairing is correct?',
          o: [
            'Owner references delay deletion; finalizers cascade deletion',
            'Owner references guide garbage collection; finalizers hold an object after a delete request until cleanup completes',
            'Both are purely informational labels',
            'Owner references are set by users; finalizers are set by the API server only'
          ],
          a: 1,
          why: 'One expresses "delete me when my owner goes", the other expresses "do not actually remove me yet". Confusing them is how external resources get leaked.' },

        { t: 'recall',
          q: 'A CR has been stuck Terminating for an hour. Someone suggests removing the finalizer. What do you say?',
          pts: [
            'Identify which controller owns that finalizer first',
            'Find out why its cleanup is not completing — is the controller running, is it erroring?',
            'Remove it only after proving cleanup completed or was safely done elsewhere',
            'Blind removal can leak external resources and violate the invariant the finalizer protected'
          ],
          model: 'First find the owner of that finalizer and why its cleanup is not completing — most often the controller is down, crash-looping, or blocked on an external dependency. Removing the finalizer is only safe once cleanup has actually completed or has been performed by hand. Stripping it blindly makes the object disappear and leaks whatever it was protecting: cloud volumes, DNS records, external databases.' }
      ]
    }
  ]
},

{
  id: 'u6', n: 6, ref: 'm6',
  title: 'Scheduling under pressure',
  tag: 'Constraint solving',
  blurb: 'Filter, score, reserve, bind — then hand off. The scheduler never starts a container.',
  lessons: [
    {
      id: 'u6l1', title: 'Choose, then commit',
      items: [
        { t: 'teach',
          h: 'Two cycles, not one',
          p: 'The scheduling cycle is serial: sort the queue, pre-filter, filter, score. The binding cycle may overlap with the next Pod\'s scheduling cycle: reserve, permit, pre-bind, bind. Splitting them is what lets the scheduler stay fast while still doing slow work such as waiting on a volume.',
          flow: ['Queue', 'PreFilter / Filter', 'Score', 'Reserve / Permit', 'Bind'],
          clip: ['6p1XcgsFHsU', 135, 'The scheduler looks for Pods with an empty nodeName'] },

        { t: 'order',
          q: 'Order the scheduling framework extension points.',
          o: ['QueueSort', 'PreFilter', 'Filter', 'Score', 'Reserve', 'Permit', 'Bind'],
          why: 'Filtering answers "can it run here at all"; scoring only ranks what survived. Reserve and Permit come after a decision is made but before it is committed.',
          src: ['Scheduling framework', 'https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/'],
          clip: ['6p1XcgsFHsU', 157, 'Filtering: finding feasible nodes'] },

        { t: 'mcq',
          q: 'What does the scheduler actually write once it has made its decision?',
          o: [
            'It starts the containers on the chosen node',
            'It records a binding, which sets the Pod\'s <code>nodeName</code>',
            'It sends a gRPC call to the node\'s container runtime',
            'It updates the Deployment with the node list'
          ],
          a: 1,
          why: 'The scheduler\'s entire output is a name written into an API object. The kubelet on that node is watching, sees the Pod is now its problem, and takes over from there.' },

        { t: 'mcq',
          q: 'Why do Reserve and Unreserve exist as separate extension points?',
          o: [
            'To let plugins log their decisions',
            'So stateful plugins can tentatively claim resources and roll back if a later phase fails',
            'To pause scheduling while etcd compacts',
            'To retry the filter phase with different weights'
          ],
          a: 1,
          why: 'Between choosing a node and committing the binding, a plugin may need to hold something — a device, a volume slot. Unreserve gives that claim back, and it must be idempotent because it can fire more than once.' },

        { t: 'recall',
          q: 'Why is it wrong to say "the scheduler places the Pod on the node"?',
          pts: [
            'The scheduler only records a binding',
            'The kubelet on that node executes it',
            'They are separate loops that can fail independently'
          ],
          model: 'The scheduler only records a decision — a binding that sets nodeName. The node\'s kubelet is what turns that into a sandbox, volumes, network and containers. They are separate asynchronous loops, which is exactly why a Pod can be successfully scheduled and still never run.' }
      ]
    },
    {
      id: 'u6l2', title: 'Why is it still Pending?',
      items: [
        { t: 'teach',
          h: 'Requests are the scheduling currency, not usage',
          p: 'The scheduler filters on declared requests against allocatable capacity. Live utilisation does not enter the calculation. A cluster can sit at 15% measured CPU and still refuse to schedule anything, because every Pod requested far more than it uses.',
          clip: ['6p1XcgsFHsU', 202, 'Feasible nodes across availability zones'] },

        { t: 'multi',
          q: 'A Pod is Pending although dashboards show plenty of free CPU. Select everything worth checking.',
          o: [
            'Requests against allocatable capacity, not observed usage',
            'Node affinity, taints and tolerations',
            'Topology spread constraints and pod anti-affinity',
            'PVC topology and capacity, and host port conflicts',
            'The container image\'s compressed size'
          ],
          a: [0, 1, 2, 3],
          why: 'All four are real feasibility inputs, and the scheduler\'s events usually name which one failed. Image size affects startup time after scheduling — it never causes Pending.',
          src: ['Assigning Pods to Nodes', 'https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/'] },

        { t: 'cloze',
          q: 'Resources, required affinity, taints and volume topology ___ nodes; preferences only rank the survivors.',
          o: ['filter', 'score', 'preempt', 'reserve'],
          a: 0,
          why: 'Hard constraints remove nodes from consideration entirely. If filtering leaves nothing, no amount of scoring preference will help — which is why "add a preferred affinity" never fixes Pending.' },

        { t: 'mcq',
          q: 'Requests are set far above real usage across the cluster. What is the predictable consequence?',
          o: [
            'Nodes are OOM-killed constantly',
            'Low real utilisation with scheduling failures — you pay for capacity you cannot allocate',
            'The scheduler ignores requests and uses live metrics instead',
            'The API server throttles new Pods'
          ],
          a: 1,
          why: 'Over-requesting wastes allocatable capacity: the scheduler believes the node is full while the node is idle. Under-requesting produces the opposite failure — packing that leads to node pressure and eviction later.',
          src: ['Resource management', 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/'] },

        { t: 'recall',
          q: 'Walk through diagnosing a Pending Pod.',
          pts: [
            'Read the scheduler events on the Pod first — they usually name the failed predicate',
            'Compare requests against node allocatable, not usage',
            'Check affinity, taints, topology spread and host ports',
            'Check PVC binding mode, storage topology and capacity',
            'Check quotas'
          ],
          model: 'Start with the Pod\'s scheduling events, which normally name the predicate that failed and how many nodes each one eliminated. Then compare requests against allocatable capacity rather than observed usage, and work through affinity, taints, topology spread, host ports, PVC topology and capacity, and namespace quota. The point is to name the evidence that distinguishes them, not to recite commands.' }
      ]
    },
    {
      id: 'u6l3', title: 'Preemption is not eviction',
      items: [
        { t: 'teach',
          h: 'Different actor, different trigger, different victim',
          p: 'Scheduler preemption removes lower-priority Pods so a pending higher-priority Pod can be placed. Kubelet eviction terminates Pods because that node is under local pressure. API eviction is voluntary disruption and honours PodDisruptionBudgets. Three mechanisms, routinely collapsed into one word in interviews.',
          clip: ['-QAyxUWI7Fs', 0, 'Pod priority and how it drives preemption'] },

        { t: 'mcq',
          q: 'Which one is driven by the node running low on memory or disk?',
          o: ['Scheduler preemption', 'Kubelet eviction', 'API-initiated eviction', 'Deployment rollout'],
          a: 1,
          why: 'The kubelet watches its own node\'s pressure signals and terminates Pods using usage relative to requests, plus priority. Nothing in the control plane initiates it.' },

        { t: 'mcq',
          q: 'A pending Pod has a nominated node after preemption. What does that guarantee?',
          o: [
            'The Pod will definitely land on that node',
            'Nothing is guaranteed — it is a proposal, and the Pod may end up elsewhere or wait',
            'The node is now reserved exclusively for it',
            'Victims have already finished terminating'
          ],
          a: 1,
          why: 'The nominated node is a hint, not a reservation. Victims take time to terminate and the cluster can change in that window — a strong answer says so explicitly.',
          src: ['Priority and preemption', 'https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/'] },

        { t: 'mcq',
          q: 'You want a high-priority Pod to jump the queue but never displace anything. What do you reach for?',
          o: [
            'A PodDisruptionBudget on the lower-priority workloads',
            'A preemption policy of Never on its priority class',
            'A lower priority value',
            'A node taint'
          ],
          a: 1,
          why: 'Priority governs queue order and preemption separately. Setting the preemption policy to Never keeps the queue advantage while removing the ability to evict victims.',
          clip: ['-QAyxUWI7Fs', 180, 'Setting preemptionPolicy to Never'] },

        { t: 'recall',
          q: 'Preemption versus eviction — give the interview answer.',
          pts: [
            'Preemption: the scheduler removes lower-priority Pods to place a pending higher-priority Pod',
            'Kubelet eviction: the node terminates Pods under local resource pressure',
            'API eviction: voluntary disruption, honours PDBs',
            'Different actors and triggers, so different evidence'
          ],
          model: 'Scheduler preemption removes lower-priority Pods so a pending higher-priority Pod becomes schedulable — the trigger is a pending Pod. Kubelet eviction terminates Pods because that node is under memory or disk pressure — the trigger is local. API-initiated eviction represents voluntary disruption, honours PodDisruptionBudgets, and is what a drain uses. Different actors, so you look in different places for the evidence.' }
      ]
    }
  ]
},

{
  id: 'u7', n: 7, ref: 'm7',
  title: 'Kubelet, CRI & Pods',
  tag: 'Node runtime',
  blurb: 'Where an API object finally becomes processes, mounts and probes.',
  lessons: [
    {
      id: 'u7l1', title: 'From binding to processes',
      items: [
        { t: 'teach',
          h: 'The kubelet is a sync loop, not a command receiver',
          p: 'Nobody tells the kubelet to start a Pod. It watches for Pods assigned to its node and drives them toward their desired state. It coordinates runtime, network, storage, secrets, probes and status reporting. Init containers are the one hard gate in that sequence: each must exit successfully before the next one starts, and no application container starts until every one of them has. A failed init container is restarted until it succeeds, unless the Pod <code>restartPolicy</code> is Never, which fails the whole Pod.',
          flow: ['Bound Pod', 'Sandbox network + required volumes converge', 'Init containers in order', 'Application containers', 'Probes + readiness'],
          src: ['Init Containers', 'https://kubernetes.io/docs/concepts/workloads/pods/init-containers/'],
          clip: ['PLCt3lSoXOw', 254, 'Kubelet picks up the Pod and containerd builds the sandbox'] },

        { t: 'multi',
          q: 'Which statements describe node setup after a Pod is bound?',
          o: ['Kubelet observes the Pod assigned to its node', 'Required volume work and sandbox networking can progress concurrently', 'Both required storage and sandbox networking must be ready before application containers start', 'Init containers run to completion in order before application containers', 'Kubernetes guarantees that every volume mounts before the sandbox is created'],
          a: [0, 1, 2, 3],
          why: 'Kubernetes does not promise one total node-setup order. Required storage and sandbox networking are converging prerequisites; init containers then run in order before application containers.',
          src: ['Pod lifecycle', 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/'] },

        { t: 'mcq',
          q: 'What is the Pod sandbox for?',
          o: [
            'Running a security scanner alongside your containers',
            'Anchoring the isolation and network namespaces that the Pod\'s containers share',
            'Caching container images on the node',
            'Holding the Pod\'s persistent volume'
          ],
          a: 1,
          why: 'It gives the runtime a Pod-level namespace anchor. If initial network setup fails, application containers normally do not start and the Pod remains in ContainerCreating; a running Pod can lose network later.' },

        { t: 'recall',
          q: 'Why can the API show stale Pod status during a node failure?',
          pts: [
            'Status is reported asynchronously by the kubelet',
            'Loss of connectivity prevents updates, so the last value persists',
            'Lease renewTime and Node status stop advancing',
            'After the monitoring grace period the node controller marks Ready Unknown and adds the unreachable taint',
            'Eviction then depends on tolerations and controller policy'
          ],
          model: 'Pod status is written by the kubelet asynchronously. If the node or its connectivity dies, no further updates arrive, so the API can keep showing the last reported state. Lease objects do not expire themselves: renewTime and Node status stop advancing. After the monitoring grace period the node controller marks Ready Unknown and adds the unreachable taint; eviction then follows tolerations and controller policy.',
          src: ['Kubelet sync loop', 'https://kubernetes.io/docs/reference/node/kubelet-sync-loop/'] }
      ]
    },
    {
      id: 'u7l2', title: 'Four acronyms, four boundaries',
      items: [
        { t: 'teach',
          h: 'Do not collapse CRI, OCI, CNI and CSI into "the runtime"',
          p: 'CRI is the gRPC contract between kubelet and a runtime such as containerd. OCI specifies lower-level image and runtime primitives. CNI configures sandbox networking in common runtime integrations. CSI handles storage. Each boundary has a distinct failure signature: start with Pod events and kubelet logs, then use runtime or CSI node-plugin logs for deeper detail.',
          clip: ['gjk82Y2vyro', 1215, 'Why the Container Runtime Interface exists'] },

        { t: 'mcq',
          q: 'Which boundary does the kubelet speak across to create a container?',
          o: ['OCI', 'CRI', 'CNI', 'CSI'],
          a: 1,
          why: 'The kubelet talks CRI — a gRPC runtime service and image service. OCI is what containerd uses further down when it invokes a runtime such as runc.',
          src: ['Container Runtime Interface', 'https://kubernetes.io/docs/concepts/containers/cri/'] },

        { t: 'cloze',
          q: 'Configuring the network attachment for the Pod sandbox is the job of ___.',
          o: ['CNI', 'CRI', 'OCI', 'kube-proxy'],
          a: 0,
          why: 'CNI attaches Pod networking. kube-proxy solves a different problem — it implements Service VIP forwarding, not per-Pod attachment.' },

        { t: 'mcq',
          q: 'containerd calls runc, which creates namespaces and cgroups for the process. Which specification governs that layer?',
          o: ['CRI', 'OCI', 'CNI', 'CSI'],
          a: 1,
          why: 'OCI describes the runtime and image primitives below the CRI boundary. It is not an interface the kubelet uses directly, which is the distinction interviewers are usually probing.',
          clip: ['PLCt3lSoXOw', 389, 'containerd calls runc; pause is PID 1'] },

        { t: 'recall',
          q: 'Distinguish CRI, OCI and CNI.',
          pts: [
            'CRI connects the kubelet to the container runtime',
            'OCI specifies image and runtime primitives used below that boundary',
            'CNI configures network attachment for the Pod sandbox'
          ],
          model: 'For container and image operations, CRI is the gRPC contract connecting kubelet to a runtime such as containerd. OCI specifies image and low-level runtime behaviour beneath that boundary; runc implements an OCI runtime. CNI is the executable network-plugin contract used by common runtimes for sandbox attachment. Start with Pod events and kubelet logs, then move to runtime or plugin detail.' }
      ]
    },
    {
      id: 'u7l3', title: 'Running is not ready',
      items: [
        { t: 'teach',
          h: 'Phase is not health',
          p: 'Running is a Pod phase: the Pod is bound, all containers are created, and at least one is running, starting or restarting. It does not prove application health. Ready means configured checks and readiness gates pass. A startup probe gates liveness and readiness for the same container; readiness changes an EndpointSlice condition rather than removing the address.',
          clip: ['PLCt3lSoXOw', 423, 'Running does not mean ready'] },

        { t: 'mcq',
          q: 'A liveness probe and a readiness probe both fail. What is the difference in consequence?',
          o: [
            'Both restart the container',
            'After its failure threshold, liveness stops the container and restartPolicy governs what follows; readiness marks the Pod not ready without restarting it',
            'Both remove the Pod from endpoints',
            'Readiness restarts the container; liveness removes it from endpoints'
          ],
          a: 1,
          why: 'Readiness normally flips the EndpointSlice endpoint to ready:false while retaining its address. A too-aggressive liveness probe can turn a slow dependency into a restart loop.',
          src: ['Probes', 'https://kubernetes.io/docs/concepts/workloads/pods/probes/'] },

        { t: 'mcq',
          q: 'What is a startup probe for?',
          o: [
            'Replacing the readiness probe entirely',
            'Gating liveness and readiness while a slow application initialises',
            'Checking the image was pulled correctly',
            'Verifying volumes mounted'
          ],
          a: 1,
          why: 'Without it you must loosen the liveness probe to accommodate the slowest possible startup, which then leaves the running container barely supervised.' },

        { t: 'multi',
          q: 'A Pod is Running but receives no traffic. Select the things actually worth inspecting.',
          o: [
            'Container readiness and the readiness probe result',
            'An EndpointSlice containing the Pod IP with ready:true',
            'Service selector and port definitions',
            'The Pod\'s phase field'
          ],
          a: [0, 1, 2],
          why: 'Start with selector membership, then the endpoint ready condition and targetPort/listener. Phase is exactly what already misled you: Running is not proof of health or traffic eligibility.' },

        { t: 'recall',
          q: 'Describe what happens between "delete this Pod" and the process being gone.',
          pts: [
            'Deletion starts a grace period',
            'PreStop runs before the runtime sends the configured stop signal',
            'EndpointSlice termination and local shutdown progress concurrently',
            'Force kill after the grace period expires',
            'The ordering is concurrent and is not a transaction'
          ],
          model: 'Deletion sets a timestamp and starts the grace period. The EndpointSlice controller marks the endpoint terminating while kubelet starts local shutdown. PreStop runs before the runtime sends the configured stop signal, which is not necessarily TERM. These paths overlap. A bounded delay can reduce the race but cannot prove propagation, so the application must drain work. At expiry the runtime force-kills remaining processes.',
          src: ['Container lifecycle hooks', 'https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/'] }
      ]
    }
  ]
},

{
  id: 'u8', n: 8, ref: 'm8',
  title: 'Networking & the data plane',
  tag: 'Packets',
  blurb: 'Pod reachability and Service identity are two different problems with two different owners.',
  lessons: [
    {
      id: 'u8l1', title: 'Service identity',
      items: [
        { t: 'teach',
          h: 'A Service is a stable name over a changing set of Pods',
          p: 'A network implementation configures Pod reachability; CNI is the executable contract commonly used for attachment. The EndpointSlice controller records selector-matched backends and their conditions. kube-proxy, or a replacement data plane, turns Service addresses into backend traffic. These are separate responsibilities and failure boundaries.',
          flow: ['DNS / Service VIP', 'Node data-plane lookup', 'Select EndpointSlice backend', 'Route to Pod IP', 'Policy + listener'],
          clip: ['PLCt3lSoXOw', 434, 'EndpointSlice controller feeds kube-proxy'] },

        { t: 'teach',
          h: 'NodePort opens the same port on every node',
          p: 'A NodePort Service keeps its ClusterIP and adds a port that every node proxies into the Service. The control plane allocates it from <code>--service-node-port-range</code>, 30000–32767 by default, and reports it in <code>.spec.ports[].nodePort</code>; you may set that field yourself to a free port in range. <code>targetPort</code> is still the container port traffic lands on. <code>externalTrafficPolicy: Local</code> preserves the client address but makes nodes with no local ready endpoint drop the request, so it breaks "reachable on any node".',
          src: ['Service type NodePort', 'https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport'] },

        { t: 'teach',
          h: 'Stickiness is a Service field, not a proxy accident',
          p: 'Set <code>.spec.sessionAffinity</code> to <code>ClientIP</code> and later connections from one client address go to the same backend Pod, for <code>sessionAffinityConfig.clientIP.timeoutSeconds</code> — three hours by default. The default is <code>None</code>, which gives no affinity at all. Affinity is about which backend a client keeps; it says nothing about which node serves the traffic.',
          src: ['Session affinity', 'https://kubernetes.io/docs/reference/networking/virtual-ips/#session-affinity'] },

        { t: 'mcq',
          q: 'For a selector Service, what puts a Pod\'s IP into an EndpointSlice?',
          o: [
            'The scheduler, when it binds the Pod',
            'The Service selector matching the Pod labels',
            'kube-proxy, when it programs the node',
            'CoreDNS, when the name is first resolved'
          ],
          a: 1,
          why: 'Label matching controls membership. Readiness normally changes the endpoint ready condition; an unready address can remain in the slice with ready:false, and publishNotReadyAddresses changes normal treatment.',
          src: ['Services and EndpointSlices', 'https://kubernetes.io/docs/concepts/services-networking/service/'],
          clip: ['gjk82Y2vyro', 1080, 'What kube-proxy is responsible for'] },

        { t: 'mcq',
          q: 'What does <code>clusterIP: None</code> change?',
          o: [
            'The Service stops working',
            'VIP proxying is removed and DNS returns endpoint addresses, moving selection to the client',
            'Traffic is load balanced more evenly',
            'The Service becomes external-only'
          ],
          a: 1,
          why: 'A headless Service removes the virtual IP and kube-proxy handling. DNS returns endpoint records, so selection and any load balancing depend on the client or resolver. This is also what StatefulSet per-Pod DNS relies on.' },

        { t: 'mcq',
          q: 'A NetworkPolicy allows traffic from namespace A to your Pod. What has it proven?',
          o: [
            'That traffic will reach your Pod',
            'Only that the policy layer permits the flow — routing must exist, a plugin must enforce policy, and the app must be listening',
            'That a route was created between the namespaces',
            'That the Service selector matches'
          ],
          a: 1,
          why: 'A destination ingress rule is only one side: an isolating egress policy at the source must also allow the flow. Policies create no routes and expose no core enforcement status; unsupported implementations can store the object without enforcing it.',
          src: ['NetworkPolicy', 'https://kubernetes.io/docs/concepts/services-networking/network-policies/'] },

        { t: 'recall',
          q: 'CNI versus kube-proxy — what does each own?',
          pts: [
            'CNI configures Pod network attachment and reachability',
            'kube-proxy implements Service VIP forwarding to backends',
            'One product may replace both, but the contracts stay distinct'
          ],
          model: 'The network implementation configures Pod reachability, commonly through the CNI execution contract. kube-proxy implements Service VIP forwarding, while another data plane can replace it. One product can own both paths, but Pod attachment and Service translation remain distinct contracts and failure questions.' }
      ]
    },
    {
      id: 'u8l2', title: 'Two data planes, one contract',
      items: [
        { t: 'teach',
          h: 'Service semantics outlive any one data plane',
          p: 'iptables, IPVS and nftables are Linux kube-proxy modes; an eBPF data plane is a separate replacement implementation. Kubernetes 1.35 deprecated IPVS mode and recommends nftables as its Linux replacement. Manifests usually stay stable, but behavior remains implementation-specific.',
          clip: ['lkXLsD6-4jA', 1263, 'iptables was a firewall, never a load balancer'] },

        { t: 'mcq',
          q: 'Someone says "IPVS is O(1) so it is always faster than iptables". What is the strongest correction?',
          o: [
            'IPVS is actually slower in all cases',
            'Lookup complexity is one factor among rule-update cost, locality, kernel version and semantic differences',
            'They are identical implementations with different names',
            'iptables has been removed from Kubernetes'
          ],
          a: 1,
          why: 'The slogan is not wrong about lookup, but IPVS is deprecated and lookup is only one axis. Update cost, locality, kernel support and Service semantics matter too.',
          src: ['Virtual IPs and Service proxies', 'https://kubernetes.io/docs/reference/networking/virtual-ips/'] },

        { t: 'mcq',
          q: 'Where can an eBPF data plane translate a Service address with the least overhead?',
          o: [
            'In the application, via a sidecar',
            'At the socket layer, before packets are ever built',
            'In the NIC firmware only',
            'In userspace, by proxying every connection'
          ],
          a: 1,
          why: 'Translating at the socket removes the per-packet rewrite on that path entirely. It is also transparent to the application, which never learns the address changed.',
          clip: ['bIRwSIwNHC0', 1350, 'Socket-level Service translation with eBPF'] },

        { t: 'mcq',
          q: 'Does an eBPF data plane necessarily remove kernel conntrack?',
          o: [
            'Yes — eBPF is stateless by design',
            'No — some modes use BPF maps, while others retain kernel conntrack for some traffic',
            'Yes, but only for UDP',
            'No — it uses netfilter conntrack exactly as kube-proxy does'
          ],
          a: 1,
          why: 'Separate the requirement from a product and mode. Stateful flow tracking remains; where that state lives is implementation-specific.',
          src: ['Cilium kube-proxy replacement', 'https://docs.cilium.io/en/stable/network/kubernetes/kubeproxy-free/'],
          clip: ['bIRwSIwNHC0', 1110, 'eBPF still creates connection-tracking entries'] },

        { t: 'recall',
          q: 'DNS resolves but the ClusterIP times out. Trace it.',
          pts: [
            'Check the Service selector, ports and EndpointSlices',
            'Confirm the process listens on the resolved endpoint port',
            'Test a ready Pod IP directly to split Service from Pod',
            'Inspect data-plane programming: kube-proxy rules or BPF maps, and conntrack',
            'If the direct path fails, verify routing, MTU and NetworkPolicy'
          ],
          model: 'Check the Service selector, port mapping and EndpointSlices, then confirm the target process listens on the resolved endpoint port. From the same source, test a ready Pod IP and port. If that works, inspect the Service data plane. If the direct path fails, inspect routing, MTU and NetworkPolicy.' }
      ]
    },
    {
      id: 'u8l3', title: 'How a Pod gets its network',
      items: [
        { t: 'teach',
          h: 'A CNI plugin is a program, not a service',
          p: 'CNI is a vendor-neutral specification, a reference implementation, and a suite of plugins. A plugin is an <em>executable</em>. The runtime sets <code>CNI_COMMAND</code> and friends, writes JSON config to its stdin, and reads a JSON result from its stdout. It runs in the host network domain, not inside the container.',
          flow: ['Kubelet requests sandbox over CRI', 'Common runtime loads network configuration', 'Runtime invokes plugin chain', 'Implementation wires the netns', 'Result may include IP, routes, DNS'],
          note: 'Currency check: the maintainer talks below describe four operations. CNI 1.1 adds GC and STATUS on top of ADD, DEL, CHECK and VERSION — verify against the spec version your cluster ships.',
          clip: ['YWXucnygGmY', 528, 'The runtime calls the plugin to configure the namespace'] },

        { t: 'mcq',
          q: 'Which component actually invokes the CNI plugin?',
          o: [
            'The kubelet, directly',
            'The container runtime, after it has created the Pod sandbox',
            'kube-proxy, when it programs the node',
            'The API server, during admission'
          ],
          a: 1,
          why: 'Kubelet requests sandbox creation over CRI. Common runtimes then invoke CNI, but CRI does not require CNI. Start with Pod events and kubelet logs; runtime logs usually contain deeper plugin detail.',
          src: ['Network plugins', 'https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/'],
          clip: ['YWXucnygGmY', 528, 'The runtime calls out to its CNI plugin'] },

        { t: 'mcq',
          q: 'What kind of program is a CNI plugin?',
          o: [
            'A long-running daemon on every node',
            'An executable run once per operation — config on stdin, JSON result on stdout, exit code for success',
            'A controller watching the API server',
            'A kernel module loaded at boot'
          ],
          a: 1,
          why: 'The plugin binary is exec\'d and exits. Products like Calico and Cilium <em>also</em> run a node agent. That agent is not the CNI plugin. It is a separate process the short-lived binary talks to.',
          src: ['CNI specification', 'https://www.cni.dev/docs/spec/'],
          clip: ['YWXucnygGmY', 652, 'That is the whole mechanism of calling a plugin'] },

        { t: 'cloze',
          q: 'The runtime tells the plugin what to do through the ___ environment variable, alongside CNI_CONTAINERID, CNI_NETNS and CNI_IFNAME.',
          o: ['CNI_COMMAND', 'CNI_VERB', 'CNI_ACTION', 'CNI_OP'],
          a: 0,
          why: 'Configuration arrives on stdin, but the <em>operation</em> arrives in the environment. ADD, DEL, CHECK and VERSION are the long-standing set; CNI 1.1 adds GC and STATUS.',
          src: ['CNI specification', 'https://www.cni.dev/docs/spec/'],
          clip: ['zChkx-AB5Xc', 763, 'The verbs that form the basis of CNI operations'] },

        { t: 'mcq',
          q: 'Which statement about Pod IP allocation is portable?',
          o: [
            'The kubelet assigns it from the node\'s CIDR',
            'A network plugin can delegate to IPAM, but some implementations allocate through their own node agent',
            'kube-proxy allocates it when programming the node',
            'The API server allocates it and writes it into the Pod spec'
          ],
          a: 1,
          why: 'IPAM delegation is optional. A delegated plugin receives the full configuration and can return addresses, gateways, routes and DNS; other implementations allocate through an agent or internal mechanism.',
          src: ['CNI specification', 'https://www.cni.dev/docs/spec/'] },

        { t: 'mcq',
          q: 'In a CNI plugin chain, what does each plugin operate on?',
          o: [
            'Its own separate interface, one per plugin',
            'The same single interface, each adding behaviour in turn',
            'A copy of the namespace, merged at the end',
            'A different Pod each'
          ],
          a: 1,
          why: 'Chaining adds behaviour to one interface: bandwidth limiting, host-port mapping, tuning. The results merge into a single JSON structure. Several interfaces need separate configs, not a chain.',
          clip: ['YWXucnygGmY', 885, 'Each plugin in a chain operates on one interface'] },

        { t: 'multi',
          q: 'A Pod is stuck in ContainerCreating with a network setup error. Select what is genuinely worth checking.',
          o: [
            'Pod events and kubelet logs for the failed sandbox request',
            'The container runtime\'s logs for deeper plugin detail',
            'CNI config and plugin binaries present on that node',
            'IPAM exhaustion for the node\'s allocatable range',
            'The Service\'s EndpointSlice membership'
          ],
          a: [0, 1, 2, 3],
          why: 'The failure is below the Service layer. Start with events and kubelet evidence, then inspect runtime/plugin detail, node-local configuration and allocation capacity.',
          src: ['Network plugins', 'https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/'] },

        { t: 'recall',
          q: 'Trace how a Pod gets its IP address, end to end.',
          pts: [
            'Kubelet asks the runtime for a sandbox over CRI',
            'Runtime creates the sandbox; common runtimes load network configuration and invoke CNI',
            'For CNI, CNI_COMMAND=ADD is in the environment and config is on stdin',
            'The plugin may delegate allocation to IPAM or use another implementation-specific allocator',
            'The implementation wires the interface and applies returned network data',
            'One JSON result returns to the runtime; the kubelet proceeds to containers'
          ],
          model: 'Kubelet asks the runtime to create a Pod sandbox over CRI. CRI does not require CNI, but common runtimes load network configuration and invoke a CNI plugin chain against the sandbox namespace. For ADD, the operation is in the environment and configuration is on stdin. Allocation may be delegated to IPAM or handled by another agent. The implementation wires the interface and returns its result; application containers start only after required sandbox networking and storage are ready.',
          clip: ['zChkx-AB5Xc', 1035, 'The result the chain returns to the runtime'] }
      ]
    }
  ]
},

{
  id: 'u9', n: 9, ref: 'm9',
  title: 'DNS & CoreDNS',
  tag: 'Names',
  blurb: 'Resolver policy on one side, a compiled plugin chain on the other. Most DNS bugs live in between.',
  lessons: [
    {
      id: 'u9l1', title: 'Resolver policy',
      items: [
        { t: 'teach',
          h: 'The query that leaves the Pod is not the name you typed',
          p: 'The kubelet writes the Pod\'s resolver settings. Search domains and <code>ndots</code> then decide how a partially qualified name is expanded before it is ever sent. Reading the actual <code>resolv.conf</code> inside the Pod is the first move in almost every DNS investigation.',
          flow: ['Application resolver', 'search + ndots', 'kube-dns Service', 'CoreDNS plugins', 'cluster answer / upstream'],
          clip: ['lAUmdIGP_fE', 247, 'Reading resolv.conf inside a Pod'] },

        { t: 'teach',
          h: '<code>Default</code> is not the default policy',
          p: 'Four values decide which resolver the kubelet writes. Omit <code>dnsPolicy</code> and you get <code>ClusterFirst</code>. <code>Default</code> is a named choice that copies the node\'s own resolver. <code>ClusterFirstWithHostNet</code> is what a <code>hostNetwork</code> Pod needs to keep cluster DNS. <code>None</code> ignores the cluster settings entirely and requires <code>dnsConfig.nameservers</code>. Under any policy but None, <code>dnsConfig</code> entries merge with what the kubelet already wrote — they do not replace cluster DNS.',
          src: ['Pod DNS policy', 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-s-dns-policy'] },

        { t: 'mcq',
          q: 'Why can a high <code>ndots</code> value make external names slow?',
          o: [
            'It increases the DNS timeout',
            'A name with few dots is tried against every search suffix first, producing NXDOMAINs before the real lookup',
            'It disables caching',
            'It forces TCP instead of UDP'
          ],
          a: 1,
          why: 'Each suffix is a real round trip that fails before the correct absolute query is finally sent. Multiply that by every request and it becomes latency and load nobody can attribute.',
          src: ['DNS for Services and Pods', 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/'],
          clip: ['lAUmdIGP_fE', 427, 'How ndots turns one lookup into several'] },

        { t: 'cloze',
          q: 'Appending a trailing dot to a name makes it ___, so search expansion is skipped entirely.',
          o: ['absolute', 'headless', 'cached', 'authoritative'],
          a: 0,
          why: 'A fully qualified name ends the search list. It is the cheapest possible fix for search amplification when you control the client.' },

        { t: 'mcq',
          q: 'What does NodeLocal DNSCache change?',
          o: [
            'It replaces CoreDNS entirely',
            'It adds a per-node cache that shortens the path and reduces UDP/conntrack pressure — and adds another layer to diagnose',
            'It removes the need for search domains',
            'It makes DNS answers strongly consistent'
          ],
          a: 1,
          why: 'It genuinely relieves load and conntrack pressure. A strong answer also names the cost: one more cache, listener and configuration surface between the application and the truth.',
          src: ['NodeLocal DNSCache', 'https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/'] },

        { t: 'recall',
          q: 'Resolve <code>payments.prod.svc.cluster.local</code> end to end.',
          pts: [
            'The name is already absolute, so search expansion does not apply',
            'The resolver sends it to its configured DNS endpoint, possibly NodeLocal DNS',
            'CoreDNS\'s kubernetes plugin answers from watched Service and EndpointSlice state',
            'The reply travels back over the node network path'
          ],
          model: 'The name is fully qualified, so the resolver sends it straight to its configured DNS endpoint — which may be a NodeLocal DNS cache before the kube-dns Service. CoreDNS handles it, and its kubernetes plugin answers from the Service and EndpointSlice state it watches from the API server. The reply then follows the node network path back to the Pod.' }
      ]
    },
    {
      id: 'u9l2', title: 'The plugin chain',
      items: [
        { t: 'teach',
          h: 'Corefile order is not execution order',
          p: 'The Corefile selects and configures plugins, server blocks and zones. The compiled <code>plugin.cfg</code> in the binary defines the order in which the chain executes. Reordering lines in your Corefile does not reorder the chain — this distinction is the single most misunderstood thing about CoreDNS.',
          clip: ['lAUmdIGP_fE', 990, 'Plugin order lives in plugin.cfg, not the Corefile'] },

        { t: 'mcq',
          q: 'You move the <code>cache</code> line above <code>kubernetes</code> in your Corefile. What changes about execution order?',
          o: [
            'Cache now runs first',
            'Nothing — chain order comes from the compiled plugin.cfg',
            'CoreDNS refuses to start',
            'Both plugins now run in parallel'
          ],
          a: 1,
          why: 'The Corefile enables and configures; the binary decides sequence. Genuinely changing the order means rebuilding CoreDNS with a modified plugin.cfg.',
          src: ['CoreDNS configuration', 'https://coredns.io/manual/configuration/'],
          clip: ['bfUzLOFwns8', 2137, 'Why changing plugin order means recompiling'] },

        { t: 'mcq',
          q: 'What does the CoreDNS <code>kubernetes</code> plugin use as its source of truth?',
          o: [
            'A zone file written by the cluster administrator',
            'Watched Service and EndpointSlice objects from the API server',
            'A periodic scrape of every Pod',
            'etcd, read directly'
          ],
          a: 1,
          why: 'It synthesises records from watched API state. DNS answers therefore lag reality by exactly as much as that watch does. A stalled watch shows up as stale records.',
          src: ['CoreDNS kubernetes plugin', 'https://coredns.io/plugins/kubernetes/'],
          clip: ['lAUmdIGP_fE', 940, 'The plugin watching Services and endpoints'] },

        { t: 'cloze',
          q: 'When a plugin declines to answer and lets the next one in the chain try, that behaviour is called ___.',
          o: ['fallthrough', 'forwarding', 'delegation', 'recursion'],
          a: 0,
          why: 'Fallthrough passes the query along the chain. Forwarding sends it to an entirely different upstream server — different mechanism, different failure.' },

        { t: 'recall',
          q: 'CoreDNS reports Ready. What has that not proven?',
          pts: [
            'Service routing to the DNS Service',
            'Freshness of its API watch',
            'Correctness of the synthesised records',
            'Upstream health for forwarded names',
            'Cache freshness and the node-local path',
            'Client resolver behaviour'
          ],
          model: 'Only that the process runs and its plugins started. It proves nothing else. The DNS Service may not route to it. Its API watch may be stale, so the records it synthesises may be wrong. Upstream resolvers may be down for forwarded names. A node-local cache may serve stale answers. And the client resolver may expand names differently from how you assume.' }
      ]
    }
  ]
},

{
  id: 'u10', n: 10, ref: 'm10',
  title: 'Storage & CSI',
  tag: 'Stateful',
  blurb: 'A controller path and a node path, joined by API objects — and coupled to scheduling.',
  lessons: [
    {
      id: 'u10l1', title: 'Claim, class, volume',
      items: [
        { t: 'teach',
          h: 'Three objects, three different jobs',
          p: 'A PVC is a namespaced request for storage. A StorageClass describes how to provision it and when to bind. A PV represents the actual provisioned capacity and its lifecycle. Getting these three straight is the entry ticket to every storage question that follows.',
          flow: ['PVC', 'StorageClass + provisioner', 'PV binding', 'VolumeAttachment', 'CSI stage / publish'],
          clip: ['0swOh5C3OVM', 1080, 'StorageClass provisions PVs dynamically'] },

        { t: 'teach',
          h: 'The reclaim policy decides what a deleted claim leaves behind',
          p: 'Delete, the usual policy on a dynamic class, removes the PV and its backing storage with the claim. Retain keeps the PV: its phase becomes <code>Released</code> and its <code>claimRef</code> still names the deleted claim, so no other PVC can bind until an administrator clears that reference or recreates the volume. Released is not Available, and a Retain volume that nothing ever bound to is a different state again.',
          flow: ['Bound PV + PVC', 'PVC deleted', 'reclaim policy applies', 'Retain → Released, claimRef kept', 'admin reclaims manually'],
          src: ['Persistent volume Retain', 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/#retain'] },

        { t: 'mcq',
          q: 'Which object is the namespaced <em>request</em> for storage?',
          o: ['PersistentVolume', 'PersistentVolumeClaim', 'StorageClass', 'VolumeAttachment'],
          a: 1,
          why: 'The PVC is what the application author writes. The PV is cluster-scoped capacity, and the StorageClass is the provisioning recipe — neither belongs to a namespace.',
          src: ['Persistent volumes', 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/'],
          clip: ['0swOh5C3OVM', 0, 'PV, PVC and StorageClass introduced'] },

        { t: 'mcq',
          q: 'A PVC using <code>WaitForFirstConsumer</code> sits Pending with no Pod referencing it. Is that a bug?',
          o: [
            'Yes — provisioning has failed',
            'No — that binding mode intentionally waits for a Pod so scheduling can pick a compatible topology first',
            'Yes — the StorageClass is misconfigured',
            'No, but only because the cluster has no capacity'
          ],
          a: 1,
          why: 'This binding mode exists precisely so that storage is created in a zone the Pod can actually be scheduled into. Pending is the designed state, not a failure.',
          src: ['Storage classes', 'https://kubernetes.io/docs/concepts/storage/storage-classes/'] },

        { t: 'multi',
          q: 'A PVC is Pending. Select the evidence that actually distinguishes causes.',
          o: [
            'The StorageClass and its binding mode',
            'The provisioner and reported CSI capacity',
            'PVC events, requested access mode and namespace quota',
            'Topology constraints of the candidate nodes',
            'The number of replicas in the Deployment'
          ],
          a: [0, 1, 2, 3],
          why: 'Each one separates a different cause: intentional waiting, no capacity, quota rejection, or no topologically compatible node. Replica count tells you nothing about why one claim cannot bind.' },

        { t: 'recall',
          q: 'PV, PVC and StorageClass — one sentence each.',
          pts: [
            'PVC: a namespaced request for storage',
            'PV: cluster storage capacity and its lifecycle',
            'StorageClass: dynamic provisioning parameters and binding behaviour'
          ],
          model: 'A PersistentVolumeClaim is a namespaced request for storage with a size, access mode and class. A PersistentVolume represents actual cluster storage capacity and carries its reclaim and lifecycle behaviour. A StorageClass describes how volumes of that class are dynamically provisioned and when they bind.' }
      ]
    },
    {
      id: 'u10l2', title: 'CSI has two halves',
      items: [
        { t: 'teach',
          h: 'Controller path and node path',
          p: 'Four control-plane sidecars watch Kubernetes objects and call CSI Controller RPCs: provisioner, attacher, resizer and snapshotter. A privileged node plugin then runs NodeStageVolume and NodePublishVolume so the kubelet can mount into the container. The two halves meet through API objects such as PV and VolumeAttachment.',
          clip: ['k_8rWPwJ_38', 3060, 'The CSI Controller and Node RPC sets'] },

        { t: 'order',
          q: 'Order the journey from claim to container mount.',
          o: ['PVC created against a StorageClass', 'external-provisioner calls CreateVolume', 'PV is created and bound', 'external-attacher drives ControllerPublishVolume', 'Node plugin runs NodeStageVolume', 'Node plugin runs NodePublishVolume', 'Container sees the mount'],
          why: 'Stage happens once per node, publish happens per Pod target path. Knowing which of the two failed tells you whether the problem is the device or the bind mount.',
          src: ['CSI specification', 'https://github.com/container-storage-interface/spec/blob/master/spec.md'] },

        { t: 'mcq',
          q: 'Which half of CSI must run as a privileged plugin on every node?',
          o: [
            'The controller service and its sidecars',
            'The node service, because it performs the actual staging and mounting',
            'Neither — CSI runs entirely in the control plane',
            'Both, on every node'
          ],
          a: 1,
          why: 'Mounting is a node-local, privileged operation. The controller half talks to the storage provider\'s API and can run anywhere the control plane runs.',
          src: ['Developing a CSI driver', 'https://kubernetes-csi.github.io/docs/developing.html'] },

        { t: 'mcq',
          q: 'Why does <code>WaitForFirstConsumer</code> mean storage is not simply a post-scheduling phase?',
          o: [
            'Because the kubelet provisions the volume itself',
            'Because provisioning is coupled to the scheduler\'s tentative topology choice',
            'Because volumes must exist before any Pod is created',
            'Because the scheduler ignores volume constraints'
          ],
          a: 1,
          why: 'The scheduler and the provisioner have to agree on a zone. That handshake is why storage topology can make a Pod unschedulable and why the two subsystems cannot be reasoned about separately.',
          src: ['Storage capacity', 'https://kubernetes.io/docs/concepts/storage/storage-capacity/'] },

        { t: 'recall',
          q: 'A Pod is scheduled but stuck mounting. Where do you look, in order?',
          pts: [
            'VolumeAttachment: did attach succeed?',
            'CSI sidecar logs on the control-plane side',
            'CSI node plugin registration and logs on that node',
            'Kubelet logs for stage/publish errors',
            'Credentials, device state, filesystem, and multi-attach constraints'
          ],
          model: 'Binding succeeded, so work down the chain. Check the VolumeAttachment to see whether controller-side attach completed. Then read the external-attacher and provisioner sidecar logs. Then confirm the CSI node plugin is registered and healthy on that node. Then read kubelet logs for NodeStage and NodePublish errors. Below those sit credentials, device state, filesystem creation and multi-attach limits. Each produces a different error, so the message tells you which one you hit.' }
      ]
    }
  ]
},

{
  id: 'u11', n: 11, ref: 'm11',
  title: 'HA, etcd & recovery',
  tag: 'Availability',
  blurb: 'Quorum maths, replaceable replicas, and a backup you have actually restored.',
  lessons: [
    {
      id: 'u11l1', title: 'Quorum',
      items: [
        { t: 'teach',
          h: 'A write is durable only after a majority commits it',
          p: 'API-server replicas are replaceable, so any one can serve any request. etcd members are not. They form a consensus group, and a majority — <code>floor(N/2)+1</code> — must commit before a write is acknowledged. Confusing the two is the most common HA mistake.',
          clip: ['n9VKAKwBj_0', 800, 'Quorum, leader election and log replication'] },

        { t: 'mcq',
          q: 'How many members must commit a write in a five-member etcd cluster?',
          o: ['2', '3', '4', '5'],
          a: 1,
          why: '<code>floor(5/2)+1 = 3</code>. That also means five members tolerate two failures, where three members tolerate only one.',
          src: ['etcd failure modes', 'https://etcd.io/docs/v3.6/op-guide/failures/'] },

        { t: 'mcq',
          q: 'Why does adding a fourth etcd member not improve fault tolerance?',
          o: [
            'Because etcd only supports odd membership',
            'Quorum rises from two-of-three to three-of-four, so both still tolerate exactly one failure',
            'Because the fourth member cannot vote',
            'Because writes become read-only above three members'
          ],
          a: 1,
          why: 'You pay for another member in replication and coordination cost and get no additional tolerance. Five is the next step that actually buys anything.',
          clip: ['gjk82Y2vyro', 247, 'etcd, Raft and read consistency'] },

        { t: 'cloze',
          q: 'Scheduler and controller-manager replicas use ___ so exactly one is the active writer while the others stand by.',
          o: ['leader election', 'sharding', 'quorum', 'round-robin DNS'],
          a: 0,
          why: 'They are not consensus members — they are hot standbys coordinating through a Lease. That is a different availability model from etcd\'s and is worth saying out loud.',
          src: ['Leases', 'https://kubernetes.io/docs/concepts/architecture/leases/'] },

        { t: 'recall',
          q: 'Why is API-server high availability a different problem from etcd high availability?',
          pts: [
            'API servers are stateless and replaceable — load balance across them',
            'etcd members hold replicated state and need quorum',
            'Losing etcd quorum halts writes cluster-wide, however many API servers survive'
          ],
          model: 'API servers hold no durable state, so they are replaceable. Put several behind a load balancer and any one serves any request. etcd members hold the replicated state and need a majority to commit, so quorum maths governs their availability. Three healthy API servers and a cluster that cannot accept a write is a normal combination once etcd loses quorum.' }
      ]
    },
    {
      id: 'u11l2', title: 'A backup you have restored',
      items: [
        { t: 'teach',
          h: 'An untested backup is a hypothesis',
          p: 'Snapshot, verify the snapshot, then rehearse the restore into an isolated environment. <code>snapshot status</code> reporting a valid file proves only that the file parses. It says nothing about whether your cluster comes back.',
          clip: ['UGXUgiWTanw', 247, 'Snapshot, verify, then restore'] },

        { t: 'multi',
          q: 'What does an etcd snapshot <em>not</em> contain?',
          o: [
            'Cluster PKI and certificates',
            'Static Pod manifests and component configuration',
            'Container images and CSI-backed volume data',
            'The API objects that were stored at snapshot time'
          ],
          a: [0, 1, 2],
          why: 'It captures API state and nothing else. Recovery needs the whole control-plane context — certificates, manifests, load balancers, and the actual data your volumes hold.',
          src: ['etcd disaster recovery', 'https://etcd.io/docs/v3.6/op-guide/recovery/'] },

        { t: 'mcq',
          q: 'You delete the etcd data directory on a single-member control plane. What do you observe first?',
          o: [
            'Workloads stop instantly on every node',
            'The API server can no longer serve cluster state, so kubectl requests start failing',
            'Nodes reboot',
            'The scheduler rebuilds state from the kubelets'
          ],
          a: 1,
          why: 'Cluster state lived only in etcd. Running containers keep going for a while, which is exactly the deceptive pattern from unit 1 — the data plane outlives the control plane.',
          clip: ['UGXUgiWTanw', 1170, 'Deleting the data directory: what actually breaks'] },

        { t: 'mcq',
          q: 'Which is the supported way to capture etcd state?',
          o: [
            'Copying the data directory with cp while etcd runs',
            'Taking an etcdctl snapshot and verifying it',
            'Backing up the API server\'s memory',
            'Exporting every object with kubectl get -o yaml'
          ],
          a: 1,
          why: 'A live filesystem copy is not a consistent snapshot. A kubectl export is a useful supplement but misses ordering, ownership and objects you forgot to enumerate.' },

        { t: 'recall',
          q: 'How do you prove disaster recovery works?',
          pts: [
            'Restore a verified snapshot into an isolated or rehearsed environment',
            'Restore to a new data directory, not over the live one',
            'Rebuild API access and validate critical objects and controllers',
            'Test workload and application-level data recovery',
            'Measure against documented RPO and RTO'
          ],
          model: 'Restore a verified snapshot into an isolated environment. Restore into a fresh data directory, never over the live one. Rebuild API access with the preserved PKI. Confirm that critical objects exist and that controllers resume. Then test application-level recovery, because API state returning is not the same as your data returning. Finally measure the whole run against documented RPO and RTO. Anything less is an assertion, not proof.',
          clip: ['UGXUgiWTanw', 1552, 'Common restore mistakes'] }
      ]
    }
  ]
},

{
  id: 'u12', n: 12, ref: 'm12',
  title: 'Scale, APF & evidence',
  tag: 'Under load',
  blurb: 'Protect the API, then know which signal proves which layer is at fault.',
  lessons: [
    {
      id: 'u12l1', title: 'Priority and fairness',
      items: [
        { t: 'teach',
          h: 'Concurrency is finite, so it has to be allocated',
          p: 'FlowSchemas classify requests by user, verb and resource into PriorityLevelConfigurations. Limited levels use queues and concurrency seats so one noisy client cannot consume the whole API server. Shuffle sharding bounds how many queues any one flow shares with others.',
          flow: ['Classify request', 'Priority level', 'Queue / reject', 'Allocate seats', 'Execute + observe'],
          clip: ['YnPPHBawhE0', 203, 'What APF is and why it was added'] },

        { t: 'mcq',
          q: 'What does a FlowSchema do?',
          o: [
            'Sets a rate limit in requests per second',
            'Matches requests by attributes and assigns them to a priority level',
            'Defines how many API-server replicas run',
            'Configures etcd compaction'
          ],
          a: 1,
          why: 'Classification and execution policy are deliberately separate objects: the FlowSchema decides which bucket, the PriorityLevelConfiguration decides how that bucket is served.',
          src: ['API Priority and Fairness', 'https://kubernetes.io/docs/concepts/cluster-administration/flow-control/'],
          clip: ['YnPPHBawhE0', 586, 'The service-account FlowSchema'] },

        { t: 'mcq',
          q: 'What does shuffle sharding actually buy you?',
          o: [
            'It guarantees every client equal throughput',
            'It bounds how many queues a noisy flow shares with others, limiting blast radius',
            'It removes the need for priority levels',
            'It makes requests execute out of order'
          ],
          a: 1,
          why: 'It is a blast-radius control, not a fairness guarantee. It cannot repair a pathological client — it only limits how many other flows that client can hurt.',
          clip: ['Tps4eAjuCr8', 1261, 'Priority-level classifier and shuffle sharding'] },

        { t: 'multi',
          q: 'A controller is flooding the API server. Select what APF can genuinely do.',
          o: [
            'Classify its requests into a bounded priority level',
            'Queue or reject them to preserve concurrency for critical flows',
            'Stop the controller\'s hot loop',
            'Reduce the cost of the huge list requests it is issuing'
          ],
          a: [0, 1],
          why: 'APF contains the damage; it does not fix the client. A complete answer says both halves — protect the API server, then go fix the loop and the list behaviour.',
          clip: ['YnPPHBawhE0', 721, 'Adding your own FlowSchema and priority level'] },

        { t: 'recall',
          q: 'Why do informers exist, in API-load terms?',
          pts: [
            'They share list/watch caches across controllers',
            'Repeated listing, reconnecting or requesting huge objects amplifies API server and etcd load',
            'A shared cache turns many pollers into one watch'
          ],
          model: 'Informers share list and watch caches, so many controllers ride one watch stream instead of polling separately. The economics matter. A client that relists repeatedly, reconnects in a loop, or asks for very large objects multiplies load on both the API server and etcd. That is how one small badly written controller degrades a whole cluster.' }
      ]
    },
    {
      id: 'u12l2', title: 'Which signal proves what',
      items: [
        { t: 'teach',
          h: 'No single source is ground truth',
          p: 'Events are lossy hints. Logs are component-local unless shipped. Metrics aggregate away the individual case. Audit records API activity. Traces connect one request path. Canonical object state is authoritative for what the API currently believes — everything else explains how it got there.',
          clip: ['Tps4eAjuCr8', 1261, 'Where flow control sits in the request path'] },

        { t: 'mcq',
          q: 'Which is authoritative for what the cluster currently intends?',
          o: ['Events', 'Component logs', 'Canonical object state in the API', 'Prometheus metrics'],
          a: 2,
          why: 'Object state is the contract. Events expire and are lossy, logs are local, and metrics have already aggregated away the specific object you care about.',
          src: ['Observability', 'https://kubernetes.io/docs/concepts/cluster-administration/observability/'] },

        { t: 'mcq',
          q: 'You need to know who deleted a specific object and when. What do you reach for?',
          o: ['Events', 'The audit log', 'Controller logs', 'Node metrics'],
          a: 1,
          why: 'Audit is the record of API requests and their stages, including identity. Events would not have retained it and may never have recorded it at all.',
          src: ['Auditing', 'https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/'] },

        { t: 'multi',
          q: 'Which signals help isolate a slow control plane to a specific layer?',
          o: [
            'API request latency and rejection counts',
            'APF seat and queue metrics',
            'etcd fsync and commit latency',
            'Controller workqueue depth and scheduler attempt counts',
            'The cluster\'s total Pod count'
          ],
          a: [0, 1, 2, 3],
          why: 'Each one belongs to a different boundary, which is what makes them diagnostic. A raw Pod count tells you the cluster is big, not where the time is going.',
          src: ['Metrics reference', 'https://kubernetes.io/docs/reference/instrumentation/metrics/'] },

        { t: 'order',
          q: 'Assemble the diagnostic spine — the path any symptom can be walked along.',
          o: ['Desired object', 'Admission / storage', 'Watch / cache', 'Controller queue', 'Scheduler queue / binding', 'Kubelet, CRI, CNI, CSI', 'EndpointSlice', 'Service / DNS / data plane', 'Application'],
          why: 'Memorise this and you always have a next question. Every module in this course is one segment of it, and every failure you have studied lands on exactly one.' },

        { t: 'recall',
          q: 'Final drill: give the 90-second architecture answer.',
          pts: [
            'Clients declare intent through a policy-enforcing API, persisted in etcd',
            'Controllers reconcile objects; the scheduler binds Pods',
            'Kubelets coordinate runtime, networking and storage',
            'Services and DNS expose ready endpoints',
            'Every stage is asynchronous, observable and retryable',
            'Protected by ownership, quorum, flow control and recovery'
          ],
          model: 'Clients declare intent through a policy-enforcing API that persists canonical objects in etcd. Controllers reconcile those objects toward the declared state; the scheduler binds Pods to nodes; kubelets coordinate the runtime, networking and storage that make a Pod real. Services and DNS expose the endpoints that are ready. Every stage is asynchronous, observable and retryable, and the whole system is protected by ownership rules, quorum, flow control and rehearsed recovery.' }
      ]
    }
  ]
}

);

// END OF UNITS
