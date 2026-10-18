// The resolved gate configuration, read from env by loadConfig. repoPath is the checkout to
// validate (required); aiReviewEnabled toggles the advisory AI-review step.
export interface DmsValidationConfig {
  repoPath: string;
  aiReviewEnabled: boolean;
}
