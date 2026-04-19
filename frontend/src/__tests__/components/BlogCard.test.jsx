import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BlogCard from '../../components/BlogCard';

describe('BlogCard Component', () => {
  const mockBlog = {
    _id: '1',
    title: 'Test Blog',
    content: 'This is a test content that should be truncated if it is too long.',
    author: { firstName: 'John', lastName: 'Doe' },
    createdAt: new Date().toISOString()
  };

  test('should render blog title and author name', () => {
    render(
      <BrowserRouter>
        <BlogCard blog={mockBlog} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Blog')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });
});
