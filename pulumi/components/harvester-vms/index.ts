import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { fileSync } from "tmp";
import { writeFileSync } from "fs";

export interface HarvesterVmsArgs {
    kubeconfig: pulumi.Input<string>;
}

export class HarvesterVms extends pulumi.ComponentResource {
    constructor(name: string, args: HarvesterVmsArgs, opts?: pulumi.ComponentResourceOptions) {
        super("suse-tmm:components:harvester-vms", name, {}, opts);

        pulumi.all([args.kubeconfig]).apply(async ([kubeconfig]) => {
            const kubeconfigFile = fileSync({ prefix: "kubeconfig", postfix: ".yaml" });
            const fn = kubeconfigFile.name
            writeFileSync(fn, kubeconfig);

            const harvesterK8sProvider = new k8s.Provider("harvester-k8s", {
                kubeconfig: fn,
            }, { parent: this });
        });
    }
};

