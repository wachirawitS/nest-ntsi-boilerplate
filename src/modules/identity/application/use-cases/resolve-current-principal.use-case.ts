import { Injectable } from '@nestjs/common';
import { CurrentPrincipalContext } from '../../../../shared/api';
import { ApplicationError, ErrorCode } from '../../../../shared/api';
import { SessionExpiredError } from '../../domain/errors/session-expired.error';
import { SessionRevokedError } from '../../domain/errors/session-revoked.error';
import { UserInactiveError } from '../../domain/errors/user-inactive.error';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface ResolveCurrentPrincipalInput {
  userId: string;
  sessionId: string;
}

@Injectable()
export class ResolveCurrentPrincipalUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
  ) {}

  async execute(
    input: ResolveCurrentPrincipalInput,
  ): Promise<CurrentPrincipalContext> {
    const [user, session, access] = await Promise.all([
      this.users.findById(input.userId),
      this.access.findSessionById(input.sessionId),
      this.access.getPrincipalAccess(input.userId),
    ]);

    if (!user || !session || session.userId !== input.userId) {
      throw new ApplicationError({
        code: ErrorCode.Unauthenticated,
        message: 'Authentication required',
      });
    }

    if (!user.isActive) {
      throw new UserInactiveError(user.id);
    }

    if (session.isRevoked) {
      throw new SessionRevokedError();
    }

    if (session.isExpired) {
      throw new SessionExpiredError();
    }

    return {
      userId: user.id,
      sessionId: session.id,
      email: user.email,
      roleKeys: access.roleKeys,
      permissions: access.permissionKeys,
    };
  }
}
