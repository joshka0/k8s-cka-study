# Safely Drain a Node

This page shows how to safely drain a [node](https://kubernetes.io/docs/concepts/architecture/nodes/),
optionally respecting the PodDisruptionBudget you have defined.

## Before you begin [Heading self-link](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/\#before-you-begin)

This task assumes that you have met the following prerequisites:

1. You do not require your applications to be highly available during the
node drain, or
2. You have read about the [PodDisruptionBudget](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) concept,
and have [configured PodDisruptionBudgets](https://kubernetes.io/docs/tasks/run-application/configure-pdb/) for
applications that need them.

## (Optional) Configure a disruption budget [Heading self-link](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/\#configure-poddisruptionbudget)

To ensure that your workloads remain available during maintenance, you can
configure a [PodDisruptionBudget](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/).

If availability is important for any applications that run or could run on the node(s)
that you are draining, [configure a PodDisruptionBudgets](https://kubernetes.io/docs/tasks/run-application/configure-pdb/)
first and then continue following this guide.

It is recommended to set `AlwaysAllow` [Unhealthy Pod Eviction Policy](https://kubernetes.io/docs/tasks/run-application/configure-pdb/#unhealthy-pod-eviction-policy)
to your PodDisruptionBudgets to support eviction of misbehaving applications during a node drain.
The default behavior is to wait for the application pods to become [healthy](https://kubernetes.io/docs/tasks/run-application/configure-pdb/#healthiness-of-a-pod)
before the drain can proceed.

## Use `kubectl drain` to remove a node from service [Heading self-link](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/\#use-kubectl-drain-to-remove-a-node-from-service)

You can use `kubectl drain` to safely evict all of your pods from a
node before you perform maintenance on the node (e.g. kernel upgrade,
hardware maintenance, etc.). Safe evictions allow the pod's containers
to [gracefully terminate](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)
and will respect the PodDisruptionBudgets you have specified.

#### Note:

By default `kubectl drain` ignores certain system pods on the node
that cannot be killed; see
the [kubectl drain](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands/#drain)
documentation for more details.

When `kubectl drain` returns successfully, that indicates that all of
the pods (except the ones excluded as described in the previous paragraph)
have been safely evicted (respecting the desired graceful termination period,
and respecting the PodDisruptionBudget you have defined). It is then safe to
bring down the node by powering down its physical machine or, if running on a
cloud platform, deleting its virtual machine.

#### Note:

If any new Pods tolerate the `node.kubernetes.io/unschedulable` taint, then those Pods
might be scheduled to the node you have drained. Avoid tolerating that taint other than
for DaemonSets.

If you or another API user directly set the [`nodeName`](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename)
field for a Pod (bypassing the scheduler), then the Pod is bound to the specified node
and will run there, even though you have drained that node and marked it unschedulable.

First, identify the name of the node you wish to drain. You can list all of the nodes in your cluster with

```shell
kubectl get nodes
```

Next, tell Kubernetes to drain the node:

```shell
kubectl drain --ignore-daemonsets <node name>
```

If there are pods managed by a DaemonSet, you will need to specify
`--ignore-daemonsets` with `kubectl` to successfully drain the node. The `kubectl drain` subcommand on its own does not actually drain
a node of its DaemonSet pods:
the DaemonSet controller (part of the control plane) immediately replaces missing Pods with
new equivalent Pods. The DaemonSet controller also creates Pods that ignore unschedulable
taints, which allows the new Pods to launch onto a node that you are draining.

Once it returns (without giving an error), you can power down the node
(or equivalently, if on a cloud platform, delete the virtual machine backing the node).
If you leave the node in the cluster during the maintenance operation, you need to run

```shell
kubectl uncordon <node name>
```

afterwards to tell Kubernetes that it can resume scheduling new pods onto the node.

## Draining multiple nodes in parallel [Heading self-link](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/\#draining-multiple-nodes-in-parallel)

The `kubectl drain` command should only be issued to a single node at a
time. However, you can run multiple `kubectl drain` commands for
different nodes in parallel, in different terminals or in the
background. Multiple drain commands running concurrently will still
respect the PodDisruptionBudget you specify.

For example, if you have a StatefulSet with three replicas and have
set a PodDisruptionBudget for that set specifying `minAvailable: 2`,
`kubectl drain` only evicts a pod from the StatefulSet if all three
replicas pods are [healthy](https://kubernetes.io/docs/tasks/run-application/configure-pdb/#healthiness-of-a-pod);
if then you issue multiple drain commands in parallel,
Kubernetes respects the PodDisruptionBudget and ensures that
only 1 (calculated as `replicas - minAvailable`) Pod is unavailable
at any given time. Any drains that would cause the number of [healthy](https://kubernetes.io/docs/tasks/run-application/configure-pdb/#healthiness-of-a-pod)
replicas to fall below the specified budget are blocked.

## The Eviction API [Heading self-link](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/\#eviction-api)

If you prefer not to use [kubectl drain](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands/#drain) (such as
to avoid calling to an external command, or to get finer control over the pod
eviction process), you can also programmatically cause evictions using the
eviction API.

For more information, see [API-initiated eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/).

## What's next [Heading self-link](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/\#what-s-next)

- Follow steps to protect your application by [configuring a Pod Disruption Budget](https://kubernetes.io/docs/tasks/run-application/configure-pdb/).

## Feedback

Was this page helpful?

YesNo

Thanks for the feedback. If you have a specific, answerable question about how to use Kubernetes, ask it on
[Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes).
Open an issue in the [GitHub Repository](https://www.github.com/kubernetes/website/) if you want to
[report a problem](https://github.com/kubernetes/website/issues/new?title=Issue%20with%20k8s.io/docs/tasks/administer-cluster/safely-drain-node/)
or
[suggest an improvement](https://github.com/kubernetes/website/issues/new?title=Improvement%20for%20k8s.io/docs/tasks/administer-cluster/safely-drain-node/).

Last modified May 11, 2023 at 6:08 PM PST: [Remove min K8s version requirement from pre reqs (6282a22fac)](https://github.com/kubernetes/website/commit/6282a22facbe32873c91654bdf0d609687aa1227)