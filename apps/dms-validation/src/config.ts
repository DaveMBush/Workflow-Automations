import { existsSync } from 'node:fs';
import type { DmsValidationConfig } from './types/config';

// Reads the gate configuration from env. The repo path is required — without it there is nothing to
// validate, so we fail fast with a clear message rather than guessing a location.
export function loadConfig(env: NodeJS.ProcessEnv): DmsValidationConfig {
  const repoPath = (env.DMS_REPO_PATH ?? '').trim();
  if (!repoPath) {
    throw new Error('DMS_REPO_PATH is required');
  }
  if (!existsSync(repoPath)) {
    throw new Error(`DMS_REPO_PATH does not exist: ${repoPath}`);
  }

  const aiReviewEnabled = (env.DMS_AI_REVIEW ?? '').trim().toLowerCase() === 'true';
  return { repoPath, aiReviewEnabled };
}
