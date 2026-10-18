export const logger = {
  log: function logMessage(message: string): void {
    process.stdout.write(`${message}\n`);
  },
  error: function errorMessage(message: string): void {
    process.stderr.write(`${message}\n`);
  },
};
