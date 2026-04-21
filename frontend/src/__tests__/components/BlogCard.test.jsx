import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import BlogCard from '../../components/BlogCard';
import { BrowserRouter } from 'react-router-dom';

describe('BlogCard Component', () => {
  test('should render blog title and author name', () => {
    const mockBlog = {
      _id: '1',
      title: 'Test Blog',
      author: { firstName: 'John', lastName: 'Doe' },
      content: 'This is a test content that should be truncated if it is too long.',
      createdAt: new Date().toISOString(),
      likes: []
    };
    render(
      <BrowserRouter>
        <BlogCard blog={mockBlog} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Blog')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });
});
