import { Log } from '@lomray/microservice-helpers';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { Response } from 'express';
import type { RequestHandler } from 'express-serve-static-core';

/**
 * Handles webhooks from other services
 */
const webhook =
  (): RequestHandler =>
  async (req, res, next): Promise<Response | void> => {
    const { body, headers, url } = req;

    const hasWebhook = url.startsWith('/webhook/');
    const [, path] = url.split('/webhook/');

    // TODO: try to find another way to get microservice. The getInstance method didnt work, Microservice.sendRequest too.
    const ms = Microservice.create();

    if (hasWebhook) {
      try {
        await ms.sendRequest(path, { headers, payload: body });

        return res.sendStatus(200);
      } catch (e) {
        Log.error(`Webhook handler has following error ${e as string}`);

        return res.status(500).json({ error: e });
      }
    } else {
      next();
    }
  };

export default webhook;
