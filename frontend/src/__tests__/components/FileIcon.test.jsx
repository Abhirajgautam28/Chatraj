import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import FileIcon from '../../components/FileIcon';

describe('FileIcon Component', () => {
  test('should render folder icon for directory', () => {
    render(<FileIcon type="directory" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('should render file icon for file', () => {
    render(<FileIcon type="file" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
