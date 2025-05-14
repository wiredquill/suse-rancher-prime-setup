# Lab Setup Instructions

## Overview
This document outlines the setup procedure for a demo lab environment utilizing Rancher and Kubernetes clusters.

## Prerequisites

### Domain Setup
- Domain: `dna-42.com`
- Cloudflare DNS Token
- Cloudflare Email Address

### Cluster Requirements
You will set up three separate clusters:

#### 1. Rancher Management Cluster
- Domain: `rancher.dna-42.com`
- Resources:
  - RAM: 10 GB
  - Storage: 60 GB
- Purpose: Hosting the Rancher Management Interface

#### 2. Infrastructure Cluster (Longhorn, Registry, Security)
- Domain: `hangar-bay.dna-42.com`
  - Subdomains:
    - `longhorn.hangar-bay.dna-42.com`
    - `security.hangar-bay.dna-42.com`
    - `registry.hangar-bay.dna-42.com`
- Resources:
  - RAM: 10 GB
  - Storage: 100 GB
- Purpose: Persistent storage, container registry, and security services

#### 3. Observability Cluster
- Domain: `radar-station.dna-42.com`
  - Subdomains:
    - `longhorn.radar-station.dna-42.com`
    - `observability.radar-station.dna-42.com`
- Kubernetes Distribution: RKE2
- Resources:
  - RAM: 10 GB
  - Storage: 100 GB
- Purpose: Monitoring and observability tools

---

# Build the Lab Clusters

## Installing Rancher

Rancher version: `2.11.0`

### Option 1: Docker Installation (Standalone)

#### Prerequisites
- Docker installed and running
- Persistent storage directory: `/data/rancher`
- Let's Encrypt certificates located at:
  - Certificate: `/data/certs/fullchain.pem`
  - Private Key: `/data/certs/privkey.pem`

#### Installation Command
```bash
docker run -d --restart=unless-stopped \
  --name rancher \
  -p 80:80 -p 443:443 \
  -v /data/rancher:/var/lib/rancher \
  -v /data/certs/fullchain.pem:/etc/rancher/ssl/cert.pem \
  -v /data/certs/privkey.pem:/etc/rancher/ssl/key.pem \
  --privileged \
  rancher/rancher:v2.11.0 \
  --no-cacerts
```

### Option 2: Kubernetes Installation (K3s with Helm)

#### Steps
1. Install K3s:
    ```bash
    curl -sfL https://get.k3s.io | sh -
    ```

2. Install Cert-Manager:
    ```bash
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
    ```

3. Install Rancher via Helm:
    ```bash
    helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
    helm install rancher rancher-stable/rancher \
      --namespace cattle-system \
      --create-namespace \
      --set hostname=rancher.dna-42.com \
      --set ingress.tls.source=letsEncrypt \
      --set letsEncrypt.email=<your-email@example.com> \
      --set letsEncrypt.ingress.class=traefik
    ```

### Post-installation Configuration
After Rancher installation:

- Access Rancher UI: `https://rancher.dna-42.com`
- Configure Global Settings:
  - Navigate to **Global Settings → Settings → agent-tls-mode**
  - Set value to `system-store`

---

## Installing Downstream Infrastructure Cluster


Use the Rancher UI to create a downstream cluster with the following configuration:
- Cluster Type: RKE2
- Cluster Name: `hangar-bay`

Once the cluster is active, verify accessibility at `hangar-bay.dna-42.com`.

## Installing Downstream Observability Cluster

Use the Rancher UI to create a downstream cluster with the following configuration:
- Cluster Type: K3s
- Traefik Disabled: Yes
- Cluster Name: `radar-station`

Once the cluster is active, verify accessibility at `radar-station.dna-42.com`.

# Configure Clusters for Automatic Deployment

## Create configuration YAMLs

First, customize the YAML files containing your authentication details, such as application collection tokens and Cloudflare tokens.

Refer to the appropriate documentation to create these YAML files.

## Apply YAMLs to clusters

