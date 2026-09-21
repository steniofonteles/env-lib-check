import { describe, expect, it } from "@jest/globals";
import { configSchema } from "./config.js";

describe("configSchema", () => {
  it("applies defaults when no fields are provided", () => {
    const config = configSchema.parse({});

    expect(config).toEqual({
      path: ".",
      envPath: ".env",
      runOnStart: false,
      createDotEnv: false,
      setVariablesNotFound: false,
      LeakDetection: false,
    });
  });

  it("keeps the provided values", () => {
    const config = configSchema.parse({
      path: "./apps/api",
      envPath: ".env.local",
      runOnStart: true,
      createDotEnv: true,
      setVariablesNotFound: true,
      LeakDetection: true,
    });

    expect(config).toEqual({
      path: "./apps/api",
      envPath: ".env.local",
      runOnStart: true,
      createDotEnv: true,
      setVariablesNotFound: true,
      LeakDetection: true,
    });
  });

  it("rejects non-boolean values for the boolean fields", () => {
    expect(() => configSchema.parse({ runOnStart: "yes" })).toThrow();
  });
});
