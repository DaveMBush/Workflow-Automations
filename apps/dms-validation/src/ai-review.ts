import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import type { AiReviewResult } from './types/ai-review-result';
import type { Logger } from './types/logger';

const runCommand = promisify(execFile);
const tailChars = 8000;

// Runs the optional AI review (default `qwen-am review`). Advisory only: a non-zero exit or a
// spawn error is reported but never fails the validation — it's an opinion for n8n to post, not
// a gate. The command is configurable via DMS_AI_REVIEW_COMMAND so its exact flags can change
// without code changes.
export async function runAiReview(repoPath: string, command: string, logger: Logger): Promise<AiReviewResult> {
  if (!command.trim()) {
    return { enabled: false, ok: true, exitCode: null, tail: '' };
  }

  const startedAt = Date.now();
  logger.info(`[ai-review] $ ${command}`);
  try {
    // Absolute path so the shell binary is not resolved via PATH (sonarjs/no-os-command-from-path).
    const { stdout, stderr } = await runCommand('/bin/bash', ['-c', command], { cwd: repoPath });
    logger.info(`[ai-review] exited with code 0 in ${Date.now() - startedAt}ms`);
    return { enabled: true, ok: true, exitCode: 0, tail: `${stdout}${stderr}`.slice(-tailChars) };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    logger.info(`[ai-review] exited with error in ${Date.now() - startedAt}ms`);
    return { enabled: true, ok: false, exitCode: typeof e.code === 'number' ? e.code : null, tail: `${e.stdout ?? ''}${e.stderr ?? ''}`.slice(-tailChars) };
  }
}
