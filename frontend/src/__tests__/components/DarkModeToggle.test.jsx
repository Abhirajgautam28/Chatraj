import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import DarkModeToggle from '../../components/DarkModeToggle';

describe('DarkModeToggle Component', () => {
  test('should render toggle button', () => {
    render(<DarkModeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
