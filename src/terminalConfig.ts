import pc from "picocolors";

export function consoleCheckout(logs: { env: string, status: "ok" | "warn" | "error" }[],baseDir:string) {
    console.log(pc.bold(pc.cyan("env-lib-check")) + " v1.0.0");
    console.log(`Scanning: ${baseDir}`);
    console.log("");
    if(logs.length === 0){
        console.log(pc.red(`NO ENVIROMENT VARIABLES NOT FOUND IN YOUR PROJECT`));
        return
    }

    logs.forEach((log) => {
        if (log.status === "error") {
            console.log(pc.red(`VARIABLE ${log.env} NOT FOUND`));
        } else if (log.status === "warn") {
            console.log(pc.yellow(`VARIABLE ${log.env} IS BLANK`));
        } else {
            console.log(pc.green(`VARIABLE ${log.env} OK ✅`));
        }
    })
    console.log("");
    const ok = logs.filter((log) => log.status === "ok")
    const error = logs.filter((log) => log.status === "error")
    const warn = logs.filter((log) => log.status === "warn")
    console.log(`${ok} passed, ${warn} warnings, ${error} errors`);

}
