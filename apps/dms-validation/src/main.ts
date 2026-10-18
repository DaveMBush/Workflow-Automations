import { loadConfig } from './config';
import { createLogger } from './logger';
import { parseSteps } from './parse-steps';
import { runSteps } from './run-steps';
import type { DmsValidationConfig } from './types/config';
import type { StepResult } from './types/step-result';

const logger = createLogger(process.env.DMS_LOG_LEVEL ?? 'info');

// Prints the per-step summary and returns the process exit code: 0 when every gate passed, 1 otherwise.
function summarize(results: StepResult[], aiReviewEnabled: boolean): number {
  const failed = results.filter(function notOk(r: StepResult): boolean {
    return !r.ok;
  });
  if (failed.length === 0) {
    logger.info('DMS validation passed.');
    if (!aiReviewEnabled) {
      logger.info('AI review is disabled (set DMS_AI_REVIEW=true to enable it).');
    } else {
      logger.info('AI review enabled — see the AI-review step output above for findings.');
    }
    return 0;
  }

  logger.error(`DMS validation failed: ${failed.length} of ${results.length} step(s) did not pass.`);
  for (const r of failed) {
    logger.error(`- [${r.name}] exit code ${String(r.exitCode)} after ${r.durationMs}ms`);
    if (r.tail.trim() !== '') {
      logger.error(r.tail.trimEnd());
    }
  }
  return 1;
}

async function main(): Promise<void> {
  let config: DmsValidationConfig;
  try {
    config = loadConfig(process.env);
  } catch (err) {
    logger.error(`Configuration error: ${String(err)}`);
    process.exitCode = 1;
    return;
  }

  const steps = parseSteps(process.env.DMS_VALIDATION_STEPS);
  logger.info(`Validating dms-workspace at ${config.repoPath} (${steps.length} step(s))`);
  const { results } = await runSteps(steps, config.repoPath, logger);
  process.exitCode = summarize(results, config.aiReviewEnabled);
}

main().catch(function onFatal(err: unknown): void {
  logger.error(`dms-validation crashed: ${String(err)}`);
  process.exitCode = 1;
});
