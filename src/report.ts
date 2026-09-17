import { readEnvFile } from "./envFile.js";
import { scanner } from "./scanner.js";
import path from "node:path";
import { consoleCheckout } from "./terminalConfig.js";
import fs from "node:fs";
import { resolveDefaults, getVarsFromLibs } from "./envsDefaults.js";
import { getLibsInDependencie } from "./packageJson.js";

export async function report(baseDir: string = process.cwd()) {
  const envPath = path.join(baseDir, ".env");
  const dotenvExist = readEnvFile(envPath);
  const configPath = fs.existsSync(`./env-lib-check.config.json`);

  if (!dotenvExist.exists && !configPath) {
    consoleCheckout(
      [
        {
          env: `.env NOT FOUND AND env-lib-check.config.json NOT FOUND ${"\n\n"}RUN ELC INIT FOR GENERATE CONFIG`,
          status: "info",
        },
      ],
      baseDir,
    );
    return;
  } else if (!dotenvExist.exists) {
    consoleCheckout(
      [
        {
          env: `.env NOT FOUND`,
          status: "info",
        },
      ],
      baseDir,
    );
    return;
  }

  const allEnvs = scanner(baseDir);
  const envs = [] as {
    env: string;
    status: "ok" | "warn" | "error" | "info";
  }[];

  allEnvs.forEach((env) => {
    const setInDotEnv = dotenvExist.keys.get(env);
    if (setInDotEnv === "") {
      envs.push({ env: env, status: "warn" });
    } else if (!setInDotEnv) {
      envs.push({ env: env, status: "error" });
    } else {
      envs.push({ env: env, status: "ok" });
    }
  });

  if (configPath) {
    const file = fs.readFileSync(`./env-lib-check.config.json`, "utf-8");
    const config = JSON.parse(file) as {
      createDotEnv: boolean;
      setVariablesNotFound: boolean;
    };

    if (config.createDotEnv && !dotenvExist.exists) {
      const libs = getLibsInDependencie(baseDir) ?? [];
      const libVars = getVarsFromLibs(libs);

      const libOnlyKeys = Object.keys(libVars);

      const content = [
        ...libOnlyKeys.map((key) => `${key}=${libVars[key]}`),
      ].join("\n");

      libOnlyKeys.forEach((variable) => {
        const elementIndex = envs.findIndex((env) => env.env === variable);

        if (elementIndex !== -1) {
          const env = envs[elementIndex];

          if (env) {
            env.status = "ok";
          }
        }
      });

      fs.writeFileSync(envPath || ".env", content);

      dotenvExist.exists = true;
    }

    if (config.setVariablesNotFound && dotenvExist.exists) {
      const envFileContent = dotenvExist.exists
        ? fs.readFileSync(envPath, "utf-8")
        : "";

      const existingKeys = new Set(
        envFileContent.split("\n").map((line) => line.split("=")[0]),
      );

      const missingEnvs = envs.filter((env) => !existingKeys.has(env.env));

      if (missingEnvs.length > 0) {
        const newEnvContent = missingEnvs
          .map((env) => `${env.env}=${resolveDefaults(env.env) || ""}`)
          .join("\n");

        missingEnvs.forEach((variable) => {
          const elementIndex = envs.findIndex((env) => env.env === variable.env)
          if (elementIndex !== -1) {
            const env = envs[elementIndex]
            if (env) {
              env.status = "ok"
            }
          }
        });

        fs.appendFileSync(envPath, `\n${newEnvContent}`);
      }
    }
  }
  consoleCheckout(envs, baseDir);
}
