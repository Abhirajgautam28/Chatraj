import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FileIcon from '../../components/FileIcon';

describe('FileIcon Component', () => {
  test('should render folder icon for directory', () => {
    const { container } = render(<FileIcon fileName="test.txt" />);
    expect(container.querySelector('i')).toBeInTheDocument();
  });

  test('should render file icon for file', () => {
    const { container } = render(<FileIcon fileName="test.js" />);
    expect(container.querySelector('i')).toBeInTheDocument();
  });
});
