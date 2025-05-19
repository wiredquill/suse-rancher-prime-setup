import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import { NetworkAttachmentDefinition } from "../crds/nodejs/k8s/v1";

function createNetworkAttachmentDefinition(
    name: string,
    annotations: { [key: string]: string },
    config: string,
    opts: pulumi.CustomResourceOptions = {}): NetworkAttachmentDefinition {
    return new NetworkAttachmentDefinition(name, {
        metadata: {
            name: name,
            namespace: "default",
            annotations: annotations
        },
        spec: {
            config: config
        }
    }, opts);
}

export function createBackboneVlan(opts: pulumi.CustomResourceOptions): NetworkAttachmentDefinition {
    return createNetworkAttachmentDefinition(
        "backbone-vlan",
        {
            "network.harvesterhci.io/clusternetwork": "mgmt",
            "network.harvesterhci.io/ready": "true",
            "network.harvesterhci.io/type": "UntaggedNetwork"
        },
        "{\"cniVersion\":\"0.3.1\",\"name\":\"backbone\",\"type\":\"bridge\",\"bridge\":\"mgmt-br\",\"promiscMode\":true,\"ipam\":{}}",
        opts
    );
}
