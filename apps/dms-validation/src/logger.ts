import type { Logger } from './types/logger';

const levelWeight = { debug: 0, info: 1, error: 2 } as const;

// Builds a level-filtered logger. Messages below the threshold are dropped so callers can run
// quietly (e.g. tests pass 'error' to suppress step chatter) without changing call sites.
export function createLogger(level: string = 'info'): Logger {
  const threshold = levelWeight[level as keyof typeof levelWeight] ?? levelWeight.info;

  return {
    debug: writeIf(levelWeight.debug, threshold, process.stdout),
    info: writeIf(levelWeight.info, threshold, process.stdout),
    error: writeIf(levelWeight.error, threshold, process.stderr),
  };
}

function writeIf(weight: number, threshold: number, stream: NodeJS.WriteStream): (message: string) => void {
  return function logMessage(message: string): void {
    if (weight >= threshold) {
      stream.write(`${message}\n`);
    }
  };
}
