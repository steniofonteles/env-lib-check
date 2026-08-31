import { CheckinEnvExist } from "./envFile.js";
import { scanner } from "./scanner.js";
import path from "node:path";


export function report(baseDir: string = process.cwd()){
    const envPath = path.join(baseDir, ".env");
    const dotenvExist = CheckinEnvExist(envPath)

    if(!dotenvExist.exists){
        console.log(".ENV NOT FOUND")
    }

    const allEnvs = scanner(baseDir)

    allEnvs.forEach((env) =>{
        const setInDotEnv = dotenvExist.keys.get(env)
        if(setInDotEnv === ""){
            console.log(`${env} SET BUT BLANK ❌`)
        }else if(!setInDotEnv){
            console.log(`${env} NOT FOUND IN .ENV ❌`)
        }else{
            console.log(`${env} CORRECT ✅`)
        }
    })



}