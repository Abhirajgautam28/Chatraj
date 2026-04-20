import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useVisibility } from '../../../hooks/useVisibility';

describe('useVisibility Hook', () => {
  test('should return false initially', () => {
    const ref = { current: document.createElement('div') };

    // Mock IntersectionObserver
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: mockObserve,
        disconnect: mockDisconnect
    }));

    const { result } = renderHook(() => useVisibility(ref));
    expect(result.current).toBe(false);
  });
});
