import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDarkMode from '../../../hooks/useDarkMode';

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to false if no localStorage', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current[0]).toBe(false);
  });

  it('toggles dark mode', () => {
    const { result } = renderHook(() => useDarkMode('test_theme'));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('test_theme')).toBe('true');
  });
});
