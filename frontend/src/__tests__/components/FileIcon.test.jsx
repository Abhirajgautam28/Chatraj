import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FileIcon from '../../components/FileIcon';

describe('FileIcon Component', () => {
  it('renders correctly for known extensions', () => {
    const { container } = render(<FileIcon filename="test.js" />);
    expect(container.querySelector('.ri-javascript-fill')).toBeDefined();
  });

  it('renders default icon for unknown extensions', () => {
    const { container } = render(<FileIcon filename="test.unknown" />);
    expect(container.querySelector('.ri-file-3-line')).toBeDefined();
  });
});
