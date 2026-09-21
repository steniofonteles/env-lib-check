import { describe, expect, it, afterEach } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readEnvFile } from "./envFile.js";

describe("readEnvFile", () => {
  const tmpDirs: string[] = [];

  function makeTmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "elc-envfile-"));
    tmpDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    while (tmpDirs.length) {
      const dir = tmpDirs.pop();
      if (dir) fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns exists: false and an empty map when the file does not exist", () => {
    const dir = makeTmpDir();
    const result = readEnvFile(path.join(dir, ".env"));

    expect(result.exists).toBe(false);
    expect(result.keys.size).toBe(0);
  });

  it("parses key=value pairs into the keys map", () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, ".env");
    fs.writeFileSync(envPath, "FOO=bar\nBAZ=qux");

    const result = readEnvFile(envPath);

    expect(result.exists).toBe(true);
    expect(result.keys.get("FOO")).toBe("bar");
    expect(result.keys.get("BAZ")).toBe("qux");
  });

  it("trims whitespace around keys and values", () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, ".env");
    fs.writeFileSync(envPath, "  FOO  =  bar  \n");

    const result = readEnvFile(envPath);

    expect(result.keys.get("FOO")).toBe("bar");
  });

  it("keeps a blank value for keys set without a value", () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, ".env");
    fs.writeFileSync(envPath, "FOO=");

    const result = readEnvFile(envPath);

    expect(result.keys.has("FOO")).toBe(true);
    expect(result.keys.get("FOO")).toBe("");
  });

  it("ignores lines without an equals sign", () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, ".env");
    fs.writeFileSync(envPath, "NOT_A_VALID_LINE\nFOO=bar");

    const result = readEnvFile(envPath);

    expect(result.keys.size).toBe(1);
    expect(result.keys.get("FOO")).toBe("bar");
  });

  it("only splits on the first equals sign, keeping the rest in the value", () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, ".env");
    fs.writeFileSync(envPath, "URL=postgres://user:pass@host:5432/db?x=1");

    const result = readEnvFile(envPath);

    expect(result.keys.get("URL")).toBe("postgres://user:pass@host:5432/db?x=1");
  });

  it("handles CRLF line endings", () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, ".env");
    fs.writeFileSync(envPath, "FOO=bar\r\nBAZ=qux\r\n");

    const result = readEnvFile(envPath);

    expect(result.keys.get("FOO")).toBe("bar");
    expect(result.keys.get("BAZ")).toBe("qux");
  });
});
