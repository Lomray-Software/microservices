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
    // @TODO add implementation https://www.npmjs.com/package/winston-loki
  ],
});

export default Log;
