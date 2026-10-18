import { GitHubClient } from './client';
import type { Config } from './types/config';
import type { PullRequest } from './types/pull-request';
import { shouldMerge } from './merge-logic';
import { sleep } from './sleep';

interface ClientLike {
  listPullRequests(): Promise<PullRequest[]>;
  mergePullRequest(prNumber: number): Promise<void>;
}

export async function runLoop(
  config: Config,
  log: (message: string) => void,
  client?: ClientLike,
): Promise<void> {
  const github = client ?? new GitHubClient(config.repo);

  for (;;) {
    const outcome = await pollSafely(github, config, log);
    if (outcome === 'no-qualifying') {
      break;
    }
    await sleep(config.pollIntervalMs);
  }
}

async function pollSafely(
  client: ClientLike,
  config: Config,
  log: (message: string) => void,
): Promise<'no-qualifying' | 'retry'> {
  try {
    return (await pollOnce(client, config, log)) ? 'retry' : 'no-qualifying';
  } catch (error) {
    // A failed poll is transient — keep polling rather than stopping.
    log(`Poll failed: ${error instanceof Error ? error.message : String(error)}`);
    return 'retry';
  }
}

async function pollOnce(
  client: ClientLike,
  config: Config,
  log: (message: string) => void,
): Promise<boolean> {
  let mergedAny = false;

  for (;;) {
    // Re-fetch every iteration: a merge moves main and invalidates the state of any
    // PRs still open (dependabot rebases them), so each decision must use fresh data.
    const pullRequests = await client.listPullRequests();
    const target = findQualifying(pullRequests);

    if (!target) {
      // Nothing is safe to merge right now. If we merged anything this pass, other PRs
      // may still be settling (e.g. rebasing), so keep polling; otherwise we're idle.
      return mergedAny;
    }

    try {
      await client.mergePullRequest(target.number);
      log(`Merged #${target.number}: ${target.title}`);
      await sleep(config.pollIntervalMs); // Small delay to allow the repository state to settle after a merge
      mergedAny = true;
    } catch (error) {
      // A failing merge leaves qualifying work outstanding — keep polling rather than stop.
      log(
        `Failed to merge #${target.number} in ${config.repo}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return true;
    }
  }
}

function findQualifying(pullRequests: readonly PullRequest[]): PullRequest | undefined {
  for (const pr of pullRequests) {
    if (shouldMerge(pr)) {
      return pr;
    }
  }
  return undefined;
}