Apply the `local-cluster-fleet.yaml` to the main Rancher cluster (`local`). This file contains the core secrets required to run Fleet.

Apply the `downstream-cluster-fleet.yaml` to all downstream clusters. This sets up the application collection, SSC configuration, and related settings.

### Rancher Local Cluster

On your main Rancher cluster, use the Rancher UI to import your customized `local-cluster-fleet.yaml` file.

### On  `hangar-bay` and `radar-station`

Use the Rancher UI to deploy the `downstream-cluster-fleet.yaml` file to both `hangar-bay` and `radar-station` clusters.

## Setup Hosted Domain Names

Use the terminal provided by the Rancher UI in your local cluster and perform the following steps:

Annotate the downstream clusters to specify their hosted domain for certificate creation:
```
kubectl annotate cluster.provisioning.cattle.io -n fleet-default hangar-bay "hosted-domain=dna-42.com"

kubectl annotate cluster.provisioning.cattle.io -n fleet-default radar-station "hosted-domain=dna-42.com"
```
## Configure Fleet to Install Nginx Ingress

The K3s cluster `radar-station` does not yet have an ingress controller. Assign a label so Fleet can identify and install Nginx Ingress.

Run the following command in the Rancher UI terminal:
```
kubectl label clusters.provisioning.cattle.io -n fleet-default radar-station needs-ingress-nginx=true
```

# Start Cluster Deployment via Fleet

## Apply fleet/lab-setup.yaml

Use the Rancher UI to apply the `fleet/lab-setup.yaml` configuration to the `local` cluster.

## Wait for a while (5-10 mins)

Monitor both downstream clusters to verify that cert-manager is installed. In the Rancher UI, browse to the Workloads section and inspect the `cert-manager` namespace. Review the logs to confirm successful deployment.

## Customize Downstream Clusters

To install applications, apply the appropriate label to the target cluster.

Apply one label at a time and allow the installation to complete before continuing. Start from the base of the stack (e.g., storage first if required).

`needs-storage` to  `true`          # SUSE Storage  
`needs-private-registry` to `true`  # SUSE Private Registry 
`needs-security` to `true`          # SUSE Security 
`needs-observability` to `true`     # Observability


## For Infrastructure Cluster `hangar-bay` 

Apply one at a time and wait for it to fully complete before you move on to the next step. Always check the url to verify everything is working.

### Install SUSE Storage

Apply the following label via the Rancher UI:
```
needs-storage=true
```

Once deployed, verify accessibility at:
```
https://longhorn.hangar-bay.dna-42.com
```

### Install SUSE Security

Apply the following label:
```
needs-security=true
```

Verify at:
```
https://security.hangar-bay.dna-42.com
```

### Install SUSE Registry

Apply the following label:
```
needs-private-registry=true
```

Verify at:
```
https://registry.hangar-bay.dna-42.com
```

## For Infrastructure Cluster `radar-station` 

Apply one at a time and wait for it to fully complete before you move on to the next step. Always check the url to verify everything is working.

### Install SUSE Storage

Apply the following label:
```
needs-storage=true
```

Once deployed, verify accessibility at:
```
https://longhorn.radar-station.dna-42.com
```

### Install SUSE Observability

Apply the following label:
```
needs-observability=true
```

Once deployed, verify accessibility at:
```
https://observability.radar-station.dna-42.com
```

# Configure SUSE Observability


## Add the Agent to the downstream Cluster

You can add the SUSE Observability Helm repository using either of the following methods:

**Option 1: Rancher UI**
- Navigate to **Apps → Repositories** in the Rancher UI.
- Add a new Helm repo with the following URL:
  ```
  https://charts.rancher.com/server-charts/prime/suse-observability
  ```

**Option 2: Command Line**
```
helm repo add suse-observability https://charts.rancher.com/server-charts/prime/suse-observability
helm repo update
```




## Additional Notes
- Ensure DNS records correctly point domains to your cluster IPs.
- Regularly monitor resource utilization across clusters.
- Verify SSL certificates and renew them as needed.