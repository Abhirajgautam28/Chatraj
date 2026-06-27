import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMockSocket = () => ({
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  id: 'socket-1'
});

const mockSocketFactory = vi.fn();

vi.mock('socket.io-client', () => ({
  default: mockSocketFactory
}));

describe('socket listener registration', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSocketFactory.mockReset();
  });

  it('attaches listeners registered before socket initialization', async () => {
    const mockSocket = createMockSocket();
    mockSocketFactory.mockReturnValue(mockSocket);

    const socketModule = await import('../../../config/socket');
    const callback = vi.fn();

    socketModule.receiveMessage('project-message', callback);
    socketModule.initializeSocket('project-123');

    expect(mockSocket.on).toHaveBeenCalledWith('project-message', callback);
  });
});
