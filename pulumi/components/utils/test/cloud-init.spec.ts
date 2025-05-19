import * as yaml from "yaml";
import { CloudInitUser, CloudInitUserArgs } from "../src/cloud-init";
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
