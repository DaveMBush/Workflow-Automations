import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createLogger } from './logger';
import { runSteps } from './run-steps';
import type { ValidationStep } from './types/config';

const silent = createLogger('error'); // keep test output clean; assert on returned data.

function tempRepo(): string {
  return mkdtempSync(join(tmpdir(), 'dms-validation-'));
}

describe('runSteps', () => {
  it('runs all steps and reports ok when every step exits 0', async () => {
    const repo = tempRepo();
    try {
      const steps: ValidationStep[] = [
        { name: 'a', command: 'true' },
        { name: 'b', command: 'echo hello && true' },
      ];
      const { allOk, results } = await runSteps(steps, repo, silent);
      expect(allOk).toBe(true);
      expect(results.map((r) => r.name)).toEqual(['a', 'b']);
      expect(results.every((r) => r.ok && r.exitCode === 0)).toBe(true);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it('stops at the first failing step and does not run later steps', async () => {
    const repo = tempRepo();
    try {
      const steps: ValidationStep[] = [
        { name: 'pass', command: 'true' },
        { name: 'fail', command: 'false' },
        { name: 'never-runs', command: 'echo should-not-run' },
      ];
      const { allOk, results } = await runSteps(steps, repo, silent);
      expect(allOk).toBe(false);
      // Only the first two steps ran; the third was skipped.
      expect(results.map((r) => r.name)).toEqual(['pass', 'fail']);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it('captures the exit code and a bounded tail of output for a failing step', async () => {
    const repo = tempRepo();
    try {
      const steps: ValidationStep[] = [{ name: 'boom', command: 'echo "boom detail" >&2; exit 3' }];
      const { allOk, results } = await runSteps(steps, repo, silent);
      expect(allOk).toBe(false);
      expect(results[0].ok).toBe(false);
      expect(results[0].exitCode).toBe(3);
      expect(results[0].tail).toContain('boom detail');
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it('reports a spawn error as a failed step rather than throwing', async () => {
    const repo = tempRepo();
    try {
      // A command that cannot be spawned (nonexistent binary) still resolves with ok:false.
      const steps: ValidationStep[] = [{ name: 'missing', command: '/no/such/binary-xyz' }];
      const { allOk, results } = await runSteps(steps, repo, silent);
      expect(allOk).toBe(false);
      expect(results[0].ok).toBe(false);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});
