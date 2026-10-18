# dependabot-updates

Polls a GitHub repo's open PRs and auto-merges the clean ones via the `gh` CLI. Replaces the n8n workflow exported in [`DependaBot.json`](./DependaBot.json).

## Prerequisites

- Node.js ^24, pnpm (workspace root)
- `gh` CLI authenticated with a token that has `repo` scope:

  ```bash
  gh auth status   # must show "Logged in" with 'repo' scope
  ```

No `GITHUB_TOKEN` env var is needed — the app shells out to `gh`, which uses its own stored login.

## Run

The owner is hardcoded to `DaveMBush`; pass only the bare repo name:

```bash
npx tsx apps/dependabot-updates/src/main.ts <repo>
# e.g. npx tsx apps/dependabot-updates/src/main.ts dms-workspace
```

Polls every 60 seconds. Merges each qualifying PR as it appears, and exits on its own once no open PR is both dependabot-authored and passes the merge rules (e.g. all merged, or only non-qualifying PRs remain). A failed poll is logged and retried — it does not stop the loop.

### Build (alternative)

```bash
npx nx run dependabot-updates:build
node apps/dependabot-updates/dist/main.js <repo>
```

## Merge rules

A PR is merged only if **all** of these hold (mirrors the n8n "Filter (normal)" node):

1. Not a draft
2. No merge conflicts (`mergeable` != `CONFLICTING`)
3. Authored by `dependabot[bot]`
4. Title does not contain `@angular` or `nx`
5. At least one status check exists, all are completed, and none failed (SUCCESS/NEUTRAL conclusions pass)

Merges use squash (`gh pr merge --squash`).

Note: the n8n workflow's "@angular" branch is a dead end (feeds a Split In Batches node with no outgoing connections), so `@angular` PRs are simply skipped here. If you change the filters in `DependaBot.json`, keep [`src/merge-logic.ts`](./src/merge-logic.ts) in sync.

## Tests

```bash
npx vitest run apps/dependabot-updates
```
