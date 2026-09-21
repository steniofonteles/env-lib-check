import { describe, expect, it, afterEach } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { simpleGit } from "simple-git";
import { scanner, scanCommitsWithSimpleGit } from "./scanner.js";

describe("scanner", () => {
  const tmpDirs: string[] = [];

  function makeTmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "elc-scanner-"));
    tmpDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    while (tmpDirs.length) {
      const dir = tmpDirs.pop();
      if (dir) fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("finds process.env.VAR property access usages", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, "index.ts"),
      "const url = process.env.DATABASE_URL;",
    );

    const envs = scanner(dir);

    expect(envs.has("DATABASE_URL")).toBe(true);
  });

  it("finds process.env['VAR'] element access usages", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, "index.ts"),
      "const url = process.env['DATABASE_URL'];",
    );

    const envs = scanner(dir);

    expect(envs.has("DATABASE_URL")).toBe(true);
  });

  it("collects usages across multiple files without duplicates", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, "a.ts"),
      "const a = process.env.SHARED_VAR;",
    );
    fs.writeFileSync(
      path.join(dir, "b.js"),
      "const b = process.env.SHARED_VAR; const c = process.env.OTHER_VAR;",
    );

    const envs = scanner(dir);

    expect(envs.size).toBe(2);
    expect(envs.has("SHARED_VAR")).toBe(true);
    expect(envs.has("OTHER_VAR")).toBe(true);
  });

  it("ignores files inside node_modules", () => {
    const dir = makeTmpDir();
    fs.mkdirSync(path.join(dir, "node_modules", "some-lib"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(dir, "node_modules", "some-lib", "index.js"),
      "const x = process.env.SHOULD_BE_IGNORED;",
    );
    fs.writeFileSync(
      path.join(dir, "index.ts"),
      "const y = process.env.SHOULD_BE_FOUND;",
    );

    const envs = scanner(dir);

    expect(envs.has("SHOULD_BE_IGNORED")).toBe(false);
    expect(envs.has("SHOULD_BE_FOUND")).toBe(true);
  });

  it("returns an empty set when no process.env usages exist", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "index.ts"), "const x = 1;");

    const envs = scanner(dir);

    expect(envs.size).toBe(0);
  });
});

describe("scanCommitsWithSimpleGit", () => {
  const tmpDirs: string[] = [];

  function makeTmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "elc-git-"));
    tmpDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    while (tmpDirs.length) {
      const dir = tmpDirs.pop();
      if (dir) fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  async function initRepo(dir: string) {
    const git = simpleGit(dir);
    await git.init();
    await git.addConfig("user.email", "test@example.com");
    await git.addConfig("user.name", "Test");
    return git;
  }

  it("returns commits that touched a .env file", async () => {
    const dir = makeTmpDir();
    const git = await initRepo(dir);

    fs.writeFileSync(path.join(dir, "README.md"), "hello");
    await git.add("README.md");
    await git.commit("chore: add readme");

    fs.writeFileSync(path.join(dir, ".env"), "SECRET=leaked");
    await git.add(".env");
    await git.commit("fix: oops committed env file");

    const issues = await scanCommitsWithSimpleGit(dir);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("oops committed env file");
  });

  it("returns an empty array when no commit touched a .env file", async () => {
    const dir = makeTmpDir();
    const git = await initRepo(dir);

    fs.writeFileSync(path.join(dir, "README.md"), "hello");
    await git.add("README.md");
    await git.commit("chore: add readme");

    const issues = await scanCommitsWithSimpleGit(dir);

    expect(issues).toEqual([]);
  });
});
