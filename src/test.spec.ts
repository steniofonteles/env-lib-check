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
  process.env.TEST_ENV;
  process.env.TEST_ENV2;
  process.env.TEST_ENV3;
    process.env.TEST_ENV4;


  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("Should inform that .env file is not found", () => {
    report();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(".ENV NOT FOUND"),
    );
  });

  it("Should inform that TEST_ENV is correct", () => {
    const fd = fs.openSync(".env", "w");
    fs.fchmodSync(fd, 0o644);
    fs.writeFileSync(".env", "TEST_ENV=correct_value");
    report();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("TEST_ENV CORRECT ✅"),
    );
    fs.rmSync(".env");
  });

  it("Should inform that TEST_ENV is not found in .env", () => {
    const fd = fs.openSync(".env", "w");
    fs.fchmodSync(fd, 0o644);
    fs.writeFileSync(".env", "TEST_ENVI=correct_value");
    report();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("TEST_ENV NOT FOUND IN .ENV"),
    );
    fs.rmSync(".env");
  });
});
