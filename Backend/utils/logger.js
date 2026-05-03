import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.level = 'debug';
}

export { logger };
