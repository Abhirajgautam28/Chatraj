import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Logger Utility', () => {
  let logger;

  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('Development Environment', () => {
    beforeEach(async () => {
      vi.resetModules();
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('PROD', false);
      const module = await import('../../../utils/logger.js');
      logger = module.logger;
    });

    test('should log info messages', () => {
      logger.info('test message');
      expect(console.info).toHaveBeenCalledWith('[INFO]', 'test message');
    });

    test('should log error messages', () => {
      logger.error('error message');
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'error message');
    });

    test('should log warn messages', () => {
      logger.warn('warn message');
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'warn message');
    });

    test('should log debug messages', () => {
      logger.debug('debug message');
      expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'debug message');
    });
  });

  describe('Production Environment', () => {
    beforeEach(async () => {
      vi.resetModules();
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('PROD', true);
      const module = await import('../../../utils/logger.js');
      logger = module.logger;
    });

    test('should not log info messages', () => {
      logger.info('test message');
      expect(console.info).not.toHaveBeenCalled();
    });

    test('should log error messages', () => {
      logger.error('error message');
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'error message');
    });

    test('should log warn messages', () => {
      logger.warn('warn message');
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'warn message');
    });

    test('should not log debug messages', () => {
      logger.debug('debug message');
      expect(console.debug).not.toHaveBeenCalled();
    });
  });
});
