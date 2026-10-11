# Allocate Devices to Workloads with DRA

FEATURE STATE:`Kubernetes v1.35 [stable]`(enabled by default)

This page shows you how to allocate devices to your Pods by using
_dynamic resource allocation (DRA)_. These instructions are for workload
operators. Before reading this page, familiarize yourself with how DRA works and
with DRA terminology like
[ResourceClaims](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/#resourceclaims-templates) and
[ResourceClaimTemplates](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/#resourceclaims-templates).
For more information, see
[Dynamic Resource Allocation (DRA)](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/).

## About device allocation with DRA [Heading self-link](https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/\#about-device-allocation-dra)

As a workload operator, you can _claim_ devices for your workloads by creating
ResourceClaims or ResourceClaimTemplates. When you deploy your workload,
Kubernetes and the device drivers find available devices, allocate them to your
Pods, and place the Pods on nodes that can access those devices.

## Before you begin [Heading self-link](https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/\#before-you-begin)

You need to have a Kubernetes cluster, and the kubectl command-line tool must
be configured to communicate with your cluster. It is recommended to run this tutorial on a cluster with at least two nodes that are not acting as control plane hosts. If you do not already have a
cluster, you can create one by using
[minikube](https://minikube.sigs.k8s.io/docs/tutorials/multi_node/)
or you can use one of these Kubernetes playgrounds:

- [iximiuz Labs](https://labs.iximiuz.com/playgrounds?category=kubernetes&filter=all)
- [Killercoda](https://killercoda.com/playgrounds/scenario/kubernetes)
- [KodeKloud](https://kodekloud.com/public-playgrounds)

Your Kubernetes server must be at or later than version v1.34.

To check the version, enter `kubectl version`.

- Ensure that your cluster admin has set up DRA, attached devices, and installed
drivers. For more information, see
[Set Up DRA in a Cluster](https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/set-up-dra-cluster/).

## Identify devices to claim [Heading self-link](https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/\#identify-devices)

Your cluster administrator or the device drivers create
_[DeviceClasses](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/#deviceclass)_ that
define categories of devices. You can claim devices by using
[Common Expression Language](https://cel.dev/) to filter for specific device properties.

Get a list of DeviceClasses in the cluster:

```shell
kubectl get deviceclasses
```

The output is similar to the following:

```
NAME                 AGE
driver.example.com   16m
```

If you get a permission error, you might not have access to get DeviceClasses.
Check with your cluster administrator or with the driver provider for available
device properties.

## Claim resources [Heading self-link](https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/\#claim-resources)

You can request resources from a DeviceClass by using
[ResourceClaims](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/#resourceclaims-templates). To
create a ResourceClaim, do one of the following:

- Manually create a ResourceClaim if you want multiple Pods to share access to
the same devices, or if you want a claim to exist beyond the lifetime of a
Pod.
- Use a
[ResourceClaimTemplate](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/#resourceclaims-templates)
to let Kubernetes generate and manage per-Pod ResourceClaims. Create a
ResourceClaimTemplate if you want every Pod to have access to separate devices
that have similar configurations. For example, you might want simultaneous
access to devices for Pods in a Job that uses
[parallel execution](https://kubernetes.io/docs/concepts/workloads/controllers/job/#parallel-jobs).

If you directly reference a specific ResourceClaim in a Pod, that ResourceClaim
must already exist in the cluster. If a referenced ResourceClaim doesn't exist,
the Pod remains in a pending state until the ResourceClaim is created. You can
reference an auto-generated ResourceClaim in a Pod, but this isn't recommended
because auto-generated ResourceClaims are bound to the lifetime of the Pod that
triggered the generation.

To create a workload that claims resources, select one of the following options:

- ResourceClaimTemplate
- ResourceClaim

Review the following example manifest:

[`dra/resourceclaimtemplate.yaml`](https://raw.githubusercontent.com/kubernetes/website/main/content/en/examples/dra/resourceclaimtemplate.yaml)![](https://kubernetes.io/images/copycode.svg)

```yaml
apiVersion: resource.k8s.io/v1
kind: ResourceClaimTemplate
metadata:
  name: example-resource-claim-template
spec:
  spec:
    devices:
      requests:
      - name: gpu-claim
        exactly:
          deviceClassName: example-device-class
          selectors:
            - cel:
                expression: |-
                  device.attributes["driver.example.com"].type == "gpu" &&
                  device.capacity["driver.example.com"].memory == quantity("64Gi")
```

This manifest creates a ResourceClaimTemplate that requests devices in the
`example-device-class` DeviceClass that match both of the following parameters:

- Devices that have a `driver.example.com/type` attribute with a value of
`gpu`.
- Devices that have `64Gi` of capacity.

To create the ResourceClaimTemplate, run the following command:

```shell
kubectl apply -f https://k8s.io/examples/dra/resourceclaimtemplate.yaml
```

Review the following example manifest:

[`dra/resourceclaim.yaml`](https://raw.githubusercontent.com/kubernetes/website/main/content/en/examples/dra/resourceclaim.yaml)![](https://kubernetes.io/images/copycode.svg)

```yaml
apiVersion: resource.k8s.io/v1
kind: ResourceClaim
metadata:
  name: example-resource-claim
spec:
  devices:
    requests:
    - name: single-gpu-claim
      exactly:
        deviceClassName: example-device-class
        allocationMode: All
        selectors:
        - cel:
            expression: |-
              device.attributes["driver.example.com"].type == "gpu" &&
              device.capacity["driver.example.com"].memory == quantity("64Gi")
```

This manifest creates ResourceClaim that requests devices in the
`example-device-class` DeviceClass that match both of the following parameters:

- Devices that have a `driver.example.com/type` attribute with a value of
`gpu`.
- Devices that have `64Gi` of capacity.

To create the ResourceClaim, run the following command:

```shell
kubectl apply -f https://k8s.io/examples/dra/resourceclaim.yaml
```

## Request devices in workloads using DRA [Heading self-link](https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/\#request-devices-workloads)

To request device allocation, specify a ResourceClaim or a ResourceClaimTemplate
in the `resourceClaims` field of the Pod specification. Then, request a specific
claim by name in the `resources.claims` field of a container in that Pod.
You can specify multiple entries in the `resourceClaims` field and use specific
claims in different containers.

1. Review the following example Job:



[`dra/dra-example-job.yaml`](https://raw.githubusercontent.com/kubernetes/website/main/content/en/examples/dra/dra-example-job.yaml)![](https://kubernetes.io/images/copycode.svg)







```yaml
apiVersion: batch/v1
kind: Job
metadata:
     name: example-dra-job
spec:
     completions: 10
     parallelism: 2
     template:
       spec:
         restartPolicy: Never
         containers:
      - name: container0
        image: ubuntu:24.04
        command: ["sleep", "9999"]
        resources:
          claims:
          - name: separate-gpu-claim
      - name: container1
        image: ubuntu:24.04
        command: ["sleep", "9999"]
        resources:
          claims:
          - name: shared-gpu-claim
      - name: container2
        image: ubuntu:24.04
        command: ["sleep", "9999"]
        resources:
          claims:
          - name: shared-gpu-claim
      resourceClaims:
      - name: separate-gpu-claim
        resourceClaimTemplateName: example-resource-claim-template
      - name: shared-gpu-claim
        resourceClaimName: example-resource-claim
```

Each Pod in this Job has the following properties:

   - Makes a ResourceClaimTemplate named `separate-gpu-claim` and a
     ResourceClaim named `shared-gpu-claim` available to containers.
   - Runs the following containers:
     - `container0` requests the devices from the `separate-gpu-claim`
       ResourceClaimTemplate.
     - `container1` and `container2` share access to the devices from the
       `shared-gpu-claim` ResourceClaim.
2. Create the Job:



```shell
kubectl apply -f https://k8s.io/examples/dra/dra-example-job.yaml
```


Try the following troubleshooting steps:

1. When the workload does not start as expected, drill down from Job
to Pods to ResourceClaims and check the objects
at each level with `kubectl describe` to see whether there are any
status fields or events which might explain why the workload is
not starting.
2. When creating a Pod fails with `must specify one of: resourceClaimName, resourceClaimTemplateName`, check that all entries in `pod.spec.resourceClaims`
have exactly one of those fields set. If they do, then it is possible
that the cluster has a mutating Pod webhook installed which was built
against APIs from Kubernetes < 1.32. Work with your cluster administrator
to check this.

## Clean up [Heading self-link](https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/\#clean-up)

To delete the Kubernetes objects that you created in this task, follow these
steps:

1. Delete the example Job:



```shell
kubectl delete -f https://k8s.io/examples/dra/dra-example-job.yaml
```

2. To delete your resource claims, run one of the following commands:

   - Delete the ResourceClaimTemplate:



     ```shell
     kubectl delete -f https://k8s.io/examples/dra/resourceclaimtemplate.yaml
     ```

   - Delete the ResourceClaim:



     ```shell
     kubectl delete -f https://k8s.io/examples/dra/resourceclaim.yaml
     ```

## What's next [Heading self-link](https://kubernetes.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/\#what-s-next)

- [Learn more about DRA](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/)

## Feedback

Was this page helpful?

YesNo

Thanks for the feedback. If you have a specific, answerable question about how to use Kubernetes, ask it on
[Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes).
Open an issue in the [GitHub Repository](https://www.github.com/kubernetes/website/) if you want to
[report a problem](https://github.com/kubernetes/website/issues/new?title=Issue%20with%20k8s.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/)
or
[suggest an improvement](https://github.com/kubernetes/website/issues/new?title=Improvement%20for%20k8s.io/docs/tasks/configure-pod-container/assign-resources/allocate-devices-dra/).

Last modified July 02, 2025 at 6:43 PM PST: [DRA: core update for 1.34 (36162b1107)](https://github.com/kubernetes/website/commit/36162b11071610d1e32d8cf758cd6c17da6e6d7e)