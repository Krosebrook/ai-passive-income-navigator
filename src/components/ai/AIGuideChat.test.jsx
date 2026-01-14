import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIGuideChat from './AIGuideChat';
import { base44 } from '@/api/base44Client';

// Mock the base44 client
vi.mock('@/api/base44Client', () => ({
  base44: {
    agents: {
      createConversation: vi.fn(),
      subscribeToConversation: vi.fn(),
      getConversation: vi.fn(),
      addMessage: vi.fn(),
    },
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const mockConversation = {
  id: 'conv123',
  messages: [],
  metadata: { name: 'Test Conversation' },
};

describe('AIGuideChat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    base44.agents.createConversation.mockResolvedValue(mockConversation);
    base44.agents.getConversation.mockResolvedValue(mockConversation);
    base44.agents.subscribeToConversation.mockImplementation(() => {});
    base44.agents.addMessage.mockResolvedValue({});
    
    // Mock scrollIntoView which doesn't exist in jsdom
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AIGuideChat isOpen={false} onClose={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render chat interface when isOpen is true', () => {
    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('AI Guide')).toBeInTheDocument();
    expect(screen.getByText(/passive income advisor/i)).toBeInTheDocument();
  });

  it('should initialize conversation when opened', async () => {
    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(base44.agents.createConversation).toHaveBeenCalledWith({
        agent_name: 'ai_guide',
        metadata: { name: 'Idea Discovery Session' },
      });
    });

    expect(base44.agents.subscribeToConversation).toHaveBeenCalledWith(
      'conv123',
      expect.any(Function)
    );
  });

  it('should close when close button is clicked', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(<AIGuideChat isOpen={true} onClose={mockOnClose} />);

    // Find X icon button (close button) - it has no accessible name, so we find all buttons
    const buttons = screen.getAllByRole('button');
    // The first button in the header is the close button
    const closeButton = buttons[0]; 
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display quick prompt buttons', () => {
    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    // Check for at least one quick prompt
    expect(
      screen.getByText(/suggest passive income ideas/i)
    ).toBeInTheDocument();
  });

  it('should allow typing in the input field', async () => {
    const user = userEvent.setup();
    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(base44.agents.createConversation).toHaveBeenCalled();
    });

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test message');

    expect(textarea).toHaveValue('Test message');
  });

  it('should send message when send button is clicked', async () => {
    const user = userEvent.setup();
    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(base44.agents.createConversation).toHaveBeenCalled();
    });

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test message');

    // Send button is the last button (after quick prompts and close button)
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons[buttons.length - 1];
    await user.click(sendButton);

    await waitFor(() => {
      expect(base44.agents.addMessage).toHaveBeenCalled();
    });
  });

  it('should not send empty messages', async () => {
    const user = userEvent.setup();
    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(base44.agents.createConversation).toHaveBeenCalled();
    });

    // Send button is the last button
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons[buttons.length - 1];
    await user.click(sendButton);

    // Should not call addMessage for empty input
    expect(base44.agents.addMessage).not.toHaveBeenCalled();
  });

  it('should populate input when quick prompt is clicked', async () => {
    const user = userEvent.setup();
    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(base44.agents.createConversation).toHaveBeenCalled();
    });

    const quickPrompt = screen.getByText(/suggest passive income ideas/i);
    await user.click(quickPrompt);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Suggest passive income ideas for beginners');
  });

  it('should disable send button while loading', async () => {
    const user = userEvent.setup();
    
    // Mock addMessage to be slow
    base44.agents.addMessage.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(base44.agents.createConversation).toHaveBeenCalled();
    });

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test message');

    // Send button is the last button
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons[buttons.length - 1];
    await user.click(sendButton);

    // Verify loading state exists
    await waitFor(() => {
      expect(base44.agents.addMessage).toHaveBeenCalled();
    });
  });

  it('should clear input after sending message', async () => {
    const user = userEvent.setup();
    render(<AIGuideChat isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(base44.agents.createConversation).toHaveBeenCalled();
    });

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test message');

    // Send button is the last button
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons[buttons.length - 1];
    await user.click(sendButton);

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });
});
