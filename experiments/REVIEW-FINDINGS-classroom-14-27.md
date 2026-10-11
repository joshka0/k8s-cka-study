# Classroom script review findings: u14–u20 and u22–u27

## Accuracy

[u15] Accepted is not served · misleading
  problem: The teacher says the same HTTPRoute can be "accepted and unattached." The `Accepted` condition is reported for a parent relationship. It can be true while the listener or a downstream boundary still fails, but calling that state unattached collapses attachment, acceptance, programming, and serving again.
  fix:     Replace the final exchange in this section with:

            **Teacher:** The same route can be Accepted by its parent while a
            listener or downstream boundary still fails to serve it. Which place
            reports acceptance and resolution separately?

            **Listener pause: 3 seconds**

            **Maya:** The route's parent status and conditions.

[u15] Six programmable boundaries · misleading
  problem: The teacher asks for three remaining boundaries. Leon names Service translation, EndpointSlice readiness, the Pod listener, and policy. The script then calls the full list six boundaries and six owners, while the spoken list contains seven items if policy is counted. The reconstruction repeats the mismatch.
  fix:     Remove the unstable count and keep the ownership distinction:

            **Teacher:** Leon, continue inward. Name the remaining boundaries,
            plus any policy between them.

            **Listener pause: 5 seconds**

            **Leon:** Service translation, EndpointSlice readiness, the Pod's own
            listener, and any policy in between.

            **Teacher:** Can each boundary fail independently?

            **Listener pause: 2 seconds**

            **Maya:** Yes. Each has different configuration and evidence.

            An external request crosses the listener, controller data plane,
            route match, Service translation, EndpointSlice readiness, Pod
            listener, and any policy between them. Each boundary can fail on its
            own.

[u15] Accepted, and doing nothing · misleading
  problem: Maya says there is "often" no enforcement status. Core `NetworkPolicy` has no enforcement status. The qualified answer weakens a deliberate source correction and can make the listener search for a core status field that does not exist.
  fix:     Replace the exchange with:

            **Teacher:** Does core NetworkPolicy expose enforcement status?

            **Listener pause: 3 seconds**

            **Maya:** No. The API object can look identical whether the network
            implementation enforces it or ignores it.

[u18] Listener reconstruction · wrong
  problem: The compressed answer says the extension server has its own storage. Aggregation permits an extension server to implement custom storage, unusual subresources, or computed responses. Custom storage is an option, not an inherent property of every aggregated API.
  fix:     Replace the first two sentences with:

            An APIService claims a group-and-version path. The main API server
            authenticates, then proxies to an extension server, which can supply
            custom storage, unusual subresources, or computed responses. A CRD
            uses generic storage and behavior on the main API server.

[u19] Four gates, four transitions and listener reconstruction · wrong
  problem: The dialogue says readiness gates keep a Pod "out of Service endpoints," and the reconstruction sharpens that to "block endpoint membership." A selector-matched address can remain in an EndpointSlice with `ready` false. The gate blocks Pod Ready; Service data planes normally avoid the unready endpoint.
  fix:     Replace the readiness answer and its reconstruction sentence with:

            **Maya:** Ready. A selector-matched endpoint can remain in its
            EndpointSlice with ready false, so Service data planes normally do
            not use it.

            Readiness gates block Pod Ready. The endpoint can remain a member of
            its EndpointSlice with ready false, so Service data planes normally
            avoid it.

[u22] Listener reconstruction · wrong
  problem: The compressed answer says node journals and `crictl` are only for a down API path. The reviewed narration names either a failed kubelet path or an unavailable API path. Dropping the kubelet condition contradicts the dialogue and excludes a valid node-runtime investigation.
  fix:     Replace the affected sentences with:

            Use node journals and crictl when the kubelet or API path is
            unavailable. crictl is runtime evidence below a broken kubelet or
            API path, not a substitute while the normal API evidence is healthy.

