# Expressive-cue sample: Rule versus reach

A/B test against the same exchange in the plain pilot. S2.1 free-form
`[bracket]` cues plus spoken hesitation words. Restrained on purpose: one cue
per line at most, hesitations only where the character is actually thinking.

## Cast

- **Teacher** — course narrator (`c023b17b38144a60b3984153247d993f`).
- **Maya** — Kaya (`531f90254e3d4810a047a90b9309fdd0`).
- **Leon** — Wheatley (`ac6474da3a324e0c8edf6d796fe59f4d`).

---

## Script

### Rule versus reach, expressive

**Teacher:** [warm, unhurried] A ClusterRole contains the rule: get Pods. Does it grant that permission to anyone yet, Maya?

**Listener pause: 2 seconds**

**Maya:** [confident] No. It has rules, but no subject until a binding connects it.

**Teacher:** Good. [curious] Leon, I connect that ClusterRole to Maya using a RoleBinding in the payments namespace. Where may she get Pods?

**Listener pause: 4 seconds**

**Leon:** [thinking aloud] Hmm... cluster-wide? Because, um, it is a ClusterRole.

**Teacher:** [gentle] That is the useful mistake. Which object supplied the rule?

**Leon:** The ClusterRole.

**Teacher:** Which object supplied the reach?

**Leon:** The RoleBinding... [realizing] ah — so only in payments.

**Teacher:** [pleased] Right. The word Cluster in ClusterRole tells you the role is not owned by one namespace. [emphasis] It does not override the reach of a RoleBinding.

Maya, keep the same ClusterRole but replace the RoleBinding with a ClusterRoleBinding. What changed?

**Listener pause: 3 seconds**

**Maya:** The reach. [slight smile] Same rule, get Pods, now cluster-wide.

**Teacher:** [chuckle] So give me the compact rule.

**Maya:** [measured, like a conclusion] The role supplies the rules; the binding supplies the subjects and reach.
