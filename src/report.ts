import { readEnvFile } from "./envFile.js";
import { scanner } from "./scanner.js";
import path from "node:path";
import { consoleCheckout } from "./terminalConfig.js";
import fs from "node:fs";

export async function report(baseDir: string = process.cwd()) {
  const envPath = path.join(baseDir, ".env");
  const dotenvExist = readEnvFile(envPath);
  const configPath = fs.existsSync(`./env-lib-check.config.json`);

  if (!dotenvExist.exists && !configPath) {
    consoleCheckout([{ env: ".ENV NOT FOUND", status: "info" }], baseDir);
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
    const config = JSON.parse(file) as { createDotEnv: boolean };
    if (config.createDotEnv && !dotenvExist.exists) {
      fs.writeFileSync(
        envPath || ".env",
        envs.map((env) => `${env.env}=`).join("\n"),
      );
    }
  }

  consoleCheckout(envs, baseDir);
}
