import { describe, expect, it } from 'vitest';

import { parseArgs } from './parse-args';

describe('parseArgs', () => {
  it('parses the required repo path positional', () => {
    const args = parseArgs(['/path/to/dms-workspace']);
    expect(args.repoPath).toBe('/path/to/dms-workspace');
    expect(args.stepsRaw).toBe('');
    expect(args.aiReviewEnabled).toBe(false);
    expect(args.logLevel).toBe('info');
  });

  it('parses --steps with a JSON value', () => {
    const raw = '[{"name":"format","command":"pnpm format:check"}]';
    const args = parseArgs(['/repo', '--steps', raw]);
    expect(args.repoPath).toBe('/repo');
    expect(args.stepsRaw).toBe(raw);
  });

  it('parses --ai-review and --log-level flags', () => {
    const args = parseArgs(['/repo', '--ai-review', '--log-level', 'debug']);
    expect(args.aiReviewEnabled).toBe(true);
    expect(args.logLevel).toBe('debug');
  });

  it('throws when no repo path is given', () => {
    expect(() => parseArgs([])).toThrow(/Usage: dms-validation/);
  });

  it('throws on an unknown flag', () => {
    expect(() => parseArgs(['/repo', '--bogus'])).toThrow(/Unexpected argument: --bogus/);
  });

  it('throws on a second positional', () => {
    expect(() => parseArgs(['/repo', '/other'])).toThrow(/Unexpected argument: \/other/);
  });

  it('throws when --steps or --log-level is missing its value', () => {
    expect(() => parseArgs(['/repo', '--steps'])).toThrow(/--steps requires a value/);
    expect(() => parseArgs(['/repo', '--log-level'])).toThrow(/--log-level requires a value/);
  });

  it('treats a flag-like token after --steps as missing its value', () => {
    expect(() => parseArgs(['/repo', '--steps', '--ai-review'])).toThrow(/--steps requires a value/);
  });
});
