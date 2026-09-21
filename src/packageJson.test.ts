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
import {
  getLibsInDependencie,
  includetscInScriptStart,
  isTrue,
} from "./packageJson.js";

describe("packageJson helpers", () => {
  const tmpDirs: string[] = [];
  let consoleSpy: jest.SpiedFunction<typeof console.log>;

  function makeTmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "elc-pkg-"));
    tmpDirs.push(dir);
    return dir;
  }

  function writePackageJson(dir: string, content: unknown): void {
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify(content, null, 2),
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

  describe("getLibsInDependencie", () => {
    it("returns the dependency names from package.json", () => {
      const dir = makeTmpDir();
      writePackageJson(dir, {
        dependencies: { stripe: "^1.0.0", mongoose: "^7.0.0" },
      });

      expect(getLibsInDependencie(dir)).toEqual(["stripe", "mongoose"]);
    });

    it("returns undefined when package.json does not exist", () => {
      const dir = makeTmpDir();

      expect(getLibsInDependencie(dir)).toBeUndefined();
    });

    it("returns undefined when package.json has no dependencies field", () => {
      const dir = makeTmpDir();
      writePackageJson(dir, { name: "some-package" });

      expect(getLibsInDependencie(dir)).toBeUndefined();
    });
  });

  describe("includetscInScriptStart", () => {
    it("prefixes the start script with elc", () => {
      const dir = makeTmpDir();
      writePackageJson(dir, { scripts: { start: "node index.js" } });

      includetscInScriptStart(dir);

      const updated = JSON.parse(
        fs.readFileSync(path.join(dir, "package.json"), "utf-8"),
      );
      expect(updated.scripts.start).toBe("elc && node index.js");
    });

    it("does not duplicate the elc prefix if already present", () => {
      const dir = makeTmpDir();
      writePackageJson(dir, { scripts: { start: "elc && node index.js" } });

      includetscInScriptStart(dir);

      const updated = JSON.parse(
        fs.readFileSync(path.join(dir, "package.json"), "utf-8"),
      );
      expect(updated.scripts.start).toBe("elc && node index.js");
    });

    it("does nothing when there is no start script", () => {
      const dir = makeTmpDir();
      writePackageJson(dir, { scripts: { build: "tsc" } });

      expect(() => includetscInScriptStart(dir)).not.toThrow();

      const untouched = JSON.parse(
        fs.readFileSync(path.join(dir, "package.json"), "utf-8"),
      );
      expect(untouched.scripts.start).toBeUndefined();
    });

    it("does nothing when package.json does not exist", () => {
      const dir = makeTmpDir();

      expect(() => includetscInScriptStart(dir)).not.toThrow();
      expect(fs.existsSync(path.join(dir, "package.json"))).toBe(false);
    });
  });

  describe("isTrue", () => {
    it.each(["y", "yes"])("returns true for %s", (value) => {
      expect(isTrue(value)).toBe(true);
    });

    it.each(["n", "no", "", "true", "Y", "Yes"])(
      "returns false for %s",
      (value) => {
        expect(isTrue(value)).toBe(false);
      },
    );
  });
});
