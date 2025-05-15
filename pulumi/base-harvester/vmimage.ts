import * as pulumi from "@pulumi/pulumi";
import * as harvester from "../sdks/harvester";

const images = {
    "opensuse-leap-15.6-nc": {
        displayName: "openSUSE Leap 15.6",
        url: "https://download.opensuse.org/repositories/Cloud:/Images:/Leap_15.6/images/openSUSE-Leap-15.6.x86_64-NoCloud.qcow2",
        sourceType: "download"
    },
    "centos-stream-10": {
        displayName: "CentOS Stream 10",
        url: "https://cloud.centos.org/centos/10-stream/x86_64/images/CentOS-Stream-GenericCloud-10-20250512.0.x86_64.qcow2",
        sourceType: "download"
    },
    "ubuntu-24.04-lts": {
        displayName: "Ubuntu 24.04 LTS",
        url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img",
        sourceType: "download"
    }
}

function addImage(name: string, image: any, opts: pulumi.CustomResourceOptions) {
    return new harvester.Image(name, {
        name: name,
        displayName: image.displayName,
        url: image.url,
        sourceType: image.sourceType,
        storageClassName: "longhorn-single",
        namespace: "harvester-public"
    }, opts).imageId;
}

export function createImages(opts: pulumi.CustomResourceOptions) {
    const imagesList: pulumi.Output<string>[] = [];
    for (const [name, image] of Object.entries(images)) {
        imagesList.push(addImage(name, image, opts));
    }
    return imagesList;
}
