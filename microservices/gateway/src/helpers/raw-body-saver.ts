import { IncomingMessage, ServerResponse } from 'http';

/**
 * Adds raw body to request
 */
const rawBodySaver = function (req: IncomingMessage, res: ServerResponse, buf: Buffer | undefined) {
  if (buf && buf.length) {
    req['rawBody'] = buf.toString();
  }
};

export default rawBodySaver;
