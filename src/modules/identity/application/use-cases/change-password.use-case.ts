import { Injectable } from '@nestjs/common';
import { EventBus } from '../../../../shared/events';
import { AuthTokensDto } from '../dtos/auth-tokens.dto';
import { toPrincipalDto } from '../dtos/principal.dto';
import { PasswordHasher } from '../security/password-hasher';
import { RefreshTokenService } from '../security/refresh-token.service';
import { TokenIssuer } from '../security/token-issuer';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { SessionRevokedEvent } from '../../domain/events/session-revoked.event';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly refreshTokens: RefreshTokenService,
    private readonly tokenIssuer: TokenIssuer,
    private readonly transaction: IdentityTransaction,
    private readonly events: EventBus,
  ) {}

  async execute(input: {
    userId: string;
    sessionId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthTokensDto> {
    const [user, credential] = await Promise.all([
      this.users.findById(input.userId),
      this.access.findCredentialByUserId(input.userId),
    ]);

    if (
      !user ||
      !credential ||
      !(await this.passwordHasher.verify(
        credential.passwordHash,
        input.currentPassword,
      ))
    ) {
      throw new InvalidCredentialsError();
    }

    const generatedRefreshToken = this.refreshTokens.generate(input.sessionId);
    await this.transaction.run(async () => {
      await this.access.updateCredentialPassword(
        input.userId,
        await this.passwordHasher.hash(input.newPassword),
      );
      await this.access.revokeUserSessions(
        input.userId,
        'password_changed',
        input.sessionId,
      );
      await this.access.updateSessionRefreshSecret(
        input.sessionId,
        await this.passwordHasher.hash(generatedRefreshToken.secret),
      );
    });

    const [issuedAccessToken, principalAccess] = await Promise.all([
      this.tokenIssuer.issueAccessToken({
        userId: user.id,
        sessionId: input.sessionId,
        email: user.email,
      }),
      this.access.getPrincipalAccess(user.id),
    ]);

    this.events.publish(
      new SessionRevokedEvent({
        userId: user.id,
        sessionId: null,
        reason: 'password_changed',
      }),
    );

    return {
      ...issuedAccessToken,
      refreshToken: generatedRefreshToken.token,
      principal: toPrincipalDto({
        user,
        roleKeys: principalAccess.roleKeys,
        permissionKeys: principalAccess.permissionKeys,
      }),
    };
  }
}
