import { IncomingMessage, ServerResponse } from 'http';
import { expect } from 'chai';
import rawBodySaver from '@helpers/raw-body-saver';

describe('rawBodySaver', () => {
  let req = {} as IncomingMessage;
  let res = new ServerResponse(req);

  afterEach(() => {
    req = {} as IncomingMessage;
    res = new ServerResponse(req);
  });

  it('should set req.rawBody to the buffer content', () => {
    const buf = Buffer.from('Test data');

    rawBodySaver(req, res, buf);

    // @ts-ignore
    expect(req.rawBody).to.equal('Test data');
  });

  it('should not set req.rawBody if buffer is empty', () => {
    const buf = Buffer.from('');

    rawBodySaver(req, res, buf);

    // @ts-ignore
    expect(req.rawBody).to.equal(undefined);
  });

  it('should not set req.rawBody if buffer is undefined', () => {
    const buf = undefined;

    rawBodySaver(req, res, buf);

    // @ts-ignore
    expect(req.rawBody).to.equal(undefined);
  });
});
