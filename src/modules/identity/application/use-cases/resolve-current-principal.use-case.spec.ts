import { UserEntity } from '../../domain/entities/user.entity';
import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionRevokedError } from '../../domain/errors/session-revoked.error';
import { UserInactiveError } from '../../domain/errors/user-inactive.error';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ResolveCurrentPrincipalUseCase } from './resolve-current-principal.use-case';

describe('ResolveCurrentPrincipalUseCase', () => {
  it('resolves a principal from active user, active session, roles, and permissions', async () => {
    const user = makeUser({ isActive: true });
    const session = makeSession({ revokedAt: null, expiresAt: tomorrow() });
    const useCase = new ResolveCurrentPrincipalUseCase(
      userRepository(user),
      accessRepository(session, ['admin'], ['users:read']),
    );

    await expect(
      useCase.execute({ userId: user.id, sessionId: session.id }),
    ).resolves.toEqual({
      userId: user.id,
      sessionId: session.id,
      email: user.email,
      roleKeys: ['admin'],
      permissions: ['users:read'],
    });
  });

  it('rejects inactive users', async () => {
    const user = makeUser({ isActive: false });
    const session = makeSession({ revokedAt: null, expiresAt: tomorrow() });
    const useCase = new ResolveCurrentPrincipalUseCase(
      userRepository(user),
      accessRepository(session, [], []),
    );

    await expect(
      useCase.execute({ userId: user.id, sessionId: session.id }),
    ).rejects.toThrow(UserInactiveError);
  });

  it('rejects revoked sessions', async () => {
    const user = makeUser({ isActive: true });
    const session = makeSession({
      revokedAt: new Date(),
      expiresAt: tomorrow(),
    });
    const useCase = new ResolveCurrentPrincipalUseCase(
      userRepository(user),
      accessRepository(session, [], []),
    );

    await expect(
      useCase.execute({ userId: user.id, sessionId: session.id }),
    ).rejects.toThrow(SessionRevokedError);
  });
});

function makeUser(input: { isActive: boolean }): UserEntity {
  const user = new UserEntity();
  user.id = 'user-id';
  user.email = 'user@example.com';
  user.firstName = 'Test';
  user.lastName = 'User';
  user.isActive = input.isActive;
  user.createdAt = new Date();
  user.updatedAt = new Date();

  return user;
}

function makeSession(input: {
  revokedAt: Date | null;
  expiresAt: Date;
}): SessionEntity {
  const session = new SessionEntity();
  session.id = 'session-id';
  session.userId = 'user-id';
  session.refreshTokenSecretHash = 'hash';
  session.expiresAt = input.expiresAt;
  session.lastUsedAt = null;
  session.revokedAt = input.revokedAt;
  session.revokedReason = null;
  session.ipAddress = null;
  session.userAgent = null;
  session.createdAt = new Date();
  session.updatedAt = new Date();

  return session;
}

function tomorrow(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

function userRepository(user: UserEntity): UserRepository {
  return {
    findById: jest.fn(() => Promise.resolve(user)),
  } as unknown as UserRepository;
}

function accessRepository(
  session: SessionEntity,
  roleKeys: string[],
  permissionKeys: string[],
): IdentityAccessRepository {
  return {
    findSessionById: jest.fn(() => Promise.resolve(session)),
    getPrincipalAccess: jest.fn(() =>
      Promise.resolve({
        roleKeys,
        permissionKeys,
      }),
    ),
  } as unknown as IdentityAccessRepository;
}
