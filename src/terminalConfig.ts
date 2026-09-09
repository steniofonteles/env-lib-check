import pc from "picocolors";

export function consoleCheckout(logs: { env: string, status: "ok" | "warn" | "error" | "info" }[],baseDir:string) {
    console.log(pc.bold(pc.cyan("env-lib-check")) + " v1.0.0");
    console.log(`Scanning: ${baseDir}`);
    console.log("");
    if(logs.length === 0){
        console.log(pc.red(`NO ENVIROMENT VARIABLES NOT FOUND IN YOUR PROJECT`));
        return
    }

    logs.forEach((log) => {
        if (log.status === "error") {
            console.log(pc.red(`${log.env} NOT FOUND IN .ENV`));
        } else if (log.status === "warn") {
            console.log(pc.yellow(`${log.env} SET BUT BLANK`));
        } else if(log.status === "info") {
            console.log(pc.blue(`${log.env}`));
        } else {
            console.log(pc.green(`${log.env} CORRECT ✅`));
        }
    })
    console.log("");
    const ok = logs.filter((log) => log.status === "ok")
    const error = logs.filter((log) => log.status === "error")
    const warn = logs.filter((log) => log.status === "warn")
    console.log(`${ok} passed, ${warn} warnings, ${error} errors`);

}
