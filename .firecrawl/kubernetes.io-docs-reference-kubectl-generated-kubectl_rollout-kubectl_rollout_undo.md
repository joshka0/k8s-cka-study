# kubectl rollout undo

Undo a previous rollout

## Synopsis [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/\#synopsis)

Roll back to a previous rollout.

```
kubectl rollout undo (TYPE NAME | TYPE/NAME) [flags]
```

## Examples [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/\#examples)

```
  # Roll back to the previous deployment
  kubectl rollout undo deployment/abc

  # Roll back to daemonset revision 3
  kubectl rollout undo daemonset/abc --to-revision=3

  # Roll back to the previous deployment with dry-run
  kubectl rollout undo --dry-run=server deployment/abc
```

## Options [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/\#options)

|     |     |
| --- | --- |
| --allow-missing-template-keys     Default: true |
|  | If true, ignore any errors in templates when a field or map key is missing in the template. Only applies to golang and jsonpath output formats. |
| --dry-run string\[="unchanged"\]     Default: "none" |
|  | Must be "none", "server", or "client". If client strategy, only print the object that would be sent, without sending it. If server strategy, submit server-side request without persisting the resource. |
| -f, --filename strings |
|  | Filename, directory, or URL to files identifying the resource to get from a server. |
| -h, --help |
|  | help for undo |
| -k, --kustomize string |
|  | Process the kustomization directory. This flag can't be used together with -f or -R. |
| -o, --output string |
|  | Output format. One of: (json, yaml, kyaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file). |
| -R, --recursive |
|  | Process the directory used in -f, --filename recursively. Useful when you want to manage related manifests organized within the same directory. |
| -l, --selector string |
|  | Selector (label query) to filter on, supports '=', '==', '!=', 'in', 'notin'.(e.g. -l key1=value1,key2=value2,key3 in (value3)). Matching objects must satisfy all of the specified label constraints. |
| --show-managed-fields |
|  | If true, keep the managedFields when printing objects in JSON or YAML format. |
| --template string |
|  | Template string or path to template file to use when -o=go-template, -o=go-template-file. The template format is golang templates \[http://golang.org/pkg/text/template/#pkg-overview\]. |
| --to-revision int |
|  | The revision to rollback to. Default to 0 (last revision). |

## Parent Options Inherited [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/\#parent-options-inherited)

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

## See Also [Heading self-link](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/\#see-also)

- [kubectl rollout](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/) \- Manage the rollout of a resource

## Feedback

Was this page helpful?

YesNo

Thanks for the feedback. If you have a specific, answerable question about how to use Kubernetes, ask it on
[Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes).
Open an issue in the [GitHub Repository](https://www.github.com/kubernetes/website/) if you want to
[report a problem](https://github.com/kubernetes/website/issues/new?title=Issue%20with%20k8s.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/)
or
[suggest an improvement](https://github.com/kubernetes/website/issues/new?title=Improvement%20for%20k8s.io/docs/reference/kubectl/generated/kubectl_rollout/kubectl_rollout_undo/).

Last modified March 22, 2026 at 3:35 PM PST: [Switch to Hugo page discovery and add description field to kubectl command front matter (83100f9a0d)](https://github.com/kubernetes/website/commit/83100f9a0db1c9a1954de0d9552c4733e73029ae)

This page is automatically generated.

If you plan to report an issue with this page, mention that the page is auto-generated in your issue description. The fix may need to happen elsewhere in the Kubernetes project.