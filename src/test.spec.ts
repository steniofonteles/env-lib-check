import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import fs from "node:fs";
import { report } from "./report.js";

describe("Report", () => {
  let consoleSpy: jest.SpiedFunction<typeof console.log>;
  const envFile = fs.existsSync(".env")
  const configPath = fs.existsSync(`./env-lib-check.config.json`);
  process.env.TEST_ENV
  process.env.TEST_ENVI

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("Should inform that .env or env-check-config.json not found", () => {
    report()

    if (!envFile && !configPath) {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(".env NOT FOUND AND env-lib-check.config.json NOT FOUND")
      )
    } else if (!envFile) {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(".env NOT FOUND"),
      );
    }
  })


  it("Should inform that TEST_ENV is correct", () => {
    const fd = fs.openSync(".env", "w");
    fs.fchmodSync(fd, 0o644);
    fs.writeFileSync(".env", "TEST_ENV=correct_value");
    report();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("TEST_ENV CORRECT ✅"),
    );
  });

  it("Should inform that TEST_ENVI is not found in .env", () => {
    const fd = fs.openSync(".env", "w");
    fs.fchmodSync(fd, 0o644);
    fs.writeFileSync(".env", "TEST_ENVI=correct_value");
    report();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("TEST_ENV NOT FOUND IN .ENV"),
    );
  });
});
