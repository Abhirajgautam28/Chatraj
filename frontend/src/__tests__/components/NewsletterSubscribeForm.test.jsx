import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import NewsletterSubscribeForm from '../../components/NewsletterSubscribeForm';

describe('NewsletterSubscribeForm Component', () => {
  test('should render email input and subscribe button', () => {
    render(<NewsletterSubscribeForm />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  test('should update input value on change', () => {
    render(<NewsletterSubscribeForm />);
    const input = screen.getByPlaceholderText(/email/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input.value).toBe('test@example.com');
  });
});
