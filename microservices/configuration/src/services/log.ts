import winston from 'winston';
import { IS_PROD, MS_NAME } from '@constants/index';

const Log = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: MS_NAME },
  transports: [
    ...(!IS_PROD ? [new winston.transports.Console({ format: winston.format.simple() })] : []),
  ],
});

export default Log;
