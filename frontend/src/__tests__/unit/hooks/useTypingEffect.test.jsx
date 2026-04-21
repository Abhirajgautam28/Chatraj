import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useTypingEffect from '../../../hooks/useTypingEffect';

describe('useTypingEffect Hook', () => {
  it('types out text over time', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTypingEffect('Hello', 50));

    expect(result.current.typedText).toBe('');

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.typedText).toBe('H');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.typedText).toBe('Hello');
    expect(result.current.isDone).toBe(true);

    vi.useRealTimers();
  });
});
