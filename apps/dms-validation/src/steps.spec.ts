import { describe, expect, it } from 'vitest';

import { parseSteps } from './parse-steps';
import { DEFAULT_STEPS } from './steps';

describe('DEFAULT_STEPS', () => {
  it('runs the full dms-workspace gate (format, typecheck, lint, test, dupcheck)', () => {
    expect(DEFAULT_STEPS.map((s) => s.command)).toEqual([
      'pnpm format:check',
      'pnpm nx run dms-workspace:typecheck',
      'pnpm nx run dms-workspace:lint',
      'pnpm nx run dms-workspace:test',
      'pnpm dupcheck',
    ]);
  });
});

describe('parseSteps', () => {
  it('returns the defaults when no override is set', () => {
    expect(parseSteps(undefined)).toEqual(DEFAULT_STEPS);
    expect(parseSteps('')).toEqual(DEFAULT_STEPS);
    expect(parseSteps('   ')).toEqual(DEFAULT_STEPS);
  });

  it('parses a valid JSON array of {name,command}', () => {
    const raw = JSON.stringify([
      { name: 'format', command: 'pnpm format:check' },
      { name: 'e2e', command: 'pnpm nx run-many -t e2e' },
    ]);
    expect(parseSteps(raw)).toEqual([
      { name: 'format', command: 'pnpm format:check' },
      { name: 'e2e', command: 'pnpm nx run-many -t e2e' },
    ]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseSteps('{not json')).toThrow(/DMS_VALIDATION_STEPS/);
  });

  it('throws when the value is not an array of steps', () => {
    expect(() => parseSteps(JSON.stringify({ name: 'x' }))).toThrow(/DMS_VALIDATION_STEPS/);
    expect(() => parseSteps(JSON.stringify([]))).toThrow(/DMS_VALIDATION_STEPS/);
    expect(() => parseSteps(JSON.stringify([{ name: 'x' }]))).toThrow(/DMS_VALIDATION_STEPS/); // missing command
  });
});
