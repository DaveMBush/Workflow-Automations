export async function sleep(ms: number): Promise<void> {
  await new Promise(function resolveAfterDelay(resolve) {
    setTimeout(resolve, ms);
  });
}
