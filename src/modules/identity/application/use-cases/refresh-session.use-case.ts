import { Injectable } from '@nestjs/common';
import { EventBus } from '../../../../shared/events';
import { AuthTokensDto } from '../dtos/auth-tokens.dto';
import { toPrincipalDto } from '../dtos/principal.dto';
import { AuthRateLimiter } from '../security/auth-rate-limiter';
import { PasswordHasher } from '../security/password-hasher';
import { RefreshTokenService } from '../security/refresh-token.service';
import { TokenIssuer } from '../security/token-issuer';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { SessionExpiredError } from '../../domain/errors/session-expired.error';
import { SessionRevokedError } from '../../domain/errors/session-revoked.error';
import { UserInactiveError } from '../../domain/errors/user-inactive.error';
import { SessionRevokedEvent } from '../../domain/events/session-revoked.event';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface RefreshSessionInput {
  refreshToken: string;
}

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly refreshTokens: RefreshTokenService,
    private readonly tokenIssuer: TokenIssuer,
    private readonly transaction: IdentityTransaction,
    private readonly events: EventBus,
    private readonly rateLimiter: AuthRateLimiter,
  ) {}

  async execute(input: RefreshSessionInput): Promise<AuthTokensDto> {
    const parsed = this.refreshTokens.parse(input.refreshToken);

    if (!parsed) {
      throw new InvalidCredentialsError();
    }

    await this.rateLimiter.assertAllowed(`refresh:${parsed.sessionId}`);
    const session = await this.access.findSessionById(parsed.sessionId);

    if (!session) {
      throw new InvalidCredentialsError();
    }

    if (session.isRevoked) {
      throw new SessionRevokedError();
    }

    if (session.isExpired) {
      throw new SessionExpiredError();
    }

    const validRefreshToken = await this.passwordHasher.verify(
      session.refreshTokenSecretHash,
      parsed.secret,
    );

    if (!validRefreshToken) {
      await this.access.revokeSession(session.id, 'refresh_token_reuse');
      this.events.publish(
        new SessionRevokedEvent({
          userId: session.userId,
          sessionId: session.id,
          reason: 'refresh_token_reuse',
        }),
      );
      throw new SessionRevokedError();
    }

    const user = await this.users.findById(session.userId);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new UserInactiveError(user.id);
    }

    const generatedRefreshToken = this.refreshTokens.generate(session.id);
    await this.transaction.run(async () => {
      await this.access.updateSessionRefreshSecret(
        session.id,
        await this.passwordHasher.hash(generatedRefreshToken.secret),
      );
    });

    const [issuedAccessToken, principalAccess] = await Promise.all([
      this.tokenIssuer.issueAccessToken({
        userId: user.id,
        sessionId: session.id,
        email: user.email,
      }),
      this.access.getPrincipalAccess(user.id),
    ]);

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
