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
    const { url, method, body, headers, query } = req;
    const { webhookUrl } = await remoteConfig();

    if (!webhookUrl) {
      Log.error('Webhook url is not provided');

      return res.status(500).json({ error: 'Webhook url is not provided.' });
    }

    if (!['post', 'get'].includes(method.toLowerCase())) {
      Log.error('Method not allowed.');

      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { groups } =
      new RegExp(`${webhookUrl as string}(?<methodUrl>[^/]+)/?(?<authToken>[^/?]+)?`).exec(url) ||
      {};

    if (!groups) {
      next();

      return;
    }

    const { methodUrl, authToken } = groups;

    req.url = '/';
    req.method = 'post';
    req['forceStatus'] = true; // set response error status
    headers.authorization = authToken ? `Bearer ${authToken}` : undefined;
    req.body = {
      method: methodUrl,
      params: {
        body,
        rawBody: req['rawBody'],
        query: query ?? {},
      },
    };

    next();
  };

export default webhook;
