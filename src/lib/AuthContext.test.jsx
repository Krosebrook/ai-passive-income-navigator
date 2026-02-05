import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';

// Mock the base44 client
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn(),
      logout: vi.fn(),
      redirectToLogin: vi.fn(),
    },
  },
}));

// Mock app-params
vi.mock('@/lib/app-params', () => ({
  appParams: {
    appId: 'test-app-id',
    token: 'test-token',
  },
}));

// Mock axios client
vi.mock('@base44/sdk/dist/utils/axios-client', () => ({
  createAxiosClient: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({
      id: 'test-app-id',
      public_settings: {},
    }),
  })),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide auth context', () => {
    const TestComponent = () => {
      const auth = useAuth();
      return <div>{auth ? 'Auth Available' : 'No Auth'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Auth Available')).toBeInTheDocument();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    const TestComponent = () => {
      try {
        useAuth();
        return <div>Should not render</div>;
      } catch (error) {
        return <div>Error: {error.message}</div>;
      }
    };

    render(<TestComponent />);

    expect(
      screen.getByText(/useAuth must be used within an AuthProvider/i)
    ).toBeInTheDocument();

    console.error = originalError;
  });

  it('should load user when authenticated', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    };

    base44.auth.me.mockResolvedValue(mockUser);

    const TestComponent = () => {
      const { user, isAuthenticated, isLoadingAuth } = useAuth();
      
      if (isLoadingAuth) return <div>Loading...</div>;
      if (isAuthenticated) return <div>User: {user.name}</div>;
      return <div>Not authenticated</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Should show user after loading
    await waitFor(() => {
      expect(screen.getByText('User: Test User')).toBeInTheDocument();
    });
  });

  it('should handle authentication failure', async () => {
    base44.auth.me.mockRejectedValue({
      status: 401,
      message: 'Unauthorized',
    });

    const TestComponent = () => {
      const { isAuthenticated, isLoadingAuth, authError } = useAuth();
      
      if (isLoadingAuth) return <div>Loading...</div>;
      if (authError) return <div>Auth Error: {authError.type}</div>;
      if (!isAuthenticated) return <div>Not authenticated</div>;
      return <div>Authenticated</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should handle logout', async () => {
    const mockUser = { id: 'user123', name: 'Test User' };
    base44.auth.me.mockResolvedValue(mockUser);

    const TestComponent = () => {
      const { user, logout, isLoadingAuth } = useAuth();
      
      if (isLoadingAuth) return <div>Loading...</div>;
      
      return (
        <div>
          {user ? <div>User: {user.name}</div> : <div>No User</div>}
          <button onClick={() => logout(false)}>Logout</button>
        </div>
      );
    };

    const { getByRole } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: Test User')).toBeInTheDocument();
    });

    // Click logout - state updates will be handled by waitFor
    const logoutButton = getByRole('button', { name: /logout/i });
    logoutButton.click();

    await waitFor(() => {
      expect(base44.auth.logout).toHaveBeenCalled();
    });
  });

  it('should handle logout with redirect', async () => {
    const mockUser = { id: 'user123', name: 'Test User' };
    base44.auth.me.mockResolvedValue(mockUser);

    const TestComponent = () => {
      const { user, logout, isLoadingAuth } = useAuth();
      
      if (isLoadingAuth) return <div>Loading...</div>;
      
      return (
        <div>
          {user ? <div>User: {user.name}</div> : <div>No User</div>}
          <button onClick={() => logout(true)}>Logout with Redirect</button>
        </div>
      );
    };

    const { getByRole } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: Test User')).toBeInTheDocument();
    });

    const logoutButton = getByRole('button', { name: /logout with redirect/i });
    logoutButton.click();

    await waitFor(() => {
      expect(base44.auth.logout).toHaveBeenCalledWith(window.location.href);
    });
  });

  it('should handle outer catch block for unexpected errors', async () => {
    // Mock createAxiosClient to throw a non-structured error
    const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
    createAxiosClient.mockImplementation(() => {
      throw new Error('Completely unexpected error');
    });

    vi.resetModules();
    const { AuthProvider, useAuth } = await import('./AuthContext');

    const TestComponent = () => {
      const { authError, isLoadingPublicSettings } = useAuth();
      
      if (isLoadingPublicSettings) return <div>Loading settings...</div>;
      if (authError) {
        return <div>Error: {authError.message}</div>;
      }
      return <div>No Error</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should provide navigateToLogin function', async () => {
    const TestComponent = () => {
      const { navigateToLogin } = useAuth();
      return <button onClick={navigateToLogin}>Login</button>;
    };

    const { getByRole } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = getByRole('button', { name: /login/i });
    loginButton.click();

    await waitFor(() => {
      expect(base44.auth.redirectToLogin).toHaveBeenCalled();
    });
  });

  it('should handle user not registered error', async () => {
    // Mock the axios client to return user not registered error
    const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
    createAxiosClient.mockReturnValue({
      get: vi.fn().mockRejectedValue({
        status: 403,
        data: {
          extra_data: {
            reason: 'user_not_registered',
          },
        },
        message: 'User not registered',
      }),
    });

    const TestComponent = () => {
      const { authError, isLoadingPublicSettings } = useAuth();
      
      if (isLoadingPublicSettings) return <div>Loading settings...</div>;
      if (authError?.type === 'user_not_registered') {
        return <div>User Not Registered Error</div>;
      }
      return <div>No Error</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User Not Registered Error')).toBeInTheDocument();
    });
  });

  it('should handle auth required error', async () => {
    const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
    createAxiosClient.mockReturnValue({
      get: vi.fn().mockRejectedValue({
        status: 403,
        data: {
          extra_data: {
            reason: 'auth_required',
          },
        },
        message: 'Authentication required',
      }),
    });

    const TestComponent = () => {
      const { authError, isLoadingPublicSettings } = useAuth();
      
      if (isLoadingPublicSettings) return <div>Loading settings...</div>;
      if (authError?.type === 'auth_required') {
        return <div>Auth Required Error</div>;
      }
      return <div>No Error</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Auth Required Error')).toBeInTheDocument();
    });
  });

  it('should handle other 403 errors with reason', async () => {
    const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
    createAxiosClient.mockReturnValue({
      get: vi.fn().mockRejectedValue({
        status: 403,
        data: {
          extra_data: {
            reason: 'custom_error',
          },
        },
        message: 'Custom error message',
      }),
    });

    const TestComponent = () => {
      const { authError, isLoadingPublicSettings } = useAuth();
      
      if (isLoadingPublicSettings) return <div>Loading settings...</div>;
      if (authError?.type === 'custom_error') {
        return <div>Custom Error</div>;
      }
      return <div>No Error</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Error')).toBeInTheDocument();
    });
  });

  it('should handle non-403 errors', async () => {
    const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
    createAxiosClient.mockReturnValue({
      get: vi.fn().mockRejectedValue({
        status: 500,
        message: 'Server error',
      }),
    });

    const TestComponent = () => {
      const { authError, isLoadingPublicSettings } = useAuth();
      
      if (isLoadingPublicSettings) return <div>Loading settings...</div>;
      if (authError?.type === 'unknown') {
        return <div>Unknown Error</div>;
      }
      return <div>No Error</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Unknown Error')).toBeInTheDocument();
    });
  });

  it('should handle unexpected errors without message', async () => {
    const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
    createAxiosClient.mockReturnValue({
      get: vi.fn().mockRejectedValue(new Error()),
    });

    const TestComponent = () => {
      const { authError, isLoadingPublicSettings } = useAuth();
      
      if (isLoadingPublicSettings) return <div>Loading settings...</div>;
      if (authError) {
        return <div>Error Occurred</div>;
      }
      return <div>No Error</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error Occurred')).toBeInTheDocument();
    });
  });

  it('should handle case when no token is available', async () => {
    // Reset module cache and re-import with no token
    vi.resetModules();
    
    vi.doMock('@/lib/app-params', () => ({
      appParams: {
        appId: 'test-app-id',
        token: null, // No token
        functionsVersion: 'v1',
        appBaseUrl: 'https://test.base44.app',
      },
    }));

    const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
    createAxiosClient.mockReturnValue({
      get: vi.fn().mockResolvedValue({
        id: 'test-app-id',
        public_settings: {},
      }),
    });

    // Re-import AuthContext after mocking
    const { AuthProvider, useAuth } = await import('./AuthContext');

    const TestComponent = () => {
      const { isAuthenticated, isLoadingAuth } = useAuth();
      
      if (isLoadingAuth) return <div>Loading...</div>;
      return <div>Not Authenticated</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    });
    
    // Clean up
    vi.doUnmock('@/lib/app-params');
  });
});
