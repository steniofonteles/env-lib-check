import fs from "node:fs"
import path from "node:path"



export function editPackageJson(baseDir: string) {
    const packageJson = fs.readFileSync(path.join(baseDir, "package.json"), "utf-8")
    const currentPackageJson = JSON.parse(packageJson)
    if (!currentPackageJson.scripts) {
        console.log("SCRIPT START COMAND NOT FOUNT IN PACKAGE ❌")
        return
    }
    const startScript = currentPackageJson.scripts?.start
    if (!startScript) {
        console.log("START COMAND NOT FOUNT ❌")
        return
    }

    if (startScript.includes("elc")) {
        console.log("COMAND ALREDY INCLUDE ❌")
        return
    }
    currentPackageJson.scripts.start = "elc && " + currentPackageJson.scripts.start

    fs.writeFileSync(path.join(baseDir, "package.json"), JSON.stringify(currentPackageJson, null, 2))
}




export function isTrue(value: string): boolean {
    if (value === "y" || value === "yes") {
        return true
    } else {
        return false
    }
}

