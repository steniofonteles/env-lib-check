import { describe, expect, it } from "@jest/globals";
import { resolveDefaults, getVarsFromLibs } from "./envsDefaults.js";

describe("resolveDefaults", () => {
  it("returns the default value for a known env key", () => {
    expect(resolveDefaults("DATABASE_URL")).toBe(
      "postgresql://user:password@localhost:5432/dbname",
    );
  });

  it("returns the first matching profile when multiple profiles share a key", () => {
    expect(resolveDefaults("OPENAI_API_KEY")).toBe("sk-your-api-key");
  });

  it("returns undefined for an unknown env key", () => {
    expect(resolveDefaults("SOME_UNKNOWN_VARIABLE")).toBeUndefined();
  });
});

describe("getVarsFromLibs", () => {
  it("returns the default vars for a single installed library", () => {
    expect(getVarsFromLibs(["stripe"])).toEqual({
      STRIPE_SECRET_KEY: "sk_test_xxx",
      STRIPE_WEBHOOK_SECRET: "whsec_xxx",
    });
  });

  it("merges vars from multiple installed libraries", () => {
    const vars = getVarsFromLibs(["stripe", "mongoose"]);

    expect(vars).toEqual({
      STRIPE_SECRET_KEY: "sk_test_xxx",
      STRIPE_WEBHOOK_SECRET: "whsec_xxx",
      MONGODB_URI: "mongodb://localhost:27017/dbname",
    });
  });

  it("matches a profile if any of its packages is installed", () => {
    const vars = getVarsFromLibs(["mysql2"]);

    expect(vars).toEqual({
      DATABASE_URL: "mysql://user:password@localhost:3306/dbname",
    });
  });

  it("returns an empty object when no libs match a known profile", () => {
    expect(getVarsFromLibs(["left-pad", "chalk"])).toEqual({});
  });

  it("returns an empty object for an empty libs list", () => {
    expect(getVarsFromLibs([])).toEqual({});
  });
});
