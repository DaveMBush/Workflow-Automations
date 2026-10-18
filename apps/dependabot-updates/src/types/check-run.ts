// An Actions job in the statusCheckRollup union.
export interface CheckRun {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- GraphQL fixed field name
  __typename: 'CheckRun';
  name: string;
  // QUEUED | IN_PROGRESS | COMPLETED
  status: string;
  // SUCCESS | FAILURE | NEUTRAL | ... ; null while not completed
  conclusion: string | null;
}
