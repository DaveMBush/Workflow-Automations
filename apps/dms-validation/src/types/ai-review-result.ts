export interface AiReviewResult {
  enabled: boolean;
  ok: boolean;
  exitCode: number | null;
  tail: string;
}
