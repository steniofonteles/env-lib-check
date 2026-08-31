import { Command } from "commander";
import { report } from "./report.js";
import { configSchema } from "./config.js";
import fs from "node:fs"
import readline from "node:readline/promises";
import path from "node:path";
const program = new Command();

program
    .option("--path <dir>", "diretório do projeto", process.cwd())
    .option("--strict", "trata warnings como erro")
    .option("--json", "saída em JSON")
    .action((options) => {
        report(options.path);
    });


program
    .name("elc")
    .description("...")

program
    .command("init")
    .description("Cria o arquivo de configuração")
    .action(async () => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const config = configSchema.parse({}); // preenche tudo com os .default() do schema
        const configPath = path.join(process.cwd(), "env-lib-check.config.json");
        if (fs.existsSync(configPath)) {
            const answer = await rl.question("O arquivo já existe. Sobrescrever? (y/n) ");

            if (answer === "n" || answer === "no") {
                rl.close();
            } else {
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            }

        } else {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }

        rl.close();
    });


program.parse();