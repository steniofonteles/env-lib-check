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
import { getVarsFromLibs, resolveDefaults } from "./envsDefaults.js";

describe("Report", () => {
  let consoleSpy: jest.SpiedFunction<typeof console.log>;
  const envFile = fs.existsSync(".env");
  const configPath = fs.existsSync(`./env-lib-check.config.json`);
  process.env.TEST_ENV;
  process.env.TEST_ENVI;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("Should inform that .env or env-check-config.json not found", () => {
    report();

    if (!envFile && !configPath) {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          ".env NOT FOUND AND env-lib-check.config.json NOT FOUND",
        ),
      );
    }
  });

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

  it("Should return variable enviroment of DATABASE_URL", () => {
    const variable = resolveDefaults("DATABASE_URL");
    expect(variable).toEqual(
      "postgresql://user:password@localhost:5432/dbname",
    );
  });

  it("Should return variable enviroments of auth0", () => {
    const getVars = getVarsFromLibs(["@auth0/nextjs-auth0"]);
    expect(getVars).toEqual({
      AUTH0_DOMAIN: "your-tenant.auth0.com",
      AUTH0_CLIENT_ID: "your-client-id",
      AUTH0_CLIENT_SECRET: "your-client-secret",
    });
  });
});