[u27] Passing Restricted is not a claim · wrong
  problem: Leon says the runtime, the `RuntimeClass`, and the kernel enforce the mechanisms. The script later correctly says `RuntimeClass` is a selector and contract, not an implementation. The selected runtime implementation and kernel enforce; the RuntimeClass object does not.
  fix:     Replace Leon's answer with:

            **Leon:** The runtime implementation selected through RuntimeClass,
            and the kernel.

## Craft

[u14] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 14 and unit `u14`, refers to the expository module and deck, and couples the comparison test to Module 14. The contract requires a standalone module with no pilot, series, or module-number references.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: config delivery and quality of service

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed config-delivery and quality-of-service narration is the
            factual authority. This is an audio script, not a video script.

            The dialogue stays at the level of concepts. Exact syntax stays out
            of spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u14] Opening · craft
  problem: The first teacher turn states three facts before asking a question: the Secret changed, nothing failed, and the application still uses the old credential.
  fix:     Compress the facts into one incident statement:

            **Teacher:** [warm] The Secret changed, but the application still
            presents the old credential. Maya, where do people look first?

[u14] Diagnosis · craft
  problem: `[deliberate]` cues a fluent, correct diagnostic list. The student is not hesitating or correcting reasoning, so the cue is production wallpaper.
  fix:     Remove the cue:

            **Leon:** How the value was delivered — environment or file. Whether
            the object is immutable. Whether the mount is subPath. Whether the
            app caches. Whether the Pod template ever changed.

[u15] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 15 and unit `u15`, refers to the expository module and deck, and couples the comparison test to Module 15.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: routes, ownership, and inert policy

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed route and policy narration is the factual authority.
            This is an audio script, not a video script. Exact syntax stays out
            of spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u15] Opening · craft
  problem: The first teacher turn states four facts before retrieval: the route is stored, nothing serves it, Gateway API can show Accepted without a listener, and Ingress can be inert too.
  fix:     Start with the incident and elicit the claim:

            **Teacher:** [warm] A stored route serves nothing. Maya, what does the
            object's existence prove?

[u15] Who owns which object and Accepted, and doing nothing · craft
  problem: Two fluent, correct answers carry `[deliberate]`. Neither line contains hesitation or active reconstruction.
  fix:     Remove both cues:

            **Leon:** Ownership split. Platform owns the infrastructure side.
            Applications own their routes.

            **Leon:** The network implementation may not support NetworkPolicy
            at all. The selector may match no Pods. Ingress and egress isolation
            are separate, so covering one leaves the other open.

[u16] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 16 and unit `u16`, refers to the expository module and deck, and couples the comparison test to Module 16.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: topology, admission, and CPU isolation

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed topology and CPU-isolation narration is the factual
            authority. This is an audio script, not a video script. Exact syntax
            stays out of spoken dialogue; speakable Kubernetes terms remain
            vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u16] Latency without high usage · craft
  problem: `[deliberate]` cues a fluent, correct three-part answer. It adds no genuine hesitation or correction.
  fix:     Remove the cue:

            **Leon:** Throttling — time you were not allowed to run. Scheduling
            delay — time you waited for a core. Poor locality — memory access
            that crosses a NUMA boundary.

[u17] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 17 and unit `u17`, refers to the expository module and deck, and couples the comparison test to Module 17.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: device claims and allocation

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed device-allocation narration is the factual authority.
            This is an audio script, not a video script. Exact syntax stays out
            of spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u17] Opening · craft
  problem: The first teacher turn states three facts before retrieval: GPU requests have two shapes, one is a scalar count, and one is an allocated object.
  fix:     Let the distinction enter through attempts:

            **Teacher:** [warm] A device-backed Pod will not run. Maya, did it
            request a scalar count or a structured claim?

            **Listener pause: 3 seconds**

            **Maya:** A count — the node advertises eight and the Pod asks for
            two.

            **Teacher:** What other request shape can DRA use?

            **Listener pause: 3 seconds**

            **Leon:** A ResourceClaim allocated from structured inventory.

