import { CurrentPrincipalContext } from '../../../../shared/api';

export interface AccessTokenClaims {
  sub: string;
  sid: string;
  email: string;
  typ: 'access';
}

export interface IssuedAccessToken {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export abstract class TokenIssuer {
  abstract issueAccessToken(
    principal: Pick<CurrentPrincipalContext, 'userId' | 'sessionId' | 'email'>,
  ): Promise<IssuedAccessToken>;
  abstract verifyAccessToken(token: string): Promise<AccessTokenClaims>;
}
