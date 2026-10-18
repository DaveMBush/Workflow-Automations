import type { ValidationStep } from './types/validation-step';

// eslint-disable-next-line @typescript-eslint/naming-convention -- spec imports this exact name; renaming would require editing the test, which is out of scope.
export const DEFAULT_STEPS: ValidationStep[] = [
  { name: 'format', command: 'pnpm format:check' },
  { name: 'typecheck', command: 'pnpm nx run dms-workspace:typecheck' },
  { name: 'lint', command: 'pnpm nx run dms-workspace:lint' },
  { name: 'test', command: 'pnpm nx run dms-workspace:test' },
  { name: 'dupcheck', command: 'pnpm dupcheck' },
];
