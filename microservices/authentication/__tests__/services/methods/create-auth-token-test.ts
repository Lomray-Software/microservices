import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import jsonwebtoken from 'jsonwebtoken';
import rewiremock from 'rewiremock';
import TokenType from '@constants/token-type';
import Token from '@entities/token';
import type { CreateAuthToken as OriginalCreateAuthToken } from '@services/methods/create-auth-token';
import { TokenCreateReturnType } from '@services/methods/create-auth-token';

const { CreateAuthToken } = rewiremock.proxy<{ CreateAuthToken: typeof OriginalCreateAuthToken }>(
  () => require('@services/methods/create-auth-token'),
  {
    typeorm: TypeormMock.mock,
  },
);

describe('services/methods/create-auth-token', () => {
  const repository = TypeormMock.entityManager.getRepository(Token);
  const userId = 'test-personal-id';
  const jwtConfig = {
    secretKey: 'secret',
    options: { issuer: 'test-issuer' },
  };
  const service = new CreateAuthToken(repository, jwtConfig);

  /**
   * Helper for mock first save jwt
   */
  const fakeSaveJwt = (_: any, fields: Record<string, any>): Record<string, any> => ({
    id: fields.id ? fields.id : 'uuid-id-test',
    ...fields,
  });

  afterEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly create personal token: directly', async () => {
    const result = await service.create({
      type: TokenType.personal,
      returnType: TokenCreateReturnType.directly,
      userId,
    });

    const [, token] = TypeormMock.entityManager.save.firstCall.args;

    expect(result.token).to.length(32);
    expect(token.type).to.equal(TokenType.personal);
    expect(token.userId).to.equal(userId);
    expect(token.personal).to.equal(result.token);
  });

  it('should throw error create personal token: cookies', async () => {
    const result = service.create({
      type: TokenType.personal,
      returnType: TokenCreateReturnType.cookies,
      userId,
    });

    expect(await waitResult(result)).to.throw(
      'Return type "cookies" available only with type "jwt"',
    );
  });

  it('should correctly create jwt token: directly', async () => {
    TypeormMock.entityManager.save.callsFake(fakeSaveJwt);

    const { access, refresh } = await service.create({
      type: TokenType.jwt,
      returnType: TokenCreateReturnType.directly,
      userId,
    });

    const [, token] = TypeormMock.entityManager.save.lastCall.args;

    expect(token.id).to.equal('uuid-id-test');
    expect(token.type).to.equal(TokenType.jwt);
    expect(token.userId).to.equal(userId);
    expect(token.access).to.equal(access);
    expect(token.refresh).to.equal(refresh);
    expect(String(token.expirationAt)).to.length(10);
    expect(() => jsonwebtoken.verify(access as string, jwtConfig.secretKey)).to.not.throw();
    expect(() => jsonwebtoken.verify(refresh as string, jwtConfig.secretKey)).to.not.throw();
  });

  it('should correctly create jwt token: cookies', async () => {
    TypeormMock.entityManager.save.callsFake(fakeSaveJwt);

    const result = await service.create({
      type: TokenType.jwt,
      returnType: TokenCreateReturnType.cookies,
      userId,
      params: { maxAge: 15 },
    });

    const [, token] = TypeormMock.entityManager.save.lastCall.args;

    expect(token.access).to.not.empty;
    expect(result).to.deep.equal({
      refresh: token.refresh,
      payload: {
        cookies: [
          {
            action: 'add',
            name: 'jwt-access',
            value: token.access,
            options: {
              httpOnly: true,
              secure: true,
              sameSite: undefined,
              domain: undefined,
              maxAge: 15,
            },
          },
        ],
      },
    });
  });
});
