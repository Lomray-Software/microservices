import { Log } from '@lomray/microservice-helpers';
import { Gateway } from '@lomray/microservice-nodejs-lib';
import { Response } from 'express';
import type { RequestHandler } from 'express-serve-static-core';
import remoteConfig from '@config/remote';

/**
 * Handles webhooks from other services
 */
const webhook =
  (): RequestHandler =>
  async (req, res, next): Promise<Response | void> => {
    // @ts-ignore
    const { headers, url, rawBody } = req;
    const { webhookOptions } = await remoteConfig();

    const hasWebhook = url.startsWith(webhookOptions.url);
    const [, method] = url.split(webhookOptions.url);

    if (hasWebhook) {
      try {
        const response = await Gateway.getInstance().sendRequest(method, {
          headers,
          body: rawBody,
        });

        if (response.getError()) {
          return res.status(500).json({ error: response.getError() });
        }

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
