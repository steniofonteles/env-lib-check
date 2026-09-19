# env-lib-check

CLI that scans your codebase for `process.env` usage and warns about missing or empty environment variables before they become a production bug.

It parses your source code's AST (not regex) to find every `process.env.X` and `process.env["X"]` reference, checks each one against your `.env` file, and reports what's missing, what's declared but empty, and what's correctly set.

It can also scan your Git history to detect whether `.env` or related environment files were committed in the past.

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

```text
API_KEY CORRECT ✅

SECRET NOT FOUND IN .ENV ❌

DATABASE_URL SET BUT BLANK ❌

1 passed, 1 warnings, 1 errors
```

* **`CORRECT`** — the variable is used in your code and has a value in `.env`.
* **`NOT FOUND IN .ENV`** — the variable is used in your code but doesn't exist in `.env` at all.
* **`SET BUT BLANK`** — the variable exists in `.env`, but its value is empty.

## Exit codes

| Code | Meaning                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------- |
| `0`  | No missing variables or detected errors.                                                                               |
| `1`  | At least one variable is missing, or `elc` couldn't run because there is no `.env` and no `env-lib-check.config.json`. |

This makes `elc` suitable for `npm run build`, pre-commit hooks, and CI pipelines, just like a linter.

## Setup wizard

```bash
npx elc init
```

The setup wizard asks a few questions and creates an `env-lib-check.config.json` file at the root of your project:

```json
{
  "path": ".",
  "envPath": ".env",
  "runOnStart": false,
  "createDotEnv": false,
  "setVariablesNotFound": false,
  "LeakDetection": false
}
```

### Configuration

* **`path`** — project folder to scan for `process.env` usage.
* **`envPath`** — path to your `.env` file, relative to `path`.
* **`runOnStart`** — if `true`, adds `elc &&` in front of your `start` script in `package.json`, so missing environment variables are detected before your application starts.
* **`createDotEnv`** — if `true` and no `.env` file exists, `elc` creates one and pre-fills it with environment variables expected by libraries installed in your `package.json`.
* **`setVariablesNotFound`** — if `true`, appends variables used in your code but missing from `.env`, using a known default when one is available.
* **`LeakDetection`** — if `true`, scans the project's Git history to detect whether `.env` or related environment files were ever committed.

## How it works

1. Reads your `.env` file and extracts every declared key.
2. Walks your project's `.ts`, `.tsx`, `.js`, and `.jsx` files, skipping `node_modules`.
3. Uses a real AST parser (`ts-morph`) instead of regex to find `process.env.X` and `process.env["X"]` references.
4. Cross-references environment variables used in the code against variables declared in `.env`.
5. Reports missing, empty, and correctly configured variables.
6. Optionally scans Git history for previously committed `.env` files.
7. Optionally analyzes dependencies listed in `package.json` against a curated map of popular libraries such as Stripe, Prisma, AWS SDK, Supabase, Sentry, and others to suggest environment variables they typically require.

## Git Leak Detection

When `LeakDetection` is enabled, `elc` scans the project's Git history to identify commits where environment files may have been committed.

This can detect cases where a file such as `.env` was committed and later deleted.

Example:

```text
commit A → .env committed
commit B → .env deleted
```

Even though `.env` no longer exists in the current working tree, the file may still exist in the repository's Git history.

> **Important:** detecting a committed `.env` file does not automatically mean that a secret was exposed. The repository history should be reviewed and any exposed credentials should be rotated when necessary.

## Status

This project is under active development.

Planned features include:

* `--json` output for CI pipelines
* Expanded library/environment-variable detection
* More Git secret detection patterns
* Additional configuration options

## License

ISC

## Keywords

`.env`, `env`, `environment-variable`, `environment-variables`, `dotenv`, `env-validator`, `env-checker`, `env-security`, `secret-scanner`, `secret-detection`, `git-secrets`, `git-security`, `credentials`, `api-key`, `process.env`
