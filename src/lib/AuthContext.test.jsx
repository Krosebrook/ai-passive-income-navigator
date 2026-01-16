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

    // Click logout
    const logoutButton = getByRole('button', { name: /logout/i });
    await act(async () => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(base44.auth.logout).toHaveBeenCalled();
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
    await act(async () => {
      loginButton.click();
    });

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
});
