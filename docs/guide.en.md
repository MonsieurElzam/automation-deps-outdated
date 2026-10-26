## What it's for

`npm outdated` lists outdated dependencies but with no hierarchy: a patch and a major version jump look alike. This script sorts by severity (majors first) and produces a readable table, handy for deciding what to update this week.

## Before you start

- Node.js and npm, and a project with a `package.json` (dependencies installed).

## Step by step

1. Run the analysis directly in the project folder:
   ```bash
   node src/deps-outdated.mjs --run
   ```
   or work from a saved output: `npm outdated --json > outdated.json`, then `node src/deps-outdated.mjs outdated.json`.
2. Start with the **major** gaps: they can break your code, so read the release notes.
3. Then handle minors and patches, often safe, in batches.

## Reading the output

Each row shows the installed version, the "wanted" version (allowed by your `package.json`) and the latest published one. The gap is classified `major`, `minor` or `patch`.

## Automating it

With `--max-major 0`, the exit code is 2 as soon as a major gap exists: a weekly CI job can alert the team.

```yaml
- run: node src/deps-outdated.mjs --run --max-major 3
```

## Pitfalls

- A major gap is not necessarily urgent; a security flaw is: also use `npm audit`.
- The script changes nothing in your project.
