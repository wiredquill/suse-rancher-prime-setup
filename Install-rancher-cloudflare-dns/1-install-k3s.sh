#!/bin/bash
set -e

# Install K3s 
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.31.6+k3s1" sh -

# Make the kubeconfig readable for erin
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
