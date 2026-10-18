import { describe, expect, it } from 'vitest';

import type { CheckRun } from './types/check-run';
import type { StatusContext } from './types/status-context';
import type { PullRequest } from './types/pull-request';
import { shouldMerge } from './merge-logic';

function check(overrides: Partial<CheckRun> = {}): CheckRun {
  return { __typename: 'CheckRun', name: 'ci', status: 'COMPLETED', conclusion: 'SUCCESS', ...overrides };
}

function statusContext(overrides: Partial<StatusContext> = {}): StatusContext {
  return { __typename: 'StatusContext', context: 'CodeRabbit', state: 'SUCCESS', ...overrides };
}

function pr(overrides: Partial<PullRequest> = {}): PullRequest {
  return {
    number: 1,
    title: 'bump x',
    isDraft: false,
    mergeable: 'MERGEABLE',
    author: { login: 'app/dependabot' },
    statusCheckRollup: [check()],
    ...overrides,
  };
}

describe('shouldMerge', () => {
  it('merges a clean PR whose checks all pass', () => {
    expect(shouldMerge(pr())).toBe(true);
  });

  it('rejects draft PRs', () => {
    expect(shouldMerge(pr({ isDraft: true }))).toBe(false);
  });

  it('rejects PRs with merge conflicts', () => {
    expect(shouldMerge(pr({ mergeable: 'CONFLICTING' }))).toBe(false);
  });

  it('rejects PRs not authored by app/dependabot', () => {
    expect(shouldMerge(pr({ author: { login: 'DaveMBush' } }))).toBe(false);
  });

  it('merges a PR whose only check is a passing CodeRabbit StatusContext', () => {
    const rollup = [statusContext()];
    expect(shouldMerge(pr({ statusCheckRollup: rollup }))).toBe(true);
  });

  it('rejects when a StatusContext has failed', () => {
    const rollup = [check(), statusContext({ state: 'FAILURE' })];
    expect(shouldMerge(pr({ statusCheckRollup: rollup }))).toBe(false);
  });

  it('rejects while a StatusContext is still pending', () => {
    const rollup = [check(), statusContext({ state: 'PENDING' })];
    expect(shouldMerge(pr({ statusCheckRollup: rollup }))).toBe(false);
  });

  it('rejects PRs whose title contains @angular', () => {
    expect(shouldMerge(pr({ title: 'build(deps): bump @angular/core to 20.0.0' }))).toBe(false);
  });

  it('rejects PRs whose title contains nx', () => {
    expect(shouldMerge(pr({ title: 'chore(deps): bump nx from 19.0.0 to 20.0.0' }))).toBe(false);
  });

  it('rejects when any check fails', () => {
    const rollup = [check(), check({ name: 'lint', conclusion: 'FAILURE' })];
    expect(shouldMerge(pr({ statusCheckRollup: rollup }))).toBe(false);
  });

  it('rejects when a check is still pending (not completed)', () => {
    const rollup = [check(), check({ name: 'build', status: 'IN_PROGRESS' })];
    expect(shouldMerge(pr({ statusCheckRollup: rollup }))).toBe(false);
  });

  it('rejects when a completed check has no success conclusion', () => {
    const rollup = [check({ conclusion: null })];
    expect(shouldMerge(pr({ statusCheckRollup: rollup }))).toBe(false);
  });

  it('rejects PRs with no CI checks (no signal to trust)', () => {
    expect(shouldMerge(pr({ statusCheckRollup: [] }))).toBe(false);
  });

  it('treats a NEUTRAL conclusion as passing', () => {
    const rollup = [check(), check({ name: 'docs', conclusion: 'NEUTRAL' })];
    expect(shouldMerge(pr({ statusCheckRollup: rollup }))).toBe(true);
  });
});
