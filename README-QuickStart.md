This Repo will help you setup a Collection of Rancher Clusters to demo a varriety to Rancher Solutions

When the system is setup and configured, you will be able to automation install and configure 

== Prerequisites

- 1 VM with SUSE Rancher Manager installed and Fleet
- 1 Downstream VM
- AppCo credentials
- CloudFlare with a managed domain
  -- This is needed for the cert-manager setup which will ensure that valid certificates are generated using Let's Encrypt for all the apps running on the cluster.

== Preparation

=== Add Secrets to Rancher Manager

Because there's a ton of secrets needed these are not stored in the repo. Instead you need to manually create this secrets in the Rancher Manager cluster.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: application-collection-basicauth
  namespace: fleet-default
type: kubernetes.io/basic-auth
stringData:
  username: <your_appco_username>
  password: <your_appco_password>
---
apiVersion: v1
kind: Secret
metadata:
  name: scc-suse-basicauth
  namespace: fleet-default
type: kubernetes.io/basic-auth
stringData:
  username: <your_scc_user>
  password: <your_scc_password>
```

=== Add Secret to Downstream cluster

Similar to the Rancher Manager, you need to add a secret to the downstream cluster that contains necessary setup which is either sensitive or is environment specific.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: fleet-secrets
  namespace: kube-system
type: Opaque
stringData:
  appco-values.yaml: |
    username: <your_appco_username>
    token: <your_appco_token>
  suse-registry-values.yaml: |
    username: <your_scc_user>
    token: <your_scc_password>
  cert-manager-values.yaml: |
    email: <your_letsencrypt_email>
    cloudflare:
      token: <your_cloudflare_token>
  harbor-values.yaml: |
    registry:
      credential:
        access_key: <your_appco_username>
        access_secret: <your_appco_token>
```

=== Annotate the Downstream Cluster

In order to be able to expose all the applications using their respective ingresses, the downstream cluster needs to be annotated with the following labels:

```bash
kubectl annotate cluster.provisioning.cattle.io -n fleet-default <cluster_name> "hosted-domain=<your_domain>"
```

== Fleet setup

On the Rancher Manager Cluster run:
```bash
kubectl apply -f ../../../fleet/lab-setup.yaml
```

This will setup fleet with the necessary GitRepo and ClusterGroup.

=== Labeling the Downstream Cluster

Now that Fleet is setup, some default applications are immediately setup, such as Cert-Manager and Kubernetes Reflector. However, for the demo scenario we need to add a few labels to the downstream cluster so that the necessary applications are installed.

```bash
kubectl label cluster.provisioning.cattle.io -n fleet-default <cluster_name> needs-storage=true
kubectl label cluster.provisioning.cattle.io -n fleet-default <cluster_name> needs-security=true
kubectl label cluster.provisioning.cattle.io -n fleet-default <cluster_name> needs-private-registry=true
kubectl label cluster.provisioning.cattle.io -n fleet-default <cluster_name> demo=susecon-2025/appco
```
