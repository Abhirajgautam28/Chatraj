import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import NewsletterSubscribeForm from '../../components/NewsletterSubscribeForm';

describe('NewsletterSubscribeForm', () => {
  it('renders input and button', () => {
    render(<NewsletterSubscribeForm />);
    expect(screen.getByPlaceholder(/enter your email/i)).toBeDefined();
    expect(screen.getByText(/subscribe/i)).toBeDefined();
  });

  it('updates input value on change', () => {
    render(<NewsletterSubscribeForm />);
    const input = screen.getByPlaceholder(/enter your email/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input.value).toBe('test@example.com');
  });
});
