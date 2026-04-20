import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import BlogCard from '../../components/BlogCard';

describe('BlogCard Component', () => {
  const mockBlog = {
    _id: '1',
    title: 'Test Blog',
    content: 'Test content',
    author: { firstName: 'John', lastName: 'Doe' },
    likes: [],
    comments: []
  };

  it('renders blog details correctly', () => {
    render(
      <BrowserRouter>
        <BlogCard blog={mockBlog} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Blog')).toBeDefined();
    expect(screen.getByText('By John Doe')).toBeDefined();
  });

  it('calls onLike when like button clicked', () => {
    const onLike = vi.fn();
    render(
      <BrowserRouter>
        <BlogCard blog={mockBlog} onLike={onLike} />
      </BrowserRouter>
    );
    const likeBtn = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeBtn);
    expect(onLike).toHaveBeenCalledWith('1');
  });
});
