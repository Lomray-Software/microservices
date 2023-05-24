import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import webhook from '@middlewares/webhook';

describe('webhook', () => {
  const exampleUrl = '/webhook/payment.stripe.webhook/testtoken';
  const res = {} as Response;
  const sandbox = sinon.createSandbox();
  const nextStub = sandbox.stub().resolves();

  afterEach(() => {
    sandbox.restore();
  });

  it('should set req.url, req.method, headers.authorization correctly', () => {
    const req = {
      url: exampleUrl,
      method: 'GET',
      body: {},
      headers: {},
    } as Request;
    const middleware = webhook();

    middleware(req, res, nextStub);

    expect(req.url).to.equal(exampleUrl);
    expect(req.method).to.equal('GET');
    expect(req.headers.authorization).to.be.undefined;
  });

  it('should not set body if method is not get or post', () => {
    const req = {
      url: exampleUrl,
      method: 'PUT',
      body: {},
      headers: {},
    } as Request;
    const middleware = webhook();

    middleware(req, res, nextStub);

    expect(req.url).to.equal(exampleUrl);
    expect(req.method).to.equal('PUT');
    expect(req.headers.authorization).to.be.undefined;
    expect(req.body).to.deep.equal({});
  });
});
