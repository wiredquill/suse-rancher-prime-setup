# Install Rancher with Let's Encrypt Certificates with CloudFlare DNS Challenge

This project automates the setup of Rancher using K3s, Cert-Manager, and Let's Encrypt with Cloudflare DNS.

## 🧩 Files & Templates

- `config.env.example` – Copy this to `config.env` and edit for your domain
- `1-install-k3s.sh` – Installs K3s and sets up kubeconfig for user 'erin'
- `2-install-cert-manager.sh` – Installs cert-manager v1.17.1
- `3-install-rancher.sh` – Installs Rancher via Helm using the hostname from config
- `clusterissuer.yaml.template` – Cert-Manager issuer using Cloudflare DNS challenge
- `rancher-cert.yaml.template` – TLS cert for Rancher ingress
- `bootstrap.sh` – Optional script to render YAMLs and apply everything

## 🚀 Quick Start - Using Batch Scripts

1. Copy and edit your configuration:
   ```bash
   cp config.env.example config.env
   nano config.env
   ```

2. Run scripts in order:
   ```bash
   chmod +x *.sh
   ./1-install-k3s.sh             - Installs K3s 
   ./2-install-cert-manager.sh    - Install Cert-Manager with the crds
   ./3-create-certs.sh            - Creates and applies clusterIssuer.yaml rancher-cert.yaml
   ./4-install-rancher.sh         - Install Rancher
   ```

## 🔧 Manual Method

### Copy and Prepare config files:

```bash
cp config.env.example config.env
nano config.env
```
Replace Default values with your own

```config.env
   DOMAIN=example.com
   RANCHER_HOSTNAME=rancher.example.com
   CLOUDFLARE_EMAIL=you@example.com
   CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
```

### Install K3s
```
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.31.6+k3s1" sh -
```

#### Make the kubeconfig readable for erin
```
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```
#### Verify Kubernetes is running

```
kubectl get nodes
```

### Install Cert-Manager

"Installing cert-manager v1.17.2..."

#### Add the cert-manager Repo

```
helm repo add jetstack https://charts.jetstack.io --force-update
helm repo update
```

#### Install cert-manager with crds
```
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.17.2 \
  --set crds.enabled=true
```

#### Verify the install

```
kubectl rollout status deployment cert-manager -n cert-manager --timeout=120s
```
```
kubectl rollout status deployment cert-manager-webhook -n cert-manager --timeout=120s
```




If you prefer **not to use templates**, just replace values like domain and email directly inside:
- `clusterissuer.yaml`
- `rancher-cert.yaml`
- Helm commands in `3-install-rancher.sh`

Then skip the `.env` and `envsubst` steps entirely.

## 📎 Requirements

- Cloudflare API token with DNS edit permissions
- DNS A record pointing your domain (e.g. rancher.example.com) to the node IP
