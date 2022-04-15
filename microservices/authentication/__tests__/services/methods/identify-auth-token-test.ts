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
  const jwtConfig = { secretKey: 'secret' };
  const service = new IdentifyAuthToken(repository, jwtConfig);
  const jwtService = new Jwt(jwtConfig.secretKey);

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
        },
      },
      {
        headers: { Authorization: `Bearer ${personalToken}` },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.personal,
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

    TypeormMock.entityManager.findOne.callsFake(jwtFakeFind(tokenId));

    const cases = [
      {
        token: access,
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
        },
      },
      {
        headers: { Authorization: `Bearer ${access}` },
        expectedResult: {
          tokenId,
          userId,
          isAuth: true,
          provider: AuthProviders.jwt,
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
        },
      },
    ];

    for (const { expectedResult, token, headers } of cases) {
      const result = await service.identify({ token }, headers);

      expect(result).to.deep.equal(expectedResult);
    }
  });

  it('should correctly return empty response: token not exist', async () => {
    const result = await service.identify({ token: undefined });

    expect(result).to.deep.equal({
      tokenId: null,
      userId: null,
      isAuth: false,
      provider: null,
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
