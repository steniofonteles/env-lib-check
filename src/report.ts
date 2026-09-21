import { readEnvFile } from "./envFile.js";
import { scanCommitsWithSimpleGit, scanner } from "./scanner.js";
import path from "node:path";
import { consoleCheckout } from "./terminalConfig.js";
import fs from "node:fs";
import { resolveDefaults, getVarsFromLibs } from "./envsDefaults.js";
import { getLibsInDependencie } from "./packageJson.js";

export async function report(baseDir: string = process.cwd()) {
  const configFilePath = path.join(baseDir, "env-lib-check.config.json");
  const configPath = fs.existsSync(configFilePath);

  const config = configPath
    ? (JSON.parse(fs.readFileSync(configFilePath, "utf-8")) as {
        path?: string;
        envPath?: string;
        createDotEnv: boolean;
        setVariablesNotFound: boolean;
        LeakDetection: boolean;
      })
    : undefined;

  const resolvedBaseDir = config?.path
    ? path.resolve(baseDir, config.path)
    : baseDir;
  const envPath = path.join(resolvedBaseDir, config?.envPath ?? ".env");

  const dotenvExist = readEnvFile(envPath);

  if (!dotenvExist.exists && !configPath) {
    consoleCheckout(
      [
        {
          env: `.env NOT FOUND AND env-lib-check.config.json NOT FOUND ${"\n\n"}RUN ELC INIT FOR GENERATE CONFIG`,
          status: "info",
        },
      ],
      resolvedBaseDir,
    );
    return;
  }

  const allEnvs = scanner(resolvedBaseDir);
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

  if (config) {
    if (config.createDotEnv && !dotenvExist.exists) {
      const libs = getLibsInDependencie(resolvedBaseDir) ?? [];
      const libVars = getVarsFromLibs(libs);

      const libOnlyKeys = Object.keys(libVars);

      const content = libOnlyKeys
        .map((key) => `${key}=${libVars[key]}`)
        .join("\n");

      libOnlyKeys.forEach((variable) => {
        const elementIndex = envs.findIndex((env) => env.env === variable);
        if (elementIndex !== -1) {
          const env = envs[elementIndex];
          if (env) {
            env.status = "ok";
          }
        }
      });

      fs.writeFileSync(envPath, content);
      dotenvExist.exists = true;
    }

    if (config.setVariablesNotFound && dotenvExist.exists) {
      const envFileContent = fs.readFileSync(envPath, "utf-8");

      const existingKeys = new Set(
        envFileContent.split("\n").map((line) => line.split("=")[0]),
      );

      const missingEnvs = envs.filter((env) => !existingKeys.has(env.env));

      if (missingEnvs.length > 0) {
        const newEnvContent = missingEnvs
          .map((env) => `${env.env}=${resolveDefaults(env.env) || ""}`)
          .join("\n");

        fs.appendFileSync(envPath, `\n${newEnvContent}`);

        missingEnvs.forEach((variable) => {
          const elementIndex = envs.findIndex(
            (env) =>
              env.env === variable.env && !!resolveDefaults(variable.env),
          );
          if (elementIndex !== -1) {
            const env = envs[elementIndex];
            if (env) {
              env.status = "ok";
            }
          }
        });
      }
    }

    if (config.LeakDetection) {
      const isLeak = await scanCommitsWithSimpleGit(resolvedBaseDir);
      if (isLeak.length > 0) {
        consoleCheckout(
          isLeak.map((leak) => {
            return {
              env: `hash: ${leak.hash}, message:${leak.message}, author:${leak.author}, date:$ {leak.date}`,
              status: "error",
            };
          }),
          resolvedBaseDir,
        );
        return;
      }

      envs.push({
        env: "NO VARIABLES LEAK WAS FOUND",
        status: "info",
      });
    }
  }

  consoleCheckout(envs, resolvedBaseDir);
  return envs;
}
