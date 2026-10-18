import { loadConfig } from './config';
import { logger } from './logger';
import { runLoop } from './loop';

async function main(): Promise<void> {
  const config = loadConfig();
  logger.log(`Watching ${config.repo} every ${config.pollIntervalMs / 1000}s`);
  await runLoop(config, logMessage);
}

function logMessage(message: string): void {
  logger.log(message);
}

main().catch(handleStartupError);

function handleStartupError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message);
  process.exitCode = 1;
}
