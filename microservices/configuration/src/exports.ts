import * as DbConfig from '@config/db';
import * as MsConfig from '@config/ms';
import * as MsConstants from '@constants/index';
import Middleware from '@models/middleware';

export const Config = {
  ...MsConfig,
  ...DbConfig,
};

export const Constants = {
  ...MsConstants,
};

export const Models = {
  Middleware,
};
