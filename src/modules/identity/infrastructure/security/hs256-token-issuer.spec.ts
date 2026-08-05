import { Hs256TokenIssuer } from './hs256-token-issuer';

describe('Hs256TokenIssuer', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = '01234567890123456789012345678901';
    process.env.JWT_ACCESS_TOKEN_TTL_SECONDS = '900';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    delete process.env.JWT_ACCESS_TOKEN_TTL_SECONDS;
  });

  it('issues and verifies access tokens without permission claims', async () => {
    const issuer = new Hs256TokenIssuer();

    const issued = await issuer.issueAccessToken({
      userId: 'user-id',
      sessionId: 'session-id',
      email: 'user@example.com',
    });
    const claims = await issuer.verifyAccessToken(issued.accessToken);

    expect(issued.expiresIn).toBe(900);
    expect(claims).toEqual({
      sub: 'user-id',
      sid: 'session-id',
      email: 'user@example.com',
      typ: 'access',
    });
    expect(
      JSON.parse(
        Buffer.from(issued.accessToken.split('.')[1], 'base64url').toString(
          'utf8',
        ),
      ),
    ).not.toHaveProperty('permissions');
  });
});
