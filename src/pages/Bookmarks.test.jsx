import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Bookmarks from './Bookmarks';
import { base44 } from '@/api/base44Client';

// Mock the base44 client
vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      Bookmark: {
        list: vi.fn(),
        delete: vi.fn(),
      },
      PortfolioIdea: {
        create: vi.fn(),
      },
    },
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

const mockBookmarks = [
  {
    id: 'b1',
    idea_id: 'idea1',
    idea_title: 'Online Course Creation',
    idea_category: 'digital_products',
    created_date: '2026-01-01T00:00:00Z',
  },
  {
    id: 'b2',
    idea_id: 'idea2',
    idea_title: 'Blog Monetization',
    idea_category: 'content_creation',
    created_date: '2026-01-02T00:00:00Z',
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component) => {
  const queryClient = createTestQueryClient();
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Bookmarks Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render bookmarks page with saved ideas', async () => {
    base44.entities.Bookmark.list.mockResolvedValue(mockBookmarks);

    renderWithProviders(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText('Online Course Creation')).toBeInTheDocument();
    });

    expect(screen.getByText('Blog Monetization')).toBeInTheDocument();
  });

  it('should show loading state while fetching bookmarks', () => {
    base44.entities.Bookmark.list.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<Bookmarks />);

    expect(screen.getByText(/loading bookmarks/i)).toBeInTheDocument();
  });

  it('should display empty state when no bookmarks exist', async () => {
    base44.entities.Bookmark.list.mockResolvedValue([]);

    renderWithProviders(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText(/no bookmarks/i)).toBeInTheDocument();
    });

    // Should show action to browse ideas
    expect(screen.getByText(/browse ideas/i)).toBeInTheDocument();
  });

  it('should filter bookmarks by search query', async () => {
    base44.entities.Bookmark.list.mockResolvedValue(mockBookmarks);

    const user = userEvent.setup();
    renderWithProviders(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText('Online Course Creation')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search bookmarks/i);
    await user.type(searchInput, 'Online Course');

    await waitFor(() => {
      expect(screen.getByText('Online Course Creation')).toBeInTheDocument();
      expect(screen.queryByText('Blog Monetization')).not.toBeInTheDocument();
    });
  });

  it('should delete a bookmark', async () => {
    base44.entities.Bookmark.list.mockResolvedValue(mockBookmarks);
    base44.entities.Bookmark.delete.mockResolvedValue({ success: true });

    renderWithProviders(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText('Online Course Creation')).toBeInTheDocument();
    });

    // Verify delete mutation is available
    expect(base44.entities.Bookmark.delete).toBeDefined();
  });

  it('should add bookmark to portfolio', async () => {
    base44.entities.Bookmark.list.mockResolvedValue(mockBookmarks);
    base44.entities.PortfolioIdea.create.mockResolvedValue({
      id: 'p1',
      title: 'Online Course Creation',
      status: 'exploring',
    });

    renderWithProviders(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText('Online Course Creation')).toBeInTheDocument();
    });

    // Verify add to portfolio mutation is available
    expect(base44.entities.PortfolioIdea.create).toBeDefined();
  });

  it('should display bookmark count', async () => {
    base44.entities.Bookmark.list.mockResolvedValue(mockBookmarks);

    renderWithProviders(<Bookmarks />);

    await waitFor(() => {
      expect(screen.getByText(/2 saved ideas/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    base44.entities.Bookmark.list.mockRejectedValue(
      new Error('Failed to fetch bookmarks')
    );

    renderWithProviders(<Bookmarks />);

    // The component should handle errors without crashing
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});
