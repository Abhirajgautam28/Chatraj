import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/project', state: undefined }),
  };
});

// Mock modules before importing the component to avoid heavy runtime dependencies
vi.mock('../../config/webContainer', () => ({ getWebContainer: vi.fn() }));
vi.mock('../../hooks/useWebContainer', () => ({ useWebContainer: () => ({ webContainer: null, iframeUrl: null, runProject: vi.fn(), isRunning: false, boot: vi.fn(), setIframeUrl: vi.fn() }) }));
vi.mock('../../hooks/useSocket', () => ({ useSocket: () => ({ on: vi.fn(), off: vi.fn(), emit: vi.fn() }) }));
const mockShowToast = vi.fn();
vi.mock('../../context/toast.context', () => ({ useToast: () => ({ showToast: mockShowToast }) }));
vi.mock('@uiw/react-codemirror', () => ({ default: (props) => null }));

import Project from '../Project';
import { UserContext } from '../../context/user.context';
import { ThemeContext } from '../../context/theme.context';

describe('Project route', () => {
  it('redirects to dashboard when no project provided in location.state', async () => {
    // react-router hooks are mocked at module scope

    render(
      <UserContext.Provider value={{ user: { _id: 'u1' } }}>
        <ThemeContext.Provider value={{ isDarkMode: false, setIsDarkMode: () => {} }}>
          <Project />
        </ThemeContext.Provider>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('No project selected', 'error');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
