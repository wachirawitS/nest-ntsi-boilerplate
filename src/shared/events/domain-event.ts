export interface DomainEvent<TPayload extends object = object> {
  readonly name: string;
  readonly occurredAt: Date;
  readonly payload: TPayload;
}