[u17] Plugin versus DRA · craft
  problem: `[deliberate]` cues a fluent, correct discriminator rather than genuine hesitation.
  fix:     Remove the cue:

            **Leon:** A device plugin advertises scalar extended resources
            through the kubelet. DRA publishes structured devices through API
            objects, which enables filtering, sharing, and lifecycle.

[u18] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 18 and unit `u18`, refers to the expository module and deck, and couples the comparison test to Module 18.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: aggregation, watches, and in-process policy

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed API-machinery narration is the factual authority. This
            is an audio script, not a video script. Exact syntax stays out of
            spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u18] Opening and section transitions · craft
  problem: The file calls aggregation, watch recovery, in-process admission, and access-review APIs one investigation, but no concrete request or incident connects them. The sections are topic Q&A in source order.
  fix:     Give one client a continuous path and carry it through the transitions:

            **Teacher:** [warm] An inventory client calls a custom API, and the
            path stops answering. Maya, must that API be a CRD?

            **Listener pause: 3 seconds**

            **Maya:** Yes. Custom types use CRDs on the main API server.

            **Teacher:** We will identify what serves this client, recover its
            watch, and then follow its next write through admission. Leon, where
            are we on the request path?

            **Listener pause: 3 seconds**

            **Leon:** At the API machinery in front of storage and controllers.

            **Teacher:** The extension recovers, but the inventory client's watch
            position is old. Does a BOOKMARK carry an object change?

            **Teacher:** The same client now submits a write. How can admission
            evaluate its policy without a network call?

            **Teacher:** Before granting this client access, which review asks
            the authorizer about the named subject?

[u18] Safer, not free · craft
  problem: Maya's wrong answer, "the default upgrade," does not state what she believes can be skipped or why. The listener cannot reconstruct the misconception.
  fix:     Replace it with a clear overgeneralization of the source warning:

            **Maya:** Yes. With no network dependency, it should be safe to apply
            broadly without careful scoping or cost limits.

[u19] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 19 and unit `u19`, refers to the expository module and deck, and couples the comparison test to Module 19.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: leases and deliberate gates

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed coordination narration is the factual authority. This
            is an audio script, not a video script. Exact syntax stays out of
            spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u19] Opening · craft
  problem: The second teacher turn states the rule, the four-mechanism taxonomy, and the planned construction before asking Leon anything.
  fix:     Move the first mechanism behind retrieval:

            **Teacher:** We will name the transition before we touch it. Leon,
            which mechanism holds component leadership?

            **Listener pause: 3 seconds**

            **Leon:** A Lease.

[u20] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 20 and unit `u20`, refers to the expository module and deck, and couples the comparison test to Module 20.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: start at the nearest authority

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed troubleshooting narration is the factual authority.
            This is an audio script, not a video script. Exact syntax stays out
            of spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u20] Opening · craft
  problem: The second teacher turn states the method, the answering-authority rule, the descent rule, and its application to three resource areas before asking a question.
  fix:     Ask for the boundary before announcing the procedure:

            **Teacher:** We need a procedure that survives a silent API. Leon,
            why can the usual client not diagnose the API server it needs?

[u20] Above the line, below the line · craft
  problem: `[deliberate]` cues a fluent, correct list of host-level authorities.
  fix:     Remove the cue:

            **Leon:** The load balancer, if there is one. Static Pod manifests.
            The kubelet service. The runtime. Certificates. Sockets and host
            resources.

[u22] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 22 and unit `u22`, refers to the expository module and deck, and couples the comparison test to Module 22.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: metrics pipeline and perishable evidence

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed metrics and debug-evidence narration is the factual
            authority. This is an audio script, not a video script. Exact syntax
            stays out of spoken dialogue; speakable Kubernetes terms remain
            vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u22] Opening · craft
  problem: The second teacher turn states the common evidence theme, the metrics incident, the crash-loop incident, and the diagnostic rule before asking Leon anything.
  fix:     Enter through the first disputed path:

            **Teacher:** We will trace the failed resource-metrics path first.
            Leon, can healthy dashboards prove that path works?

            **Listener pause: 3 seconds**

            **Leon:** No. They can use a separate observability path.

