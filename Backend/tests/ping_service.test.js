import pingService from '../services/ping.service.js';
import https from 'https';

jest.mock('https');

describe('Ping Service', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should ping the url at intervals', () => {
        const url = 'https://example.com';
        const mockGet = jest.fn().mockReturnValue({
            on: jest.fn().mockReturnThis()
        });
        https.get = mockGet;

        pingService(url);

        expect(mockGet).not.toHaveBeenCalled();

        jest.advanceTimersByTime(840000);

        expect(mockGet).toHaveBeenCalledWith(url, expect.any(Function));
    });
});
