import * as pulumi from "@pulumi/pulumi";
import * as harvester from "../sdks/harvester";

export function createSingleReplicaStorageClass(opts: pulumi.CustomResourceOptions) {
    return new harvester.Storageclass("longhorn-single", {
        name: "longhorn-single",
        volumeProvisioner: "driver.longhorn.io",
        parameters: {
            "numberOfReplicas": "1",
            "migratable": "true",
            "staleReplicaTimeout": "30",
        },
        description: "Longhorn single replica storage class",
        volumeBindingMode: "Immediate",
        reclaimPolicy: "Delete",
        allowVolumeExpansion: true
    }, opts);
}
