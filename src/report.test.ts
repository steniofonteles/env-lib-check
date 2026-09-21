import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { simpleGit } from "simple-git";
import { report } from "./report.js";

describe("report", () => {
  const tmpDirs: string[] = [];
  let consoleSpy: jest.SpiedFunction<typeof console.log>;

  function makeTmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "elc-report-"));
    tmpDirs.push(dir);
    return dir;
  }

  function writeConfig(dir: string, config: Record<string, unknown>): void {
    fs.writeFileSync(
      path.join(dir, "env-lib-check.config.json"),
      JSON.stringify(config),
    );
  }

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    while (tmpDirs.length) {
      const dir = tmpDirs.pop();
      if (dir) fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports when neither .env nor the config file exist", async () => {
    const dir = makeTmpDir();

    const result = await report(dir);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        ".env NOT FOUND AND env-lib-check.config.json NOT FOUND",
      ),
    );
  });

  it("marks a variable as ok when it is set in .env", async () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "index.ts"), "process.env.FOUND_VAR;");
    fs.writeFileSync(path.join(dir, ".env"), "FOUND_VAR=some_value");

    const result = await report(dir);

    expect(result).toEqual([{ env: "FOUND_VAR", status: "ok" }]);
  });

  it("marks a variable as error when it is missing from .env", async () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "index.ts"), "process.env.MISSING_VAR;");
    fs.writeFileSync(path.join(dir, ".env"), "OTHER=1");

    const result = await report(dir);

    expect(result).toEqual([{ env: "MISSING_VAR", status: "error" }]);
  });

  it("marks a variable as warn when it is set but blank in .env", async () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "index.ts"), "process.env.BLANK_VAR;");
    fs.writeFileSync(path.join(dir, ".env"), "BLANK_VAR=");

    const result = await report(dir);

    expect(result).toEqual([{ env: "BLANK_VAR", status: "warn" }]);
  });

  it("resolves the scan and .env paths from the config file relative to baseDir", async () => {
    const dir = makeTmpDir();
    fs.mkdirSync(path.join(dir, "app"));
    fs.writeFileSync(
      path.join(dir, "app", "index.ts"),
      "process.env.NESTED_VAR;",
    );
    fs.writeFileSync(path.join(dir, "app", ".env.local"), "NESTED_VAR=1");
    writeConfig(dir, { path: "./app", envPath: ".env.local" });

    const result = await report(dir);

    expect(result).toEqual([{ env: "NESTED_VAR", status: "ok" }]);
  });

  it("creates .env from known library defaults when createDotEnv is set", async () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, "index.ts"),
      "process.env.STRIPE_SECRET_KEY;",
    );
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ dependencies: { stripe: "^1.0.0" } }),
    );
    writeConfig(dir, { createDotEnv: true });

    const result = await report(dir);

    expect(result).toEqual([{ env: "STRIPE_SECRET_KEY", status: "ok" }]);
    const envContent = fs.readFileSync(path.join(dir, ".env"), "utf-8");
    expect(envContent).toContain("STRIPE_SECRET_KEY=sk_test_xxx");
    expect(envContent).toContain("STRIPE_WEBHOOK_SECRET=whsec_xxx");
  });

  it("appends missing variables to .env when setVariablesNotFound is set", async () => {
    const dir = makeTmpDir();
    fs.writeFileSync(
      path.join(dir, "index.ts"),
      "process.env.DATABASE_URL; process.env.CUSTOM_VAR;",
    );
    fs.writeFileSync(path.join(dir, ".env"), "FOO=bar");
    writeConfig(dir, { setVariablesNotFound: true });

    const result = await report(dir);

    expect(result).toContainEqual({ env: "DATABASE_URL", status: "ok" });
    expect(result).toContainEqual({ env: "CUSTOM_VAR", status: "error" });

    const envContent = fs.readFileSync(path.join(dir, ".env"), "utf-8");
    expect(envContent).toContain(
      "DATABASE_URL=postgresql://user:password@localhost:5432/dbname",
    );
    expect(envContent).toContain("CUSTOM_VAR=");
  });

  describe("leak detection", () => {
    async function initRepo(dir: string) {
      const git = simpleGit(dir);
      await git.init();
      await git.addConfig("user.email", "test@example.com");
      await git.addConfig("user.name", "Test");
      return git;
    }

    it("reports leaked .env commits and stops before the normal report", async () => {
      const dir = makeTmpDir();
      const git = await initRepo(dir);
      fs.writeFileSync(path.join(dir, ".env"), "SECRET=leaked");
      await git.add(".env");
      await git.commit("fix: oops committed env file");
      writeConfig(dir, { LeakDetection: true });

      const result = await report(dir);

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("oops committed env file"),
      );
    });

    it("reports no leaks found when no commit touched .env", async () => {
      const dir = makeTmpDir();
      const git = await initRepo(dir);
      fs.writeFileSync(path.join(dir, "README.md"), "hello");
      await git.add("README.md");
      await git.commit("chore: add readme");
      writeConfig(dir, { LeakDetection: true });

      const result = await report(dir);

      expect(result).toContainEqual({
        env: "NO VARIABLES LEAK WAS FOUND",
        status: "info",
      });
    });
  });
});
