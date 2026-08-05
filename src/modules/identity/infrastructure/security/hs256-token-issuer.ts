import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ApplicationError, ErrorCode } from '../../../../shared/api';
import {
  AccessTokenClaims,
  IssuedAccessToken,
  TokenIssuer,
} from '../../application/security/token-issuer';

interface JwtPayload extends AccessTokenClaims {
  iat: number;
  exp: number;
}

@Injectable()
export class Hs256TokenIssuer implements TokenIssuer {
  private readonly secret = process.env.JWT_SECRET ?? '';
  private readonly accessTokenTtlSeconds = Number(
    process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ?? 900,
  );

  issueAccessToken(input: {
    userId: string;
    sessionId: string;
    email: string;
  }): Promise<IssuedAccessToken> {
    this.assertConfigured();
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: input.userId,
      sid: input.sessionId,
      email: input.email,
      typ: 'access',
      iat: now,
      exp: now + this.accessTokenTtlSeconds,
    };

    return Promise.resolve({
      accessToken: this.sign(payload),
      expiresIn: this.accessTokenTtlSeconds,
      tokenType: 'Bearer',
    });
  }

  verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    this.assertConfigured();
    const [encodedHeader, encodedPayload, signature, ...rest] =
      token.split('.');

    if (!encodedHeader || !encodedPayload || !signature || rest.length > 0) {
      throw this.unauthenticated();
    }

    const expectedSignature = this.createSignature(
      `${encodedHeader}.${encodedPayload}`,
    );

    if (
      expectedSignature.length !== signature.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      throw this.unauthenticated();
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as JwtPayload;

    if (
      payload.typ !== 'access' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      throw this.unauthenticated();
    }

    return Promise.resolve({
      sub: payload.sub,
      sid: payload.sid,
      email: payload.email,
      typ: payload.typ,
    });
  }

  private sign(payload: JwtPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    return `${signingInput}.${this.createSignature(signingInput)}`;
  }

  private createSignature(signingInput: string): string {
    return createHmac('sha256', this.secret)
      .update(signingInput)
      .digest('base64url');
  }

  private assertConfigured(): void {
    if (this.secret.length < 32) {
      throw new ApplicationError({
        code: ErrorCode.InternalServerError,
        message: 'JWT_SECRET must be at least 32 characters long',
      });
    }
  }

  private unauthenticated(): ApplicationError {
    return new ApplicationError({
      code: ErrorCode.Unauthenticated,
      message: 'Invalid access token',
    });
  }
}
