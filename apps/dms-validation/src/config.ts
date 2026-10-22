import { existsSync } from 'node:fs';
import type { DmsValidationConfig } from './types/config';
import type { ParsedArgs } from './types/parsed-args';

// Builds the gate configuration from parsed CLI arguments. The repo path is required — without it
// there is nothing to validate, so we fail fast with a clear message rather than guessing a location.
export function loadConfig(args: ParsedArgs): DmsValidationConfig {
  const repoPath = args.repoPath.trim();
  if (!repoPath) {
    throw new Error('Usage: dms-validation <repoPath> [--steps <json>] [--ai-review] [--log-level <level>]');
  }
  if (!existsSync(repoPath)) {
    throw new Error(`Repo path does not exist: ${repoPath}`);
  }

  return { repoPath };
}
