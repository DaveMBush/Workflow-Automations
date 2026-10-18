import type { Config } from './types/config';

const owner = 'DaveMBush';
const defaultPollIntervalMs = 300_000;

export function loadConfig(): Config {
  const repoName = parseRepoName(process.argv[2]);
  return {
    repo: `${owner}/${repoName}`,
    pollIntervalMs: defaultPollIntervalMs,
  };
}

function parseRepoName(value: string | undefined): string {
  if (!value) {
    throw new Error(`Usage: dependabot-updates <repo> (runs against ${owner})`);
  }
  const match = /^[\w.-]+$/.exec(value);
  if (match === null) {
    throw new Error(`Invalid repo "${value}". Expected a bare repo name.`);
  }
  return value;
}
