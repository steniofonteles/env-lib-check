# env-lib-check

CLI that scans your codebase for `process.env` usage and warns about missing or empty environment variables before they become a production bug.

It parses your source code's AST (not regex) to find every `process.env.X` and `process.env["X"]` reference, checks each one against your `.env` file, and reports what's missing, what's declared but empty, and what's correctly set.

## Install

```bash
npm install -D env-lib-check
```

## Usage

Run it from the root of your project:

```bash
npx elc
```

Example output:

```
API_KEY CORRECT ✅
SECRET NOT FOUND IN .ENV ❌
DATABASE_URL SET BUT BLANK ❌
```

- **`CORRECT`** — the variable is used in your code and has a value in `.env`.
- **`NOT FOUND IN .ENV`** — the variable is used in your code but doesn't exist in `.env` at all.
- **`SET BUT BLANK`** — the variable exists in `.env`, but its value is empty.

## Setup wizard

```bash
npx elc init
```




## env-lib-check.config.json

Walks you through a few questions (project folder, path to your `.env` file, whether to run the check automatically, if you want create .env file if it doesn't exist and set variables if not found in .env file) and writes an `env-lib-check.config.json` file. If you opt in to running on startup, it also adds `elc` to your `start` script in `package.json`, so a missing env var is caught before your app boots.

{
  "path": "." => path to project,
  "envPath": ".env" => path to .env file,
  "runOnStart": false => if you want run ever in start project,
  "createDotEnv": false => if you want create .env if not found file,
  "setVariablesNotFound": false => if you want set variables if found in project and not set in .env file 
}




## How it works

1. Reads your `.env` file and extracts every declared key.
2. Walks your project's `.ts`/`.tsx`/`.js`/`.jsx` files (skipping `node_modules`) and extracts every `process.env.*` reference using a real AST parser (`ts-morph`), not regex — so it's accurate even with dynamic-looking code, and it catches your own code's env var usage, not just the ones known third-party libraries use.
3. Cross-references the two lists and reports the result.



## Status

This project is under active development. Current release covers the core scanning/reporting flow described above. Planned for upcoming versions: a curated map of popular libraries (Stripe, Prisma, AWS SDK, etc.) and the env vars they typically expect, `--json` output for CI pipelines, and a non-zero exit code on missing variables.

## License

ISC
