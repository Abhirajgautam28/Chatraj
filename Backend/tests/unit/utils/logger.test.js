import logger from '../../../utils/logger.js';

describe('Logger Utility', () => {
    let spyInfo, spyError;

    beforeEach(() => {
        spyInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
        spyError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        spyInfo.mockRestore();
        spyError.mockRestore();
    });

    test('logger.info should call console.info in non-test env', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        logger.info('test message');
        expect(spyInfo).toHaveBeenCalledWith('[INFO]', 'test message');
        process.env.NODE_ENV = originalEnv;
    });

    test('logger.error should always call console.error', () => {
        logger.error('err');
        expect(spyError).toHaveBeenCalledWith('[ERROR]', 'err');
    });
});
