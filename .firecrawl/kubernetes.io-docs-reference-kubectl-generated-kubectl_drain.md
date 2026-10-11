# kubectl drain

Drain node in preparation for maintenance

## Synopsis [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/\#synopsis)

Drain node in preparation for maintenance.

The given node will be marked unschedulable to prevent new pods from arriving. 'drain' evicts the pods if the API server supports [https://kubernetes.io/docs/concepts/workloads/pods/disruptions/](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) eviction [https://kubernetes.io/docs/concepts/workloads/pods/disruptions/](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) . Otherwise, it will use normal DELETE to delete the pods. The 'drain' evicts or deletes all pods except mirror pods (which cannot be deleted through the API server). If there are daemon set-managed pods, drain will not proceed without --ignore-daemonsets, and regardless it will not delete any daemon set-managed pods, because those pods would be immediately replaced by the daemon set controller, which ignores unschedulable markings. If there are any pods that are neither mirror pods nor managed by a replication controller, replica set, daemon set, stateful set, or job, then drain will not delete any pods unless you use --force. --force will also allow deletion to proceed if the managing resource of one or more pods is missing.

'drain' waits for graceful termination. You should not operate on the machine until the command completes.

When you are ready to put the node back into service, use kubectl uncordon, which will make the node schedulable again.

[https://kubernetes.io/images/docs/kubectl\_drain.svg](https://kubernetes.io/images/docs/kubectl_drain.svg) Workflowhttps://kubernetes.io/images/docs/kubectl\_drain.svg

```
kubectl drain NODE
```

## Examples [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/\#examples)

```
  # Drain node "foo", even if there are pods not managed by a replication controller, replica set, job, daemon set, or stateful set on it
  kubectl drain foo --force

  # As above, but abort if there are pods not managed by a replication controller, replica set, job, daemon set, or stateful set, and use a grace period of 15 minutes
  kubectl drain foo --grace-period=900
```

## Options [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/\#options)

|     |     |
| --- | --- |
| --chunk-size int     Default: 500 |
|  | Return large lists in chunks rather than all at once. Pass 0 to disable. |
| --delete-emptydir-data |
|  | Continue even if there are pods using emptyDir (local data that will be deleted when the node is drained). |
| --disable-eviction |
|  | Force drain to use delete, even if eviction is supported. This will bypass checking PodDisruptionBudgets, use with caution. |
| --dry-run string\[="unchanged"\]     Default: "none" |
|  | Must be "none", "server", or "client". If client strategy, only print the object that would be sent, without sending it. If server strategy, submit server-side request without persisting the resource. |
| --force |
|  | Continue even if there are pods that do not declare a controller. |
| --grace-period int     Default: -1 |
|  | Period of time in seconds given to each pod to terminate gracefully. If negative, the default value specified in the pod will be used. |
| -h, --help |
|  | help for drain |
| --ignore-daemonsets |
|  | Ignore DaemonSet-managed pods. |
| --pod-selector string |
|  | Label selector to filter pods on the node |
| -l, --selector string |
|  | Selector (label query) to filter on, supports '=', '==', '!=', 'in', 'notin'.(e.g. -l key1=value1,key2=value2,key3 in (value3)). Matching objects must satisfy all of the specified label constraints. |
| --skip-wait-for-delete-timeout int |
|  | If pod DeletionTimestamp older than N seconds, skip waiting for the pod. Seconds must be greater than 0 to skip. |
| --timeout duration |
|  | The length of time to wait before giving up, zero means infinite |

## Parent Options Inherited [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/\#parent-options-inherited)

|     |     |
| --- | --- |
| --as string |
|  | Username to impersonate for the operation. User could be a regular user or a service account in a namespace. |
| --as-group strings |
|  | Group to impersonate for the operation, this flag can be repeated to specify multiple groups. |
| --as-uid string |
|  | UID to impersonate for the operation. |
| --as-user-extra strings |
|  | User extras to impersonate for the operation, this flag can be repeated to specify multiple values for the same key. |
| --cache-dir string     Default: "$HOME/.kube/cache" |
|  | Default cache directory |
| --certificate-authority string |
|  | Path to a cert file for the certificate authority |
| --client-certificate string |
|  | Path to a client certificate file for TLS |
| --client-key string |
|  | Path to a client key file for TLS |
| --cluster string |
|  | The name of the kubeconfig cluster to use |
| --context string |
|  | The name of the kubeconfig context to use |
| --disable-compression |
|  | If true, opt-out of response compression for all requests to the server |
| --insecure-skip-tls-verify |
|  | If true, the server's certificate will not be checked for validity. This will make your HTTPS connections insecure |
| --kubeconfig string |
|  | Path to the kubeconfig file to use for CLI requests. |
| --kuberc string |
|  | Path to the kuberc file to use for preferences. This can be disabled by exporting KUBECTL\_KUBERC=false feature gate or turning off the feature KUBERC=off. |
| --match-server-version |
|  | Require server version to match client version |
| -n, --namespace string |
|  | If present, the namespace scope for this CLI request |
| --password string |
|  | Password for basic authentication to the API server |
| --profile string     Default: "none" |
|  | Name of profile to capture. One of (none\|cpu\|heap\|goroutine\|threadcreate\|block\|mutex\|trace) |
| --profile-output string     Default: "profile.pprof" |
|  | Name of the file to write the profile to |
| --request-timeout string     Default: "0" |
|  | The length of time to wait before giving up on a single server request. Non-zero values should contain a corresponding time unit (e.g. 1s, 2m, 3h). A value of zero means don't timeout requests. |
| -s, --server string |
|  | The address and port of the Kubernetes API server |
| --storage-driver-buffer-duration duration     Default: 1m0s |
|  | Writes in the storage driver will be buffered for this duration, and committed to the non memory backends as a single transaction |
| --storage-driver-db string     Default: "cadvisor" |
|  | database name |
| --storage-driver-host string     Default: "localhost:8086" |
|  | database host:port |
| --storage-driver-password string     Default: "root" |
|  | database password |
| --storage-driver-secure |
|  | use secure connection with database |
| --storage-driver-table string     Default: "stats" |
|  | table name |
| --storage-driver-user string     Default: "root" |
|  | database username |
| --tls-server-name string |
|  | Server name to use for server certificate validation. If it is not provided, the hostname used to contact the server is used |
| --token string |
|  | Bearer token for authentication to the API server |
| --user string |
|  | The name of the kubeconfig user to use |
| --username string |
|  | Username for basic authentication to the API server |
| --version version\[=true\] |
|  | --version, --version=raw prints version information and quits; --version=vX.Y.Z... sets the reported version |
| --warnings-as-errors |
|  | Treat warnings received from the server as errors and exit with a non-zero exit code |

## See Also [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/\#see-also)

- [kubectl](https://kubernetes.io/docs/reference/kubectl/generated/kubectl/) \- kubectl controls the Kubernetes cluster manager

## Feedback

Was this page helpful?

YesNo

Thanks for the feedback. If you have a specific, answerable question about how to use Kubernetes, ask it on
[Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes).
Open an issue in the [GitHub Repository](https://www.github.com/kubernetes/website/) if you want to
[report a problem](https://github.com/kubernetes/website/issues/new?title=Issue%20with%20k8s.io/docs/reference/kubectl/generated/kubectl_drain/)
or
[suggest an improvement](https://github.com/kubernetes/website/issues/new?title=Improvement%20for%20k8s.io/docs/reference/kubectl/generated/kubectl_drain/).

Last modified March 22, 2026 at 3:35 PM PST: [Switch to Hugo page discovery and add description field to kubectl command front matter (83100f9a0d)](https://github.com/kubernetes/website/commit/83100f9a0db1c9a1954de0d9552c4733e73029ae)

This page is automatically generated.

If you plan to report an issue with this page, mention that the page is auto-generated in your issue description. The fix may need to happen elsewhere in the Kubernetes project.