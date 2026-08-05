import { Injectable } from '@nestjs/common';
import { EventBus } from '../../../../shared/events';
import { AuthTokensDto } from '../dtos/auth-tokens.dto';
import { toPrincipalDto } from '../dtos/principal.dto';
import { AuthRateLimiter } from '../security/auth-rate-limiter';
import { PasswordHasher } from '../security/password-hasher';
import { RefreshTokenService } from '../security/refresh-token.service';
import { TokenIssuer } from '../security/token-issuer';
import { SessionEntity } from '../../domain/entities/session.entity';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { UserInactiveError } from '../../domain/errors/user-inactive.error';
import { SessionCreatedEvent } from '../../domain/events/session-created.event';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class LoginUseCase {
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

  async execute(input: LoginInput): Promise<AuthTokensDto> {
    const normalizedEmail = input.email.toLowerCase();
    await this.rateLimiter.assertAllowed(`login:${normalizedEmail}`);

    const user = await this.users.findByEmail(normalizedEmail);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new UserInactiveError(user.id);
    }

    const credential = await this.access.findCredentialByUserId(user.id);

    if (
      !credential ||
      !(await this.passwordHasher.verify(
        credential.passwordHash,
        input.password,
      ))
    ) {
      throw new InvalidCredentialsError();
    }

    const expiresAt = new Date(
      Date.now() +
        Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30) * 24 * 60 * 60 * 1000,
    );
    let refreshToken = '';
    const session = await this.transaction.run(async () => {
      const savedSession = await this.access.saveSession(
        SessionEntity.create({
          userId: user.id,
          refreshTokenSecretHash: 'pending',
          expiresAt,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        }),
      );
      const generatedRefreshToken = this.refreshTokens.generate(
        savedSession.id,
      );
      savedSession.refreshTokenSecretHash = await this.passwordHasher.hash(
        generatedRefreshToken.secret,
      );
      const updatedSession = await this.access.saveSession(savedSession);
      refreshToken = generatedRefreshToken.token;

      return updatedSession;
    });

    const [issuedAccessToken, principalAccess] = await Promise.all([
      this.tokenIssuer.issueAccessToken({
        userId: user.id,
        sessionId: session.id,
        email: user.email,
      }),
      this.access.getPrincipalAccess(user.id),
    ]);

    this.events.publish(
      new SessionCreatedEvent({ userId: user.id, sessionId: session.id }),
    );

    return {
      ...issuedAccessToken,
      refreshToken,
      principal: toPrincipalDto({
        user,
        roleKeys: principalAccess.roleKeys,
        permissionKeys: principalAccess.permissionKeys,
      }),
    };
  }
}
