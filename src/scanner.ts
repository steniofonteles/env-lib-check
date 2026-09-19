import path from "node:path";
import { Project, SyntaxKind } from "ts-morph";
import { simpleGit } from "simple-git";
import { consoleCheckout } from "./terminalConfig.js";
interface CommitIssue {
  hash: string;
  date: string;
  author: string;
  message: string;
}

export function scanner(baseDir: string) {
  const project = new Project();
  const sourceFiles = project.addSourceFilesAtPaths([
    path.join(baseDir, "**/*.{ts,tsx,js,jsx}"),
    "!" + path.join(baseDir, "**/node_modules/**"),
  ]);
  const envs = new Set<string>();

  for (let i = 0; i < sourceFiles.length; i++) {
    const sourceFile = sourceFiles[i];
    if (!sourceFile) continue;
    const propertyAccesses = sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression,
    );

    const filterEnvs = propertyAccesses.filter(
      (env) => env.getExpression().getText() === "process.env",
    );
    filterEnvs.forEach((env) => {
      const variable = env.getName();
      if (variable) {
        envs.add(variable);
      }
    });

    const propertyElementAccesses = sourceFile.getDescendantsOfKind(
      SyntaxKind.ElementAccessExpression,
    );
    const filterElementEnvs = propertyElementAccesses.filter(
      (env) => env.getExpression().getText() === "process.env",
    );
    filterElementEnvs.forEach((env) => {
      const arg = env.getArgumentExpression();
      const stringLiteral = arg?.asKind(SyntaxKind.StringLiteral);
      if (stringLiteral) {
        const value = stringLiteral.getLiteralValue();
        if (value) {
          envs.add(value);
        }
      }
    });
  }
  return envs;
}

export async function scanCommitsWithSimpleGit(
  workspacePath: string,
): Promise<CommitIssue[]> {
  const git = simpleGit(workspacePath);
  const issues: CommitIssue[] = [];

  const log = await git.log();

  for (const commit of log.all ?? []) {
    const diff = await git.show([commit.hash, "--name-status", "--format="]);

    const lines = diff.split("\n");

    const envFiles = lines.filter((line) => {
      const [, file] = line.split("\t");

      return file?.includes(".env");
    });

    if (envFiles.length > 0) {
      issues.push({
        hash: commit.hash,
        date: new Date(commit.date).toISOString(),
        author: commit.author_name,
        message: commit.message,
      });
    }
  }

  return issues;
}
