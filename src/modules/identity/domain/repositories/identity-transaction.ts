export abstract class IdentityTransaction {
  abstract run<T>(work: () => Promise<T>): Promise<T>;
}
