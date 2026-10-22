import type { ParsedArgs } from './types/parsed-args';

// Parses dms-validation CLI arguments: `dms-validation <repoPath> [--steps <json>] [--ai-review]
// [--log-level <level>]`. Unknown flags, extra positionals, and missing option values throw so a
// misconfigured gate fails loudly instead of silently running the wrong set of steps.
export function parseArgs(argv: string[]): ParsedArgs {
  let repoPath = '';
  let stepsRaw = '';
  let aiReviewEnabled = false;
  let logLevel = 'info';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--steps') {
      stepsRaw = nextValue(argv, i, '--steps');
      i++;
    } else if (arg === '--log-level') {
      logLevel = nextValue(argv, i, '--log-level');
      i++;
    } else if (arg === '--ai-review') {
      aiReviewEnabled = true;
    } else if (repoPath === '') {
      repoPath = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (repoPath === '') {
    throw new Error('Usage: dms-validation <repoPath> [--steps <json>] [--ai-review] [--log-level <level>]');
  }

  return { repoPath, stepsRaw, aiReviewEnabled, logLevel };
}

function nextValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}
