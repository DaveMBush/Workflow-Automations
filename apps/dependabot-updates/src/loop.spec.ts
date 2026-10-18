import { describe, expect, it, vi } from 'vitest';

import type { Config } from './types/config';
import type { PullRequest } from './types/pull-request';
import { runLoop } from './loop';

vi.mock('./sleep', () => ({
  sleep: vi.fn(async (): Promise<void> => {
    await Promise.resolve();
  }),
}));

const config: Config = { repo: 'DaveMBush/test-repo', pollIntervalMs: 1 };

function pr(overrides: Partial<PullRequest> = {}): PullRequest {
  return {
    number: 1,
    title: 'bump x',
    isDraft: false,
    mergeable: 'MERGEABLE',
    author: { login: 'app/dependabot' },
    statusCheckRollup: [
      { __typename: 'CheckRun', name: 'ci', status: 'COMPLETED', conclusion: 'SUCCESS' },
    ],
    ...overrides,
  };
}

interface FakeClient {
  listPullRequests(): Promise<PullRequest[]>;
  mergePullRequest(prNumber: number): Promise<void>;
}

function fakeClient(responses: PullRequest[][]): FakeClient {
  let call = 0;
  return {
    listPullRequests: vi.fn(async (): Promise<PullRequest[]> => {
      const current = responses[Math.min(call, responses.length - 1)];
      call += 1;
      await Promise.resolve();
      return current;
    }),
    mergePullRequest: vi.fn(async (): Promise<void> => {
      await Promise.resolve();
    }),
  };
}

describe('runLoop', () => {
  it('stops immediately when no PRs are open', async () => {
    const client = fakeClient([[]]);
    await runLoop(config, vi.fn(), client);
    expect(client.listPullRequests).toHaveBeenCalledTimes(1);
    expect(client.mergePullRequest).not.toHaveBeenCalled();
  });

  it('stops when no qualifying PRs remain', async () => {
    const client = fakeClient([[pr()], []]);
    await runLoop(config, vi.fn(), client);
    expect(client.mergePullRequest).toHaveBeenCalledWith(1);
    // One fetch finds the PR, a re-fetch after merging confirms it's gone, then a final
    // idle poll stops the loop.
    expect(client.listPullRequests).toHaveBeenCalledTimes(3);
  });

  it('does not act on a stale snapshot taken before a merge', async () => {
    const first = pr({ number: 1 });
    const second = pr({ number: 2 });
    // The initial fetch lists two qualifying PRs, but after merging #1 the fresh fetch
    // shows only that it's gone — so #2 must NOT be merged from the stale list.
    const client = fakeClient([[first, second], []]);
    await runLoop(config, vi.fn(), client);
    expect(client.mergePullRequest).toHaveBeenCalledTimes(1);
    expect(client.mergePullRequest).toHaveBeenCalledWith(1);
  });

  it('keeps polling while a qualifying PR is still open', async () => {
    const client = fakeClient([[pr()], [pr()], []]);
    await runLoop(config, vi.fn(), client);
    expect(client.mergePullRequest).toHaveBeenCalledTimes(2);
  });

  it('stops when only non-qualifying PRs are open', async () => {
    const client = fakeClient([[pr({ isDraft: true })]]);
    await runLoop(config, vi.fn(), client);
    expect(client.mergePullRequest).not.toHaveBeenCalled();
    expect(client.listPullRequests).toHaveBeenCalledTimes(1);
  });

  it('logs and continues when a poll fails', async () => {
    const list = vi.fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue([]);
    const client: FakeClient = {
      listPullRequests: list,
      mergePullRequest: vi.fn(async (): Promise<void> => {
        await Promise.resolve();
      }),
    };
    const log = vi.fn();
    await runLoop(config, log, client);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Poll failed'));
  });
});
