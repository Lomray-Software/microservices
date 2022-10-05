import { Log } from '@lomray/microservice-helpers';
import type { RequestHandler, Request } from 'express-serve-static-core';
import _ from 'lodash';
import RequestIp from 'request-ip';

interface IUserInfoParams {
  handleUserInfo?: (userInfo: Record<string, any> | undefined, req: Request) => void;
}

/**
 * Collect and attach user info to headers
 */
const userInfo =
  ({ handleUserInfo }: IUserInfoParams = {}): RequestHandler =>
  (req, res, next) => {
    const clientIp = RequestIp.getClientIp(req);

    // parse user info
    try {
      const userInfoData = req.header('user-info');

      if (userInfoData) {
        const parsedInfo = JSON.parse(userInfoData) as Record<string, any>;

        _.set(req.headers, 'user-info', parsedInfo);

        handleUserInfo?.(parsedInfo, req);
      }
    } catch (e) {
      Log.error('Failed parse user info', e);
    }

    // set user ip
    if (clientIp) {
      _.set(req.headers, 'user-info.ipAddress', clientIp);
    }

    next();
  };

export default userInfo;
