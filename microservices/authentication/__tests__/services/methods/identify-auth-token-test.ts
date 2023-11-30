import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import AuthProviders from '@constants/auth-providers';
import UnauthorizedCode from '@constants/unauthorized-code';
import Token from '@entities/token';
import { IdentifyAuthToken as OriginalIdentifyAuthToken } from '@services/methods/identity-auth-token';
import Jwt from '@services/tokens/jwt';
import Personal from '@services/tokens/personal';

const { IdentifyAuthToken } = rewiremock.proxy<{
  IdentifyAuthToken: typeof OriginalIdentifyAuthToken;
}>(() => require('@services/methods/identity-auth-token'), {
  typeorm: TypeormMock.mock,
});

describe('services/methods/identify-auth-token', () => {
  const repository = TypeormMock.entityManager.getRepository(Token);
  const userId = 'test-id';
  const tokenId = 'token-id';
  const audience = 'identify-auth-token';
  const jwtConfig = { secretKey: 'secret', options: { audience } };
  const service = new IdentifyAuthToken(repository, jwtConfig);
  const jwtService = new Jwt(jwtConfig.secretKey, { options: { audience: [audience] } });

  /**
   * Helper for mock find personal token
   */
  const personalFakeFind =
    (compareWith: string) =>
    (_: any, { personal }: { personal: string }) => {
      if (personal === compareWith) {
        return repository.create({ id: tokenId, userId });
      }

      return undefined;
    };

  /**
   * Helper for mock find jwt token
   */
  const jwtFakeFind =
    (compareWith: string) =>
    (_: any, { id }: { id: string }) => {
      if (id === compareWith) {
        return repository.create({ id: tokenId, userId });
      }

      return undefined;
    };

  afterEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly identify token: personal', async () => {
    const personalToken = Personal.generate();

    TypeormMock.entityManager.findOne.callsFake(personalFakeFind(personalToken));

    const cases = [
      {
        token: personalToken,
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.personal,
          accessExpirationAt: null,
          expirationAt: null,
        },
      },
      {
        headers: { Authorization: `Bearer ${personalToken}` },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.personal,
          accessExpirationAt: null,
          expirationAt: null,
        },
      },
    ];

    for (const { expectedResult, token, headers } of cases) {
      const result = await service.identify({ token }, headers);

      expect(result).to.deep.equal(expectedResult);
    }
  });

  it('should correctly identify token: jwt', async () => {
    const { access } = jwtService.create(tokenId);
    const { access: audAccess } = new Jwt(jwtConfig.secretKey, {
      options: { audience: ['test-unknown-aud'] },
    }).create(tokenId);
    const { access: audAnotherAccess } = new Jwt('another-secret').create(tokenId);
    const { access: notExistAccess } = jwtService.create('not-exist');

    TypeormMock.entityManager.findOne.callsFake(jwtFakeFind(tokenId));

    const cases = [
      {
        token: access,
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
          expirationAt: null,
        },
      },
      {
        headers: { Authorization: `Bearer ${access}` },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
          expirationAt: null,
        },
      },
      {
        headers: { authorization: `Bearer ${access}` },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
          expirationAt: null,
        },
      },
      {
        headers: {
          cookie: `_octo=GH1.1.410839147.1623154775; _device_id=bd16babbc28b1bd75915ce011104d00c; jwt-access=${access};`,
        },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
          expirationAt: null,
        },
      },
      // test cookies with multiple keys, find right token with correct audience
      {
        headers: {
          cookie: `_octo=GH1.1.410839147.1623154775; jwt-access=${audAccess}; _device_id=bd16babbc28b1bd75915ce011104d00c; jwt-access=${access};`,
        },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
          expirationAt: null,
        },
      },
      {
        headers: {
          cookie: `_octo=GH1.1.410839147.1623154775; jwt-access=${audAccess}; _device_id=bd16babbc28b1bd75915ce011104d00c; jwt-access=${access}; jwt-access=${audAccess};`,
        },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
          expirationAt: null,
        },
      },
      {
        headers: {
          cookie: `_octo=GH1.1.410839147.1623154775; jwt-access=${notExistAccess}; jwt-access=${notExistAccess};`,
        },
        expectedResult: 'Unauthorized',
      },
      {
        headers: {
          cookie: `_octo=GH1.1.410839147.1623154775; jwt-access=${audAnotherAccess}; jwt-access=${access};`,
        },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
          expirationAt: null,
        },
      },
    ];

    for (const { expectedResult, token, headers } of cases) {
      // invalid token case (e.g. expired)
      if (typeof expectedResult === 'string') {
        expect(await waitResult(service.identify({ token }, headers))).to.throw(expectedResult);
        continue;
      }

      const result = await service.identify({ token }, headers);

      // valid token case
      expect(typeof result.accessExpirationAt).to.equal('number');

      delete result.accessExpirationAt;

      expect(result).to.deep.equal(expectedResult);
    }
  });

  it('should ignore unknown tokens from cookies', async () => {
    const { access } = new Jwt('unknown').create('unknown-token');
    const result = await service.identify(
      { token: undefined },
      {
        cookie: `_octo=GH1.1.410839147.1623154775; jwt-access=${access};`,
      },
    );

    expect(result).to.deep.equal({
      tokenId: null,
      userId: null,
      isAuth: false,
      provider: null,
      accessExpirationAt: null,
      expirationAt: null,
    });
  });

  it('should correctly return empty response: token not exist', async () => {
    const result = await service.identify({ token: undefined });

    expect(result).to.deep.equal({
      tokenId: null,
      userId: null,
      isAuth: false,
      provider: null,
      accessExpirationAt: null,
      expirationAt: null,
    });
  });

  it('should throw error: personal token expired', async () => {
    TypeormMock.entityManager.findOne.resolves(
      repository.create({ id: tokenId, userId, expirationAt: 0 }),
    );

    const result = service.identify({
      token: Personal.generate(),
    });

    expect(await waitResult(result))
      .to.throw()
      .to.have.property('code')
      .to.equal(UnauthorizedCode.PERSONAL_EXPIRED);
  });

  it('should throw error: token not exist in db', async () => {
    TypeormMock.entityManager.findOne.resolves();

    const result = service.identify({
      token: Personal.generate(),
    });

    expect(await waitResult(result))
      .to.throw()
      .to.have.property('code')
      .to.equal(UnauthorizedCode.TOKEN_NOT_EXIST);
  });

  it('should throw error: jwt token invalid', async () => {
    const jwtFailedService = new Jwt('failed-key');
    const { access } = jwtFailedService.create(tokenId);

    const result = service.identify({
      token: access,
    });

    expect(await waitResult(result))
      .to.throw()
      .to.have.property('code')
      .to.equal(UnauthorizedCode.INVALID_AUTH_TOKEN);
  });
});
