import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import type { PullRequest } from './types/pull-request';

const runCommand = promisify(execFile);

export class GitHubClient {
  constructor(private readonly repo: string) {}

  async listPullRequests(): Promise<PullRequest[]> {
    const out = await this.gh([
      'pr',
      'list',
      '-R',
      this.repo,
      '--state',
      'open',
      '--json',
      'number,title,isDraft,mergeable,author,statusCheckRollup',
    ]);
    return JSON.parse(out) as PullRequest[];
  }

  async mergePullRequest(prNumber: number): Promise<void> {
    await this.gh(['pr', 'merge', String(prNumber), '-R', this.repo, '--squash', '--admin']);
  }

  private async gh(args: string[]): Promise<string> {
    const { stdout } = await runCommand('gh', args);
    return stdout;
  }
}
