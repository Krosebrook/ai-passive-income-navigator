import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  it('should render search input with placeholder', () => {
    const mockOnChange = vi.fn();
    
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder="Search ideas..." 
      />
    );

    const input = screen.getByPlaceholderText('Search ideas...');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'test query');

    // Should be called once for each character typed
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('t');
  });

  it('should display clear button when value is not empty', () => {
    const mockOnChange = vi.fn();
    
    render(<SearchBar value="test query" onChange={mockOnChange} />);

    // Clear button should be visible
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not display clear button when value is empty', () => {
    const mockOnChange = vi.fn();
    
    render(<SearchBar value="" onChange={mockOnChange} />);

    // Clear button should not be visible
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('should call onChange with empty string when clear button is clicked', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    
    render(<SearchBar value="test query" onChange={mockOnChange} />);

    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should accept custom placeholder', () => {
    const mockOnChange = vi.fn();
    
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder="Custom placeholder text" 
      />
    );

    expect(screen.getByPlaceholderText('Custom placeholder text')).toBeInTheDocument();
  });

  it('should display current value in input', () => {
    const mockOnChange = vi.fn();
    
    render(<SearchBar value="my search query" onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('my search query');
    expect(input).toBeInTheDocument();
  });
});
