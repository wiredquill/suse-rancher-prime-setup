import * as pulumi from "@pulumi/pulumi";
import * as harvester from "../sdks/harvester";
import {createSingleReplicaStorageClass} from "./storageclass";
import {createImages} from "./vmimage";
const harvesterProvider = new harvester.Provider("harvester", {
    kubeconfig: "./kube.yaml",
    kubecontext: "flightdeck"
});

const storageClass = createSingleReplicaStorageClass({ provider: harvesterProvider });
createImages({ provider: harvesterProvider, dependsOn: [storageClass] });
