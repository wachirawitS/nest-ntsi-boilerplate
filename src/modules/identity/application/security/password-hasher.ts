export abstract class PasswordHasher {
  abstract hash(value: string): Promise<string>;
  abstract verify(hash: string, value: string): Promise<boolean>;
}
