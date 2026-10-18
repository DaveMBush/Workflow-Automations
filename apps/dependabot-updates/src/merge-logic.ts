import type { CheckRollup } from './types/check-rollup';
import type { PullRequest } from './types/pull-request';

const excludedTitleFragments = ['@angular', 'nx'];

export function shouldMerge(pr: PullRequest): boolean {
  if (pr.isDraft) {
    return false;
  }
  if (pr.mergeable === 'CONFLICTING') {
    return false;
  }
  // Mirror the n8n "Filter (normal)" node: only dependabot PRs, excluding @angular and nx.
  if (pr.author.login !== 'app/dependabot') {
    return false;
  }
  if (isExcludedTitle(pr.title)) {
    return false;
  }

  const checks = pr.statusCheckRollup;
  // Require at least one check so a PR with no CI is never auto-merged.
  if (checks.length === 0) {
    return false;
  }
  if (!checks.every(isCompleted)) {
    return false;
  }
  return checks.every(isPassing);
}

// The rollup mixes two shapes (see types/check-rollup.ts). A StatusContext has no
// `status`/`conclusion`, so each predicate must branch on __typename.
function isCompleted(check: CheckRollup): boolean {
  // eslint-disable-next-line no-underscore-dangle -- GraphQL fixed field name
  if (check.__typename === 'CheckRun') {
    return check.status === 'COMPLETED';
  }
  // A StatusContext is done once it leaves PENDING/ERROR (SUCCESS or FAILURE).
  return check.state !== 'PENDING' && check.state !== 'ERROR';
}

function isPassing(check: CheckRollup): boolean {
  // eslint-disable-next-line no-underscore-dangle -- GraphQL fixed field name
  if (check.__typename === 'CheckRun') {
    return check.conclusion === 'SUCCESS' || check.conclusion === 'NEUTRAL';
  }
  return check.state === 'SUCCESS';
}

function isExcludedTitle(title: string): boolean {
  for (const fragment of excludedTitleFragments) {
    if (title.includes(fragment)) {
      return true;
    }
  }
  return false;
}
