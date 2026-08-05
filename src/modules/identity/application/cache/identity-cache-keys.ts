export class IdentityCacheKeys {
  static userById(userId: string): string {
    return `identity:user:${userId}`;
  }
}
