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

1 passed, 1 warnings, 1 errors
```

- **`CORRECT`** — the variable is used in your code and has a value in `.env`.
- **`NOT FOUND IN .ENV`** — the variable is used in your code but doesn't exist in `.env` at all.
- **`SET BUT BLANK`** — the variable exists in `.env`, but its value is empty.

### Exit codes

| Code | Meaning |
| ---- | ------- |
| `0`  | No missing variables. |
| `1`  | At least one variable is missing, or `elc` couldn't run because there's no `.env` and no `env-lib-check.config.json` yet. |

This makes `elc` fail a `npm run build`, a pre-commit hook, or a CI step the same way a linter would.

## Setup wizard

```bash
npx elc init
```

Walks you through a few questions and writes an `env-lib-check.config.json` file at the root of your project:

```json
{
  "path": ".",
  "envPath": ".env",
  "runOnStart": false,
  "createDotEnv": false,
  "setVariablesNotFound": false
}
```

- **`path`** — project folder to scan for `process.env` usage.
- **`envPath`** — path to your `.env` file, relative to `path`.
- **`runOnStart`** — if `true`, adds `elc &&` in front of your `start` script in `package.json`, so a missing env var is caught before your app boots.
- **`createDotEnv`** — if `true` and no `.env` file exists yet, `elc` creates one and pre-fills it with the env vars expected by the libraries already installed in your `package.json` (see below).
- **`setVariablesNotFound`** — if `true`, appends any variable used in your code but missing from `.env` to the file, using a known default when one is available.

## How it works

1. Reads your `.env` file and extracts every declared key.
2. Walks your project's `.ts`/`.tsx`/`.js`/`.jsx` files (skipping `node_modules`) and extracts every `process.env.*` reference using a real AST parser (`ts-morph`), not regex — so it's accurate even with dynamic-looking code.
3. Cross-references the two lists and reports the result.
4. Optionally (via config), cross-references the libraries listed in your `package.json` dependencies against a curated map of popular libraries (Stripe, Prisma, AWS SDK, Supabase, Sentry, and dozens more) to suggest or pre-fill the env vars they typically expect — even before your own code references them via `process.env`.

## Status

This project is under active development. Planned for upcoming versions: `--json` output for CI pipelines and a wider library map.

## License

ISC
