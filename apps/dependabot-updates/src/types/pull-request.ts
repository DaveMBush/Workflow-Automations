import type { CheckRollup } from './check-rollup';

export interface PullRequest {
  number: number;
  title: string;
  isDraft: boolean;
  mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
  author: { login: string };
  statusCheckRollup: CheckRollup[];
}
