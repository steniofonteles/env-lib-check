import { readEnvFile } from "./envFile.js";
import { scanner } from "./scanner.js";
import path from "node:path";
import { consoleCheckout } from "./terminalConfig.js";


export function report(baseDir: string = process.cwd()){
    const envPath = path.join(baseDir, ".env");
    const dotenvExist = readEnvFile(envPath)

    if(!dotenvExist.exists){
        console.log(".ENV NOT FOUND")
    }

    const allEnvs = scanner(baseDir)
    const envs = [] as { env: string, status: "ok" | "warn" | "error" }[]
    
    allEnvs.forEach((env) =>{
        const setInDotEnv = dotenvExist.keys.get(env)
        if(setInDotEnv === ""){
            envs.push({env: env, status:"warn"})
        }else if(!setInDotEnv){
             envs.push({env: env, status:"error"})
        }else{
             envs.push({env: env, status:"ok"})
        }
    })

    consoleCheckout(envs, baseDir)
}