[u22] No shell in the image · craft
  problem: `[deliberate]` cues a fluent, correct evidence list.
  fix:     Remove the cue:

            **Leon:** Describe it and read events. Read current and previous
            logs. Read the termination reason and exit code.

[u23] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 23 and unit `u23`, refers to the expository module and deck, and couples the comparison test to Module 23.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: render, reconcile, and field ownership

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed declarative-delivery narration is the factual authority.
            This is an audio script, not a video script. Exact syntax stays out
            of spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u23] Opening · craft
  problem: The second teacher turn states the delivery-versus-convergence split, introduces rollout arithmetic, and introduces field ownership before asking a cumulative question.
  fix:     Keep only the immediate causal split:

            **Teacher:** We will trace the release into the cluster. Leon, what
            two claims must we check separately?

[u24] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 24 and unit `u24`, refers to the expository module and deck, and couples the comparison test to Module 24.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: quota, LimitRange, and live resize

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed namespace-governance narration is the factual authority.
            This is an audio script, not a video script. Exact syntax stays out
            of spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u24] Opening · craft
  problem: The second teacher turn states the admission topic, the Forbidden-versus-Pending split, the live-resize split, and the diagnostic rule before retrieval.
  fix:     Ask the first boundary directly:

            **Teacher:** We will start at namespace admission. Leon, can an
            admission rejection leave this Pod Pending?

            **Listener pause: 3 seconds**

            **Leon:** No. If admission rejected creation, scheduling never began.

[u25] Title, introduction, Shortest diagnosis, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 25 and unit `u25`, refers to the expository module and deck, asks for "the module's" core distinction in spoken dialogue, and couples the comparison test to Module 25.
  fix:     Replace the coupled prose and spoken question with standalone wording:

            # Listen-in classroom: Service layers and endpoint eligibility

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed Service-exposure narration is the factual authority.
            This is an audio script, not a video script. Exact syntax stays out
            of spoken dialogue; speakable Kubernetes terms remain vocabulary.

            **Teacher:** What is the core distinction?

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u26] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 26 and unit `u26`, refers to the expository module and deck, and couples the comparison test to Module 26.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: who restarted what

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed restart-ownership narration is the factual authority.
            This is an audio script, not a video script. Exact syntax stays out
            of spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u26] Opening · craft
  problem: The second teacher turn states the three-owner taxonomy, the identity-field discriminator, and the sidecar outcome before asking Leon anything.
  fix:     Keep the turn on the incident's first decision:

            **Teacher:** We will identify the object that changed. Leon, what
            question answers most of the mystery?

[u27] Title, introduction, and Comparison test · craft
  problem: The file calls itself a pilot, names Module 27 and unit `u27`, refers to the expository module and deck, and couples the comparison test to Module 27.
  fix:     Replace the coupled prose with standalone wording:

            # Listen-in classroom: admission, runtime, and isolation boundaries

            The learner listens to a teacher work with two students and answers
            mentally before hearing their attempts.

            The reviewed Pod-security narration is the factual authority. This
            is an audio script, not a video script. Exact syntax stays out of
            spoken dialogue; speakable Kubernetes terms remain vocabulary.

            After one listen, use the listener reconstruction above. Score
            causal ordering and boundary discrimination, not verbatim recall or
            learner preference.

[u27] Opening · craft
  problem: The second teacher turn states the admission boundary, the runtime boundary, and three planned topic transitions before asking whether the pass is complete.
  fix:     Keep the turn on the first causal distinction:

            **Teacher:** We will separate admission from runtime isolation. Leon,
            is an admission pass a complete security claim?

[u27] What actually reduces privilege · craft
  problem: `[deliberate]` cues a fluent, correct list of privilege reducers.
  fix:     Remove the cue:

            **Leon:** Non-root user. Dropping capabilities rather than adding
            them. A seccomp profile. A read-only root filesystem. Disallowing
            privilege escalation.

ACCURACY: 7 findings
CRAFT: 32 findings
