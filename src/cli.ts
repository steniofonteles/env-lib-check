#!/usr/bin/env node
import { Command } from "commander";
import { report } from "./report.js";
import { configSchema } from "./config.js";
import fs from "node:fs"
import readline from "node:readline/promises";
import path from "node:path";
import { editPackageJson, isTrue } from "./packageJson.js";

const program = new Command();
program
    .name("elc")
    .description("...")
    .action((options) => {
        report(options.path);
    })

program
    .command("init")
    .description("Cria o arquivo de configuração")
    .action(async () => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const configPath = path.join(process.cwd(), "env-lib-check.config.json");
        const pathAnswer = await rl.question(`Project folder (default: .): `);
        const envPathAnswer = await rl.question(`Path to .env (default: .env):`);
        const runOnStartAnswer = await rl.question(`Run at application startup? (y/n, padrão: n): `);

        const config = configSchema.parse({
            path: pathAnswer || ".",
            envPath: envPathAnswer || ".env",
            runOnStart: isTrue(runOnStartAnswer) ? true : false || false
        });

        if (fs.existsSync(configPath)) {
            const answer = await rl.question("O arquivo já existe. Sobrescrever? (y/n) ");

            if (!isTrue(answer)) {
                rl.close();
            } else {
                if (isTrue(runOnStartAnswer)) {
                    editPackageJson(pathAnswer || ".");
                }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            }

        } else {
            if (isTrue(runOnStartAnswer)) {
                editPackageJson(pathAnswer || ".");
            }
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
        rl.close();
    });


program.parse();