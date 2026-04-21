import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import DarkModeToggle from '../../components/DarkModeToggle';
import { ThemeContext } from '../../context/theme.context';
import { BrowserRouter } from 'react-router-dom';

describe('DarkModeToggle Component', () => {
  test('should render toggle button', () => {
    const mockContext = {
      isDarkMode: false,
      toggleThemeGlobal: vi.fn(),
    };
    render(
      <BrowserRouter>
        <ThemeContext.Provider value={mockContext}>
          <DarkModeToggle />
        </ThemeContext.Provider>
      </BrowserRouter>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
