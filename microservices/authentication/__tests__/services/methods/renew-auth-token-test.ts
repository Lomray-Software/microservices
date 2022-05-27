import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import Token from '@entities/token';
import { TokenCreateReturnType } from '@services/methods/create-auth-token';
import type { RenewAuthToken as OriginalRenewAuthToken } from '@services/methods/renew-auth-token';
import Jwt from '@services/tokens/jwt';

const { RenewAuthToken } = rewiremock.proxy<{ RenewAuthToken: typeof OriginalRenewAuthToken }>(
  () => require('@services/methods/renew-auth-token'),
  {
    typeorm: TypeormMock.mock,
  },
);

describe('services/methods/renew-auth-token', () => {
  const repository = TypeormMock.entityManager.getRepository(Token);
  const userId = 'test-id';
  const jwtConfig = { secretKey: 'secret' };
  const service = new RenewAuthToken(repository, jwtConfig);
  const jwtService = new Jwt(jwtConfig.secretKey);
  const tokenId = 'token-id';

  afterEach(() => {
    TypeormMock.sandbox.reset();
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly renew token: all return types', async () => {
    TypeormMock.entityManager.findOne.resolves(repository.create({ id: tokenId, userId }));

    const { access, refresh } = jwtService.create(tokenId);
    const cases = [
      {
        returnType: TokenCreateReturnType.directly,
        expectedResult: (token: Token) => ({ access: token.access, refresh: token.refresh }),
      },
      {
        returnType: TokenCreateReturnType.cookies,
        expectedResult: (token: Token) => ({
          refresh: token.refresh,
          payload: {
            cookies: [
              {
                action: 'add',
                name: 'jwt-access',
                value: token.access,
                options: { httpOnly: true, secure: true, sameSite: undefined },
              },
            ],
          },
        }),
      },
    ];

    for (const { returnType, expectedResult } of cases) {
      const result = await service.renew({
        access,
        refresh,
        returnType,
      });

      const [, token] = TypeormMock.entityManager.save.firstCall.args;

      expect(token.userId).to.equal(userId);
      expect(token.access).to.not.empty.and.not.equal(access);
      expect(token.refresh).to.not.empty.and.not.equal(refresh);
      expect(token.id).to.equal(tokenId);
      expect(String(token.expirationAt)).to.length(10);
      expect(result).to.deep.equal(expectedResult(token));
    }
  });

  it('should correctly renew with headers & cookies', async () => {
    TypeormMock.entityManager.findOne.resolves(repository.create({ id: tokenId, userId }));

    const { access, refresh } = jwtService.create(tokenId);

    const cases = [
      {
        returnType: TokenCreateReturnType.directly,
        headers: {
          cookie: `_octo=GH1.1.410839147.1623154775; _device_id=bd16babbc28b1bd75915ce011104d00c; jwt-access=${access};`,
        },
        expectedResult: (token: Token) => ({ access: token.access, refresh: token.refresh }),
      },
      {
        returnType: TokenCreateReturnType.directly,
        headers: {
          authorization: `Bearer ${access}`,
        },
        expectedResult: (token: Token) => ({ access: token.access, refresh: token.refresh }),
      },
    ];

    for (const { returnType, headers, expectedResult } of cases) {
      const result = await service.renew(
        {
          refresh,
          returnType,
        },
        headers,
      );

      const [, token] = TypeormMock.entityManager.save.firstCall.args;

      expect(token.userId).to.equal(userId);
      expect(token.access).to.not.empty.and.not.equal(access);
      expect(token.refresh).to.not.empty.and.not.equal(refresh);
      expect(result).to.deep.equal(expectedResult(token));
    }
  });

  it('should throw error: jwt not valid', async () => {
    const jwtFailedService = new Jwt('another-key');
    const jwExpiredService = new Jwt(jwtConfig.secretKey, { expirationRefresh: 0 });
    const { access, refresh } = jwtFailedService.create('test-id');
    const { access: correctAccessToken, refresh: correctRefreshToken } =
      jwtService.create('test-id-2');
    const { access: correctAccessTokenExp, refresh: expiredRefreshToken } =
      jwExpiredService.create('test-id-3');

    const invalidSignature = service.renew({
      access,
      refresh,
      returnType: TokenCreateReturnType.directly,
    });
    const invalidAccessToken = service.renew({
      access: 'invalid-access',
      refresh: correctRefreshToken,
      returnType: TokenCreateReturnType.directly,
    });
    const invalidRefreshToken = service.renew({
      access: correctAccessToken,
      refresh: 'invalid-refresh',
      returnType: TokenCreateReturnType.directly,
    });
    const expiredToken = service.renew({
      access: correctAccessTokenExp,
      refresh: expiredRefreshToken,
      returnType: TokenCreateReturnType.directly,
    });
    const differentTokens = service.renew({
      access: correctAccessTokenExp,
      refresh: correctRefreshToken,
      returnType: TokenCreateReturnType.directly,
    });

    expect(await waitResult(invalidSignature))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('invalid signature');
    expect(await waitResult(invalidAccessToken))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('jwt malformed');
    expect(await waitResult(invalidRefreshToken))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('jwt malformed');
    expect(await waitResult(expiredToken))
      .to.throw()
      .to.have.property('payload')
      .to.have.property('message')
      .equal('jwt expired');
    expect(await waitResult(differentTokens)).to.throw('Invalid pair access and refresh tokens');
  });

  it('should throw error: tokens not exist in db', async () => {
    TypeormMock.entityManager.findOne.resolves();

    const { access, refresh } = jwtService.create('test-id');
    const result = service.renew({
      access,
      refresh,
      returnType: TokenCreateReturnType.directly,
    });

    expect(await waitResult(result)).to.throw('Authentication token not found');
  });
});
