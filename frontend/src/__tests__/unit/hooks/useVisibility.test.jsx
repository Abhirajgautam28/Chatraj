import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useVisibility from '../../../hooks/useVisibility';

describe('useVisibility Hook', () => {
  it('initializes with visible true', () => {
    const { result } = renderHook(() => useVisibility());
    expect(result.current.visible).toBe(true);
  });

  it('toggles visibility', () => {
    const { result } = renderHook(() => useVisibility());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.visible).toBe(false);
  });
});
