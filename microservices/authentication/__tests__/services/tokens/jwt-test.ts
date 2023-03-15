import { expect } from 'chai';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import Jwt from '@services/tokens/jwt';

describe('services/tokens/jwt', () => {
  const secretKey = 'demo';

  /**
   * Helper for check expiration tokens
   */
  const getExpirationDays = (timestamp: number): { minutes: number; days: number } => {
    const totalSec = Math.round(timestamp - Math.abs(Number(Date.now()) / 1000));
    const minutes = Math.round(totalSec / 60);
    const days = Math.round(minutes / 60 / 24);

    return { minutes, days };
  };

  it('should correctly create access & refresh tokens', () => {
    const jwtService = new Jwt(secretKey);
    const { access, refresh } = jwtService.create('id-1');

    const { jti, exp: expAccess } = jsonwebtoken.decode(access) as JwtPayload;
    const { jti: jtiRefresh, exp: expRefresh } = jsonwebtoken.decode(refresh) as JwtPayload;

    expect(jti).to.equal('id-1');
    expect(jtiRefresh).to.equal('id-1');
    expect(getExpirationDays(expAccess as number).minutes).to.equal(30); // minutes by default
    expect(getExpirationDays(expRefresh as number).days).to.equal(30); // days by default
    expect(() => jsonwebtoken.verify(access, secretKey)).to.not.throw();
    expect(() => jsonwebtoken.verify(refresh, secretKey)).to.not.throw();
  });

  it('should correctly create tokens with custom params and payload', () => {
    const jwtService = new Jwt(secretKey, {
      expiration: 1800 / 2,
      expirationRefresh: 2592000 * 2,
      options: { issuer: 'tests' },
    });
    const { access, refresh } = jwtService.create('id-2', { userId: 'ent-id-1' });

    const { exp: expAccess, iss, userId } = jsonwebtoken.decode(access) as JwtPayload;
    const { exp: expRefresh } = jsonwebtoken.decode(refresh) as JwtPayload;

    expect(iss).to.equal('tests');
    expect(userId).to.equal('ent-id-1');
    expect(getExpirationDays(expAccess as number).minutes).to.equal(15); // minutes
    expect(getExpirationDays(expRefresh as number).days).to.equal(60); // days
    expect(() => jsonwebtoken.verify(access, secretKey)).to.not.throw();
    expect(() => jsonwebtoken.verify(refresh, secretKey)).to.not.throw();
  });

  it('should correctly validate access & refresh tokens', () => {
    const jwtService = new Jwt(secretKey, { options: { issuer: 'tests' } });
    const { access, refresh } = jwtService.create('id-3');

    const accessPayload = jwtService.validate(access);
    const refreshPayload = jwtService.validate(refresh);

    expect(accessPayload.jti).to.equal('id-3');
    expect(refreshPayload.jti).to.equal('id-3');
  });

  it('should throw error validate token: invalid token', () => {
    const jwtService = new Jwt(secretKey);

    expect(() => jwtService.validate('asd'))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('jwt malformed');
  });

  it('should throw error validate token: secret key invalid', () => {
    const jwtService = new Jwt(secretKey);
    const jwtFailService = new Jwt('another-key');
    const { access, refresh } = jwtService.create('id-4');

    expect(() => jwtFailService.validate(access))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('invalid signature');
    expect(() => jwtFailService.validate(refresh))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('invalid signature');
  });

  it('should throw error validate token: expired', () => {
    const jwtService = new Jwt(secretKey, { expiration: 0, expirationRefresh: 0 });
    const { access, refresh } = jwtService.create('id-5');

    expect(() => jwtService.validate(access))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('jwt expired');
    expect(() => jwtService.validate(refresh))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('jwt expired');
  });

  it('should correctly validate token: ignore expiration', () => {
    const jwtService = new Jwt(secretKey, { expiration: 0 });
    const { access } = jwtService.create('id-6');

    const { jti } = jwtService.validate(access, { ignoreExpiration: true });

    expect(jti).to.equal('id-6');
  });

  it('should correctly decode token', () => {
    const jwtService = new Jwt(secretKey);
    const { access } = jwtService.create('id-7');

    const { jti } = jwtService.decode(access);

    expect(jti).to.equal('id-7');
  });

  it('should correctly validate token with audience', () => {
    const tokenId = 'id-aud-1';
    const jwtServiceAud = new Jwt(secretKey, { options: { audience: ['test-aud'] } });
    const jwtService = new Jwt(secretKey);
    const { access } = jwtServiceAud.create(tokenId);
    const { jti } = jwtService.validate(access, { ignoreExpiration: true });

    expect(jti).to.equal(tokenId);
    expect(() =>
      jwtService.validate(access, { ignoreExpiration: true, audience: ['unknown'] }),
    ).to.throw('Unauthorized');
  });

  it('should correctly find most suitable token by audience and origin', () => {
    const tokenId1 = 'id-origin-1';
    const tokenId2 = 'id-2';
    const origin = 'test-origin';
    const jwtServiceOrig = new Jwt(secretKey, {
      options: { audience: ['test-aud', origin] },
    });
    const jwtService = new Jwt(secretKey, { options: { audience: ['test-aud'] } });
    const { access } = jwtServiceOrig.create(tokenId1);
    const { access: access2 } = jwtService.create(tokenId2);

    const token = jwtService.findMostSuitableToken([access2, access], origin);

    expect(token).to.equal(access);
  });
});
