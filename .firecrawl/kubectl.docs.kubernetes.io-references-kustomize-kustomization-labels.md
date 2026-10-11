[Edit this page](https://github.com/kubernetes-sigs/cli-experimental/edit/master/site/content/en/references/kustomize/kustomization/labels/_index.md) [Create documentation issue](https://github.com/kubernetes-sigs/cli-experimental/issues/new?title=labels) [Create project issue](https://github.com/kubernetes-sigs/cli-experimental/issues/new)

# labels

Add labels and optionally selectors to all resources.

A field that allows adding labels without also automatically injecting corresponding selectors.
This can be used instead of the deprecated `commonLabels` field, which always adds selectors.

Selectors for resources such as Deployments and Services shouldn’t be changed once the
resource has been applied to a cluster.

Changing `includeSelectors` to `true` or changing labels when `includeSelectors` is `true` in live resources
is equivalent to changing the deprecated `commonLabels` and could result in failures.

The following flags are available:

- `includeSelectors`: When set will apply labels to metadata/labels, selectors, and spec/template/metadata/labels. False by default.
- `includeTemplates`: When set will also apply labels to metadata/labels and spec/template/metadata/labels. This can be used to add labels to Pods from owner resources, such as Deployments and StatefulSets, without modifying selectors. False by default.
- `includeVolumeClaimTemplates`: When set will also apply labels to metadata/labels and spec/volumeClaimTemplates/metadata/labels. This can be used to add labels to PersistentVolumeClaims from owner resources, such as StatefulSets. False by default.

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

labels:
  - pairs:
      someName: someValue
      owner: alice
      app: bingo
    includeSelectors: true            # <-- false by default
    includeTemplates: true            # <-- false by default
    includeVolumeClaimTemplates: true # <-- false by default
```

## Example 1 - selectors and templates NOT modified

### File Input

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

labels:
- pairs:
    someName: someValue
    owner: alice
    app: bingo

resources:
- deploy.yaml
- service.yaml
```

```yaml
# deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: example
```

### Build Output

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: bingo
    owner: alice
    someName: someValue
  name: example
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: bingo
    owner: alice
    someName: someValue
  name: example
```

## Example 2 - selectors modified

### File Input

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

labels:
- pairs:
    someName: someValue
    owner: alice
    app: bingo
  includeSelectors: true

resources:
- deploy.yaml
- service.yaml
```

```yaml
# deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: example
```

### Build Output

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: bingo
    owner: alice
    someName: someValue
  name: example
spec:
  selector:
    app: bingo
    owner: alice
    someName: someValue
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: bingo
    owner: alice
    someName: someValue
  name: example
spec:
  selector:
    matchLabels:
      app: bingo
      owner: alice
      someName: someValue
  template:
    metadata:
      labels:
        app: bingo
        owner: alice
        someName: someValue
```

## Example 3 - templates modified (selectors unmodified)

### File Input

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

labels:
- pairs:
    someName: someValue
    owner: alice
    app: bingo
  includeTemplates: true

resources:
- deploy.yaml
- service.yaml
```

```yaml
# deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: example
```

### Build Output

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: bingo
    owner: alice
    someName: someValue
  name: example
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: bingo
    owner: alice
    someName: someValue
  name: example
spec:
  template:
    metadata:
      labels:
        app: bingo
        owner: alice
        someName: someValue
```

## Example 4 - volumeClaimTemplates modified (selectors and templates unmodified)

### File Input

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

labels:
- pairs:
    someName: someValue
    owner: alice
    app: bingo
  includeVolumeClaimTemplates: true

resources:
- sts.yaml
- service.yaml
```

```yaml
# sts.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: example
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: example
```

### Build Output

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: bingo
    owner: alice
    someName: someValue
  name: example
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app: bingo
    owner: alice
    someName: someValue
  name: example
spec:
  volumeClaimTemplates:
  - metadata:
      labels:
        app: bingo
        owner: alice
        someName: someValue
```

* * *

## Feedback

Was this page helpful?

YesNo

Glad to hear it! Please [tell us how we can improve](https://github.com/kubernetes-sigs/cli-experimental/issues/new).

Sorry to hear that. Please [tell us how we can improve](https://github.com/kubernetes-sigs/cli-experimental/issues/new).

Last modified April 1, 2026: [Document kustomize labels includeVolumeClaimTemplates (#426) (81a94c9)](https://github.com/kubernetes-sigs/cli-experimental/commit/81a94c9586d2fe857b8fc1c124afe28a71947f19)