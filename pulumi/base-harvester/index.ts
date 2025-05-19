import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as harvester from "@suse-tmm/harvester-base";
import * as rancher from "@suse-tmm/rancher-kubeconfig";

export function provisionHarvesterBase() {
    const config = new pulumi.Config("harvester");
    const harvesterUrl = config.require("url");
    const username = config.require("username");
    const password = config.requireSecret("password");

    const kubeconfig = new rancher.RancherKubeconfig("harvesterKubeconfig", {
        url: harvesterUrl,
        username: username,
        password: password,
        clusterName: "local",
        insecure: true, // Harvester normally has a self-signed cert
    });

    const harvesterBase = new harvester.HarvesterBase("harvesterBase", {
        kubeconfig: kubeconfig.kubeconfig,
        extraImages: [
            {
                name: "fedora-cloud-42",
                displayName: "Fedora Cloud 42",
                url: "https://download.fedoraproject.org/pub/fedora/linux/releases/42/Cloud/x86_64/images/Fedora-Cloud-Base-Generic-42-1.1.x86_64.qcow2"
            }
        ]
    });

    pulumi.all([kubeconfig.kubeconfig]).apply(([kubeconfig]) => {
        console.log(kubeconfig);
    });
}

provisionHarvesterBase();
