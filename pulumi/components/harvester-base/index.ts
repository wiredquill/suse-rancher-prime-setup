import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import {createSingleReplicaStorageClass} from "./src/storageclass";
import { createImages, VmImageArgs } from "./src/vmimage";
import { createBackboneVlan } from "./src/network";
import { fileSync } from "tmp";
import { writeFileSync } from "fs";

export interface HarvesterBaseArgs {
    kubeconfig: pulumi.Input<string>;
    extraImages?: pulumi.Input<VmImageArgs[]>;
}

export class HarvesterBase extends pulumi.ComponentResource {
    constructor(name: string, args: HarvesterBaseArgs, opts?: pulumi.ComponentResourceOptions) {
        super("suse-tmm:components:harvester-base", name, {}, opts);

        pulumi.all([args.kubeconfig, args.extraImages]).apply(async ([kubeconfig, extraImages]) => {
            const kubeconfigFile = fileSync({ prefix: "kubeconfig", postfix: ".yaml" });
            const fn = kubeconfigFile.name
            writeFileSync(fn, kubeconfig);

            const harvesterK8sProvider = new k8s.Provider("harvester-k8s", {
                kubeconfig: fn,
            }, { parent: this });

            const storageClass = createSingleReplicaStorageClass({ provider: harvesterK8sProvider, parent: this });
            const images = createImages(extraImages || [], { provider: harvesterK8sProvider, dependsOn: [storageClass], parent: this });
            createBackboneVlan({ provider: harvesterK8sProvider, parent: this });
            this.registerOutputs({
                images: images
            });
        });
    }
};

