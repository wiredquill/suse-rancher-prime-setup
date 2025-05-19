import * as yaml from "yaml";
import { CloudInitUser, CloudInitUserArgs, CloudInit } from "../src/cloud-init";
import { assert } from "chai";
import { describe, it } from "mocha";

describe("CloudInitUser", () => {
    it("should initialize with required fields", () => {
        const args: CloudInitUserArgs = {
            name: "testuser",
            password: "testpass"
        };
        const user = new CloudInitUser(args);
        assert.equal(user.name, "testuser");
        assert.equal(user.password, "testpass");
        assert.equal(user.shell, "/bin/bash");
        assert.equal(user.sudo, undefined);
        assert.equal(user.sshAuthorizedKeys, undefined);
        assert.equal(user.lockPassword, undefined);
    });

    it("should initialize with all fields", () => {
        const args: CloudInitUserArgs = {
            name: "alice",
            sudo: "ALL=(ALL) NOPASSWD:ALL",
            password: "secret",
            sshAuthorizedKeys: ["ssh-rsa AAA..."],
            lockPassword: true,
            shell: "/bin/zsh"
        };
        const user = new CloudInitUser(args);
        assert.equal(user.name, "alice");
        assert.equal(user.sudo, "ALL=(ALL) NOPASSWD:ALL");
        assert.equal(user.password, "secret");
        assert.deepEqual(user.sshAuthorizedKeys, ["ssh-rsa AAA..."]);
        assert.equal(user.lockPassword, true);
        assert.equal(user.shell, "/bin/zsh");
    });

    it("should generate correct YAML", () => {
        const args: CloudInitUserArgs = {
            name: "bob",
            password: "pw",
            sshAuthorizedKeys: ["key1", "key2"],
            lockPassword: false,
            shell: "/bin/sh"
        };
        const user = new CloudInitUser(args);
        const yamlStr = user.toYaml();
        const parsed = yaml.parse(yamlStr);
        assert.equal(parsed.name, "bob");
        assert.equal(parsed.password, "pw");
        assert.deepEqual(parsed.ssh_authorized_keys, ["key1", "key2"]);
        assert.equal(parsed.lock_password, false);
        assert.equal(parsed.shell, "/bin/sh");
    });

    it("should omit undefined fields in YAML", () => {
        const args: CloudInitUserArgs = {
            name: "eve",
            password: "pw"
        };
        const user = new CloudInitUser(args);
        const yamlStr = user.toYaml();
        const parsed = yaml.parse(yamlStr);
        assert.equal(parsed.name, "eve");
        assert.equal(parsed.password, "pw");
        assert.equal(parsed.shell, "/bin/bash");
        assert.ok(!("sudo" in parsed));
        assert.ok(!("ssh_authorized_keys" in parsed));
        assert.ok(!("lock_password" in parsed));
    });
});

describe("CloudInit", () => {
    it("should initialize with required fields", () => {
        const args = {
            templated: true
        };
        const ci = new CloudInit(args);
        assert.equal(ci.templated, true);
        assert.equal(ci.users, undefined);
        assert.equal(ci.packages, undefined);
        assert.equal(ci.packageUpdate, undefined);
        assert.equal(ci.packageUpgrade, undefined);
        assert.equal(ci.writeFiles, undefined);
        assert.equal(ci.runcmd, undefined);
    });

    it("should initialize with all fields", () => {
        const args = {
            templated: false,
            users: [
                { name: "bob", password: "pw" }
            ],
            packages: [
                "nginx",
                { name: "curl", version: "7.79.1" }
            ],
            packageUpdate: true,
            packageUpgrade: false,
            writeFiles: [
                { path: "/tmp/test.txt", content: "hello", permissions: "0644", owner: "root:root" }
            ],
            runcmd: [
                "echo hello",
                ["ls", "-l"]
            ]
        };
        const ci = new CloudInit(args);
        assert.equal(ci.templated, false);
        assert.equal(ci.users?.length, 1);
        assert.equal(ci.users?.[0].name, "bob");
        assert.deepEqual(ci.packages, [
            "nginx",
            { name: "curl", version: "7.79.1" }
        ]);
        assert.equal(ci.packageUpdate, true);
        assert.equal(ci.packageUpgrade, false);
        assert.deepEqual(ci.writeFiles, [
            { path: "/tmp/test.txt", content: "hello", permissions: "0644", owner: "root:root" }
        ]);
        assert.deepEqual(ci.runcmd, [
            "echo hello",
            ["ls", "-l"]
        ]);
    });

    it("should generate correct YAML with all fields", () => {
        const args = {
            templated: true,
            users: [
                { name: "alice", password: "pw", shell: "/bin/zsh" }
            ],
            packages: [
                "vim",
                ["git", "2.30.0"]
            ],
            packageUpdate: true,
            packageUpgrade: true,
            writeFiles: [
                { path: "/etc/motd", content: "Welcome", permissions: "0644" }
            ],
            runcmd: [
                "uptime",
                ["systemctl", "enable", "--now"]
            ]
        };
        const ci = new CloudInit(args);
        const yamlStr = ci.toYaml();
        console.log(yamlStr);
        const parsed = yaml.parse(yamlStr);

        assert.ok(Array.isArray(parsed.users));
        assert.equal(parsed.users[0].name, "alice");
        assert.equal(parsed.users[0].shell, "/bin/zsh");
        assert.deepEqual(parsed.packages, [
            "vim",
            ["git", "2.30.0"]
        ]);
        assert.equal(parsed.package_update, true);
        assert.equal(parsed.package_upgrade, true);
        assert.deepEqual(parsed.write_files, [
            { path: "/etc/motd", content: "Welcome", permissions: "0644" }
        ]);
        assert.deepEqual(parsed.runcmd, [
            "uptime",
            ["systemctl", "enable", "--now"]
        ]);
    });

    it("should add cloud config preamble", () => {
        const args = {
            templated: true
        };
        const ci = new CloudInit(args);
        const yamlStr = ci.toYaml();
        assert.ok(yamlStr.startsWith("## template: jinja\n#cloud-config"));
    });
    it("should add cloud config preamble without templated", () => {
        const args = {
            templated: false
        };
        const ci = new CloudInit(args);
        const yamlStr = ci.toYaml();
        assert.ok(yamlStr.startsWith("#cloud-config"));
    });

    it("should omit undefined fields in YAML", () => {
        const args = {
            templated: false
        };
        const ci = new CloudInit(args);
        const yamlStr = ci.toYaml();
        const parsed = yaml.parse(yamlStr);

        assert.ok(!("users" in parsed));
        assert.ok(!("packages" in parsed));
        assert.ok(!("package_update" in parsed));
        assert.ok(!("package_upgrade" in parsed));
        assert.ok(!("write_files" in parsed));
        assert.ok(!("runcmd" in parsed));
    });
});
