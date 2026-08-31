import fs from 'node:fs';
type EnvFileResult = {
    exists: boolean;
    keys: Map<string, string>;
}
export function readEnvFile(filePath: string): EnvFileResult {
    if (!fs.existsSync(filePath)) {
        return {
            exists: false,
            keys: new Map()
        }
    }
    const currentEnv: string[] = fs.readFileSync(filePath, "utf-8").trim().split(/\r?\n/)

    const mapString = new Map()

    currentEnv.forEach((env) => {
        const firstEqual = env.indexOf("=")
        if (firstEqual === -1) {
            return
        }
        mapString.set(env.slice(0, firstEqual).trim(), env.slice(firstEqual + 1).trim())
    })

    return {
        exists: true,
        keys: mapString
    }



}
