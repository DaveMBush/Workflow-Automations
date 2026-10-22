// Parsed command-line arguments for dms-validation: `dms-validation <repoPath> [--steps <json>]
// [--ai-review] [--log-level <level>]`. stepsRaw is the raw --steps value (empty when omitted, in
// which case parseSteps falls back to DEFAULT_STEPS).
export interface ParsedArgs {
  repoPath: string;
  stepsRaw: string;
  aiReviewEnabled: boolean;
  logLevel: string;
}
