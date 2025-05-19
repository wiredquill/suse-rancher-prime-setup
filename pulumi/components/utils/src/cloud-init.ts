import * as yaml from "yaml";



export interface CloudInitUserArgs {
    name: string;
    sudo?: string;
    password: string;
    sshAuthorizedKeys?: string[];
    lockPassword?: boolean;
    shell?: string;
}

export class CloudInitUser {
    name: string;
    sudo?: string;
    password: string;
    sshAuthorizedKeys?: string[];
    lockPassword?: boolean;
    shell?: string;
    constructor(args: CloudInitUserArgs) {
        this.name = args.name;
        this.sudo = args.sudo ;
        this.password = args.password;
        this.sshAuthorizedKeys = args.sshAuthorizedKeys;
        this.lockPassword = args.lockPassword;
        this.shell = args.shell || "/bin/bash";
    }

    toYaml(): string {
        const userObj = {
            name: this.name,
            sudo: this.sudo,
            password: this.password,
            ssh_authorized_keys: this.sshAuthorizedKeys,
            lock_password: this.lockPassword,
            shell: this.shell,
        };

        return yaml.stringify(userObj, { keepUndefined: false });
    }
}

export interface CloudInitArgs {
    templated: boolean;

    users?: CloudInitUser[];
}

// export function renderCloudInit(args: CloudInit): string {
//     let cloudInitContents = "";
//     if (args.templated) {
//         cloudInitContents = "## template: jinja\n";
//     }
//     cloudInitContents += "#cloud-config\n";

//     return cloudInitContents;
// }
