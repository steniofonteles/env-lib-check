import { Command } from "commander";
import { report } from "./report.js";
import { configSchema } from "./config.js";
import fs from "node:fs";
import readline from "node:readline/promises";
import path from "node:path";
import { includetscInScriptStart, isTrue } from "./packageJson.js";

const program = new Command();

program
  .name("elc")
  .description("Environment variables checker")
  .action(async (options) => {
    const envs = await report(options.path);
    const hasError = !envs || envs.some((env) => env.status === "error");

    if (hasError) {
      process.exitCode = 1;
    }
  });

program
  .command("init")
  .description("Create the configuration file")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const configPath = path.join(process.cwd(), "env-lib-check.config.json");
    const pathAnswer = await rl.question(`Project folder (default: .): `);
    const envPathAnswer = await rl.question(`Path to .env (default: .env):`);
    const LeakDetection = await rl.question(
      `Do variable leak detection?? (y/n, default: n): `,
    );
    const runOnStartAnswer = await rl.question(
      `Run at application startup? (y/n, default: n): `,
    );
    const runCreateDotEnv = await rl.question(
      `Create .env file if it doesn't exist? (y/n, default: n): `,
    );
    const setVariablesNotFound = await rl.question(
      `Set variables not found in .env file? (y/n, default: n): `,
    );

    const config = configSchema.parse({
      path: pathAnswer || ".",
      envPath: envPathAnswer || ".env",
      runOnStart: isTrue(runOnStartAnswer),
      createDotEnv: isTrue(runCreateDotEnv),
      setVariablesNotFound: isTrue(setVariablesNotFound),
      LeakDetection: isTrue(LeakDetection),
    });

    if (fs.existsSync(configPath)) {
      const answer = await rl.question(
        "The file already exists. Overwrite? (y/n)",
      );

      if (!isTrue(answer)) {
        rl.close();
      } else {
        if (isTrue(runOnStartAnswer)) {
          includetscInScriptStart(pathAnswer || ".");
        }
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      }
    } else {
      if (isTrue(runOnStartAnswer)) {
        includetscInScriptStart(pathAnswer || ".");
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
    rl.close();
  });

program.parse();
