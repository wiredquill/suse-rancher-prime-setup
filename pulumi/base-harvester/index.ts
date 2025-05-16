import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import {createSingleReplicaStorageClass} from "./storageclass";
import { createImages } from "./vmimage";
import { createBackboneVlan } from "./network";
import { getRancherKubeconfig } from "./kubeconfig"
import { fileSync } from "tmp";
import { write, writeFileSync } from "fs";

const config = new pulumi.Config("harvester");
const harvesterUrl = config.require("url");
const username = config.require("username");
const password = config.requireSecret("password");


getRancherKubeconfig({
    url: harvesterUrl,
    username: username,
    password: password,
    clusterName: "local",
}).apply((kubeconfig) => {

    const kubeconfigFile = fileSync({ prefix: "kubeconfig", postfix: ".yaml" });
    const fn = kubeconfigFile.name
    writeFileSync(fn, kubeconfig);

    const harvesterK8sProvider = new k8s.Provider("harvesterK8s", {
        kubeconfig: fn,
    });

    const storageClass = createSingleReplicaStorageClass({ provider: harvesterK8sProvider });
    createImages({ provider: harvesterK8sProvider, dependsOn: [storageClass] });

    createBackboneVlan(harvesterK8sProvider);
});
