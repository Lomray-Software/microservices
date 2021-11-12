const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';

const MS_NAME = process.env.MS_NAME || 'microservices-name';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
const MS_DISABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_DISABLE_REMOTE_MIDDLEWARE) || 0;

export { MS_NAME, MS_CONNECTION, MS_DISABLE_REMOTE_MIDDLEWARE, ENV, IS_PROD };
