import fs from "node:fs";
import path from "node:path";
import { consoleCheckout } from "./terminalConfig.js";

function foundPackageJson(baseDir: string) {
  try {
    const packageJson = fs.readFileSync(
      path.join(baseDir, "package.json"),
      "utf-8",
    );
    const currentPackageJson = JSON.parse(packageJson);
    return currentPackageJson;
  } catch {
    consoleCheckout(
      [{ env: `PACKAGE.JSON NOT FOUND`, status: "info" }],
      baseDir,
    );
  }
}

export function includetscInScriptStart(baseDir: string) {
  const currentPackageJson = foundPackageJson(baseDir);
  if (!currentPackageJson || !currentPackageJson.scripts) {
    consoleCheckout(
      [{ env: "SCRIPT START COMAND NOT FOUNT IN PACKAGE ❌", status: "info" }],
      baseDir,
    );
    return;
  }
  const startScript = currentPackageJson.scripts?.start;
  if (!startScript) {
    consoleCheckout(
      [{ env: "START COMAND NOT FOUNT ❌", status: "info" }],
      baseDir,
    );
    return;
  }

  if (startScript.includes("elc")) {
    consoleCheckout(
      [{ env: "COMAND ALREDY INCLUDE ❌", status: "info" }],
      baseDir,
    );
    return;
  }
  currentPackageJson.scripts.start =
    "elc && " + currentPackageJson.scripts.start;

  fs.writeFileSync(
    path.join(baseDir, "package.json"),
    JSON.stringify(currentPackageJson, null, 2),
  );
}

export function getLibsInDependencie(baseDir: string): string[] | undefined {
  const currentPackageJson = foundPackageJson(baseDir);

  if (!currentPackageJson || !currentPackageJson.dependencies) {
    consoleCheckout(
      [{ env: "DEPENDENCIES NOT FOUND IN PACKAGE.JSON ❌", status: "info" }],
      baseDir,
    );
    return;
  }
  const dependencies = currentPackageJson.dependencies;


  const keys = Object.keys(dependencies);
  return keys;
}

export function isTrue(value: string): boolean {
  if (value === "y" || value === "yes") {
    return true;
  } else {
    return false;
  }
}
