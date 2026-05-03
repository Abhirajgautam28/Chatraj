import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVisibility } from '../../../hooks/useVisibility';

describe('useVisibility Hook', () => {
  it('initializes with visible false', () => {
    const mockRef = { current: document.createElement('div') };
    const { result } = renderHook(() => useVisibility(mockRef));
    expect(result.current).toBe(false);
  });
});
