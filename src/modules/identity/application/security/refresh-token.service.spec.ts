import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  it('generates opaque refresh tokens with a session selector and secret', () => {
    const service = new RefreshTokenService();

    const generated = service.generate('session-id');

    expect(generated.sessionId).toBe('session-id');
    expect(generated.secret).toHaveLength(43);
    expect(generated.token).toBe(`session-id.${generated.secret}`);
    expect(service.parse(generated.token)).toEqual(generated);
  });

  it('rejects malformed refresh tokens', () => {
    const service = new RefreshTokenService();

    expect(service.parse('missing-secret')).toBeNull();
    expect(service.parse('too.many.parts')).toBeNull();
  });
});
