import { createLogger, format, transports } from 'winston';

const Log = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: {},
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.errors({ stack: true }),
        format.printf((info) => `${info.level} ${info.message}`),
      ),
    }),
  ],
});

export default Log;
