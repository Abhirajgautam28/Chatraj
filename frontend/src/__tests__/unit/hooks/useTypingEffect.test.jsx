import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import useTypingEffect from '../../../hooks/useTypingEffect';

describe('useTypingEffect Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should type text sequentially', () => {
    const { result } = renderHook(() => useTypingEffect('Hello', 100));

    expect(result.current).toBe('');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('H');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('He');
  });
});
