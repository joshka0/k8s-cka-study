[Edit this page](https://github.com/kubernetes-sigs/cli-experimental/edit/master/site/content/en/references/kustomize/kustomization/replicas/_index.md) [Create documentation issue](https://github.com/kubernetes-sigs/cli-experimental/issues/new?title=replicas) [Create project issue](https://github.com/kubernetes-sigs/cli-experimental/issues/new)

# replicas

Change the number of replicas for a resource.

Given this kubernetes Deployment fragment:

```yaml
kind: Deployment
metadata:
  name: deployment-name
spec:
  replicas: 3
```

one can change the number of replicas to 5
by adding the following to your kustomization:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

replicas:
- name: deployment-name
  count: 5
```

This field accepts a list, so many resources can
be modified at the same time.

As this declaration does not take in a `kind:` nor a `group:`
it will match any `group` and `kind` that has a matching name and
that is one of:

- `Deployment`
- `ReplicationController`
- `ReplicaSet`
- `StatefulSet`

For more complex use cases, revert to using a patch.

## Example

### Input File

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: the-deployment
spec:
  replicas: 5
  template:
    containers:
      - name: the-container
        image: registry/container:latest
```

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

replicas:
- name: the-deployment
  count: 10

resources:
- deployment.yaml
```

### Output

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: the-deployment
spec:
  replicas: 10
  template:
    containers:
      - name: the-container
        image: registry/container:latest
```

* * *

## Feedback

Was this page helpful?

YesNo

Glad to hear it! Please [tell us how we can improve](https://github.com/kubernetes-sigs/cli-experimental/issues/new).

Sorry to hear that. Please [tell us how we can improve](https://github.com/kubernetes-sigs/cli-experimental/issues/new).

Last modified November 1, 2022: [Fix repeated typo in documentation examples (8421bbf)](https://github.com/kubernetes-sigs/cli-experimental/commit/8421bbf80a7eb172cf54e7d85961d954f68ae2f9)