# Harvester 1.5

If running with Harvester 1.5.0, you will need to patch the Rancher pod to prevent it from consuming a lot of CPU resources. This is a known issue with Harvester 1.5.0 and Rancher 2.11.0.

```bash
kubectl patch deployment rancher -n cattle-system -p '{"spec":{"template":{"spec":{"containers":[{"name":"rancher","image":"rancher/rancher:v2.11.1"}]}}}}'
```

