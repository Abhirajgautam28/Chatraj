
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders main app without crashing', () => {
  render(<App />);
  expect(screen.getByText(/Sign up|Login|Welcome|Dashboard|Home/i)).toBeInTheDocument();
});
