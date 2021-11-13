import winston from 'winston';
import { IS_TEST, MS_NAME } from '@constants/index';

const Log = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: MS_NAME },
  transports: [
    ...(!IS_TEST
      ? [
          new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
          }),
        ]
      : []),
  ],
});

export default Log;
