import * as DbConfig from '@config/db';
import * as MsConfig from '@config/ms';
import * as MsConstants from '@constants/index';
import ConfigEntity from '@entities/config';
import Middleware from '@entities/middleware';
import ConfigRepository from '@repositories/config-repository';
import Emitter from '@subscribers/emitter';

/**
 * Export microservice entities for build js library
 */

export const Config = {
  ...MsConfig,
  ...DbConfig,
};

export const Constants = {
  ...MsConstants,
};

export const Entities = {
  Middleware,
  Config: ConfigEntity,
};

export const Repositories = {
  ConfigRepository,
};

export const Subscribers = {
  Emitter,
};
