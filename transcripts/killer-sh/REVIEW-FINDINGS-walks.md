# Walkthrough fidelity findings

Re-gate of the six findings applied to `assets/exam-walkthroughs.js`. Scope: the five affected walkthroughs only.

Checked each original finding and the surrounding options, teach text, and later tables for new damage.

No remaining findings.

# Re-gate notes (not findings)

[exam-docs-u15-u27-q04 step 2] resolved
  After the ClusterRoleBinding, both `can-i impersonate users/alice` and `users/bob` are yes. The teach now says both names are in the same rule. Later refusal checks stay on carol, groups, and serviceaccounts.

[exam-draft-00-12-q05 step 2] resolved
  The Available PV row leaves STORAGECLASS blank and puts `<unset>` only in VOLUMEATTRIBUTESCLASS. The teach matches that split. Later `get pv` / `get pvc` tables in this walkthrough use a blank STORAGECLASS cell for the empty class.

[exam-draft-00-12-q05 step 3] resolved
  The follow-up is a JSON patch to `storageClassName: ""`. The API returns Forbidden on the immutable spec. The teach still names the delete-and-recreate fix, and it now contrasts the strategic-merge no-op instead of using that no-op as proof.

[exam-draft-13-25-q06 step 3] resolved
  Every leaf row in `kubeadm certs check-expiration` now shows residual `0d` against expiry `Aug 16, 2026 08:45 UTC`, which matches walkthrough "now". openssl and kubeadm still name the same instant. No leftover `364d`.

[exam-draft-13-25-q07 step 3] resolved
  Serving issuer and subject use `1783847642` (2026-07-12 09:14:02 UTC). That matches `kubelet-client-2026-07-12-09-14-02.pem` and the Jul 12 09:14 `ls` dates. No leftover `1752311642`.

[exam-draft-13-25-q08 step 1] resolved
  The `--show-labels` table includes `api-1` with `app=api,tier=edge`, matching the opening `get pods` list and the wide table.

# Verdict

ship

# Question ids with findings

(none)

# Question ids re-checked with no findings

- exam-docs-u15-u27-q04
- exam-draft-00-12-q05
- exam-draft-13-25-q06
- exam-draft-13-25-q07
- exam-draft-13-25-q08
