import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';

export interface GeneratedRefreshToken {
  sessionId: string;
  secret: string;
  token: string;
}

@Injectable()
export class RefreshTokenService {
  generate(sessionId: string): GeneratedRefreshToken {
    const secret = randomBytes(32).toString('base64url');

    return {
      sessionId,
      secret,
      token: `${sessionId}.${secret}`,
    };
  }

  parse(token: string): GeneratedRefreshToken | null {
    const [sessionId, secret, ...rest] = token.split('.');

    if (!sessionId || !secret || rest.length > 0) {
      return null;
    }

    return {
      sessionId,
      secret,
      token,
    };
  }
}
