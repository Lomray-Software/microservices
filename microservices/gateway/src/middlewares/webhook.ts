import { Log } from '@lomray/microservice-helpers';
import { Response } from 'express';
import type { RequestHandler } from 'express-serve-static-core';
import remoteConfig from '@config/remote';

/**
 * Handles webhooks from other services
 */
const webhook =
  (): RequestHandler =>
  async (req, res, next): Promise<Response | void> => {
    const { url, method, body, headers } = req;
    const { webhookUrl } = await remoteConfig();

    if (!webhookUrl) {
      Log.error('Webhook url is not provided');

      return res.status(500).json({ error: 'Webhook url is not provided' });
    }

    const hasWebhook = url.startsWith(webhookUrl);
    const [, msMethod, accessToken] = url.split(webhookUrl);

    if (hasWebhook) {
      if (!['post', 'get'].includes(method.toLowerCase())) {
        Log.error('Method not allowed.');

        return res.status(405).json({ error: 'Method not allowed.' });
      }

      req.url = '/';
      req.method = 'post';
      headers.authorization = accessToken ? `Bearer ${accessToken}` : undefined;
      req.body = {
        method: msMethod,
        params: {
          body,
          rawBody: req['rawBody'],
        },
      };
    }

    next();
  };

export default webhook;
