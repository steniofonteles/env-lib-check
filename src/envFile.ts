import fs from 'node:fs';

const currentEnv = fs.readFileSync("./.env", "utf-8")

if(!currentEnv){
    throw new Error("File .env not found")
}

console.log(currentEnv)
