import type { CheckRun } from './check-run';
import type { StatusContext } from './status-context';

// The statusCheckRollup array is a GraphQL union: each entry is either an Actions
// job (CheckRun) or a legacy commit status (StatusContext). They carry different
// fields — discriminate on __typename before reading them.
export type CheckRollup = CheckRun | StatusContext;
