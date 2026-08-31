import path from "node:path"
import { Project, SyntaxKind } from "ts-morph"


export function scanner(baseDir:string) {
    const project = new Project()
    const sourceFiles = project.addSourceFilesAtPaths([
        path.join(baseDir, "**/*.{ts,tsx,js,jsx}"),
       "!" + path.join(baseDir, "**/node_modules/**")
    ])
    const envs = new Set<string>()


    for (let i = 0; i < sourceFiles.length; i++) {
        const sourceFile = sourceFiles[i]
        if (!sourceFile) continue
        const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

        const filterEnvs = propertyAccesses.filter(env => env.getExpression().getText() === "process.env")
        filterEnvs.forEach((env) => {
            const variable = env.getName()
            if (variable) {
                envs.add(variable)
            }
        }
        )

        const propertyElementAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.ElementAccessExpression);
        const filterElementEnvs = propertyElementAccesses.filter(env => env.getExpression().getText() === "process.env")
        filterElementEnvs.forEach((env) => {
            const arg = env.getArgumentExpression();
            const stringLiteral = arg?.asKind(SyntaxKind.StringLiteral);
            if (stringLiteral) {
                const value = stringLiteral.getLiteralValue();
                if (value) {
                    envs.add(value)

                }
            }
        }
        )
    }
    return envs
}