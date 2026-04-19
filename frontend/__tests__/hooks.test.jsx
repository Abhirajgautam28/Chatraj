import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import useDarkMode from '../src/hooks/useDarkMode';

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  test('should initialize with light mode by default', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current[0]).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('should toggle dark mode', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('blog_dark_mode')).toBe('true');
  });
});
