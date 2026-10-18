// A legacy commit status in the statusCheckRollup union (e.g. CodeRabbit).
export interface StatusContext {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- GraphQL fixed field name
  __typename: 'StatusContext';
  context: string;
  // PENDING | SUCCESS | FAILURE | ERROR
  state: string;
}
