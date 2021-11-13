import { createLogger, format, transports } from 'winston';
import { IS_TEST, MS_NAME } from '@constants/index';

const Log = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: MS_NAME },
  transports: [
    ...(!IS_TEST
      ? [
          new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
          }),
        ]
      : []),
  ],
});

export default Log;
