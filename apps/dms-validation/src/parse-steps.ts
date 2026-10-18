import { DEFAULT_STEPS } from './steps';
import type { ValidationStep } from './types/validation-step';

// Parses a JSON array of steps from env. Empty input falls back to the defaults so an unset
// DMS_VALIDATION_STEPS degrades gracefully; invalid input (bad JSON, non-array, empty array, or an
// entry missing a command) throws so a misconfigured gate fails loudly instead of silently running
// the wrong set of steps.
export function parseSteps(raw: string | undefined): ValidationStep[] {
  if (!raw || raw.trim() === '') {
    return DEFAULT_STEPS;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`DMS_VALIDATION_STEPS is not valid JSON: ${String(err)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('DMS_VALIDATION_STEPS must be a JSON array of steps');
  }
  if (parsed.length === 0) {
    throw new Error('DMS_VALIDATION_STEPS must contain at least one step');
  }

  return parsed.map(function toStep(entry: unknown, index: number): ValidationStep {
    const step = entry as Partial<ValidationStep>;
    const name = typeof step.name === 'string' && step.name.trim() !== '' ? step.name : `step-${index + 1}`;
    if (typeof step.command !== 'string' || step.command.trim() === '') {
      throw new Error(`DMS_VALIDATION_STEPS entry ${String(index + 1)} is missing a command`);
    }
    return { name, command: step.command };
  });
}
