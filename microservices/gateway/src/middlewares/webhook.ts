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
    const { headers, url, method } = req;
    const {
      webhookOptions: { url: webhookUrl, allowMethods },
    } = await remoteConfig();

    if (!['post', 'get'].includes(method.toLowerCase())) {
      Log.error('Method not allowed.');

      return res.status(405).json({ error: 'Method not allowed.' });
    }

    if (!webhookUrl) {
      Log.error('Webhook url is not provided');

      return res.status(500).json({ error: 'Webhook url is not provided' });
    }

    const hasWebhook = url.startsWith(webhookUrl);
    const [, msMethod] = url.split(webhookUrl);

    if (hasWebhook && allowMethods?.includes(msMethod)) {
      try {
        const response = await Gateway.getInstance().sendRequest(msMethod, {
          headers,
          body: req['rawBody'],
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
