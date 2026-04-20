import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDarkMode from '../../../hooks/useDarkMode';

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to false if no localStorage', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('toggles dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => {
      result.current.setIsDarkMode(true);
    });
    expect(result.current.isDarkMode).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
