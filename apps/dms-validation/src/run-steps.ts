import { spawn } from 'node:child_process';
import type { Logger } from './types/logger';
import type { StepResult } from './types/step-result';
import type { ValidationStep } from './types/validation-step';

const tailChars = 4000;

// Runs one gate step in the dms-workspace checkout. Uses `bash -c` so pnpm/nx resolve from PATH
// exactly as they would in a shell. Output is streamed to the logger and bounded for the tail.
async function runStep(step: ValidationStep, repoPath: string, logger: Logger): Promise<StepResult> {
  const result = await new Promise(function createRunStepPromise(resolve: (value: StepResult) => void): void {
    const startedAt = Date.now();
    let out = '';

    function append(chunk: Buffer): void {
      const text = chunk.toString();
      out += text;
      if (out.length > tailChars * 2) {
        out = out.slice(-tailChars);
      }
      logger.debug(text.trimEnd());
    }

    function finish(ok: boolean, exitCode: number | null, tail: string): void {
      const durationMs = Date.now() - startedAt;
      logger.info(`[step ${step.name}] exited with code ${exitCode} in ${durationMs}ms`);
      resolve({ name: step.name, command: step.command, ok, exitCode, durationMs, tail });
    }

    logger.info(`[step ${step.name}] $ ${step.command}`);
    // Absolute path so the shell binary is not resolved via PATH (sonarjs/no-os-command-from-path).
    const child = spawn('/bin/bash', ['-c', step.command], { cwd: repoPath });
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('error', function onSpawnError(err: Error): void {
      finish(false, null, `spawn error: ${err.message}`);
    });
    child.on('close', function onClose(code: number | null): void {
      finish(code === 0, code, out.slice(-tailChars));
    });
  });
  return result;
}

// Runs steps sequentially and stops at the first failure — later gates are pointless once an
// earlier one fails. Returns every result so far for the summary.
export async function runSteps(steps: ValidationStep[], repoPath: string, logger: Logger): Promise<{ allOk: boolean; results: StepResult[] }> {
  const results: StepResult[] = [];
  for (const step of steps) {
    const result = await runStep(step, repoPath, logger);
    results.push(result);
    if (!result.ok) {
      break;
    }
  }
  const allOk = results.every(function isOk(r: StepResult): boolean {
    return r.ok;
  });
  return { allOk, results };
}
