import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App'; // Revert to standard default import

// Mock fetch
global.fetch = jest.fn();

const mockMinister = { id: '1', name: 'Test Minister', info: 'Test Info' };
const mockMinisters = [
  { id: '1', name: 'Test Minister 1', info: 'Info 1' },
  { id: '2', name: 'Another Minister', info: 'Info 2' },
  { id: '3', name: 'Test Extra', info: 'Info 3' },
];

beforeEach(() => {
  // Reset fetch mock before each test
  (fetch as jest.Mock).mockClear();
  // Mock initial /api/get_ministers call if your App component makes one on load
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ([]), // Assuming it expects a minister list initially
  });
  // Mock initial getDynamicValue calls if necessary
  (fetch as jest.Mock).mockResolvedValueOnce({ // for current_minister_info
    ok: true,
    text: async () => ('Initial Info'),
  });
  (fetch as jest.Mock).mockResolvedValueOnce({ // for current_minister_name
    ok: true,
    text: async () => ('Initial Name'),
  });
   // Mock initial getCurrentSlideInfo call
   (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'Initial Slide Text' }),
  });
});

describe('App Component Autocomplete Feature', () => {
  test('renders search input', async () => {
    render(<App />);
    // Wait for initial fetches to resolve if they affect rendering
    await waitFor(() => expect(screen.getByPlaceholderText(/type to search for a minister/i)).toBeInTheDocument());
  });

  test('fetches and displays suggestions when user types', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockMinisters[0], mockMinisters[1]],
    });

    render(<App />);
    const searchInput = await screen.findByPlaceholderText(/type to search for a minister/i);
    await userEvent.type(searchInput, 'Test');

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/search_minister?q=Test', expect.any(Object));
      expect(screen.getByText(/Test Minister 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Another Minister/i)).toBeInTheDocument(); // This should not be present if "Test" is typed
    });
  });
  
  test('displays correct suggestions based on input', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockMinisters[0], mockMinisters[2]], // Only ministers matching "Test"
    });

    render(<App />);
    const searchInput = await screen.findByPlaceholderText(/type to search for a minister/i);
    await userEvent.type(searchInput, 'Test');

    await waitFor(() => {
      expect(screen.getByText(/Test Minister 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Extra/i)).toBeInTheDocument();
      expect(screen.queryByText(/Another Minister/i)).not.toBeInTheDocument();
    });
  });


  test('populates form fields when a suggestion is selected', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockMinister],
    });

    render(<App />);
    const searchInput = await screen.findByPlaceholderText(/type to search for a minister/i);
    await userEvent.type(searchInput, 'Test');

    const suggestionItem = await screen.findByText(/Test Minister/i);
    fireEvent.click(suggestionItem);

    await waitFor(() => {
      const infoInput = screen.getByDisplayValue('Test Info') as HTMLInputElement;
      const nameInput = screen.getByDisplayValue('Test Minister') as HTMLInputElement;
      expect(infoInput).toBeInTheDocument();
      expect(nameInput).toBeInTheDocument();
      expect(searchInput).toHaveValue(''); // Search input should be cleared
      expect(screen.queryByText(/Test Minister/i)).not.toBeInTheDocument(); // Suggestions list should disappear
    });
  });

  test('suggestions list disappears when input loses focus (blur)', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockMinister],
    });
    render(<App />);
    const searchInput = await screen.findByPlaceholderText(/type to search for a minister/i);
    await userEvent.type(searchInput, 'Test');

    await screen.findByText(/Test Minister/i); // Wait for suggestions to appear
    fireEvent.blur(searchInput);
    
    // It might take a moment for the suggestions to disappear due to the click-outside handler logic (mousedown)
    // For blur, it should be relatively quick if not for the setTimeout in the component logic
    await waitFor(() => {
        expect(screen.queryByText(/Test Minister/i)).not.toBeInTheDocument();
    });
  });

  test('shows no suggestions if API returns empty array', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [], // No suggestions
    });

    render(<App />);
    const searchInput = await screen.findByPlaceholderText(/type to search for a minister/i);
    await userEvent.type(searchInput, 'Unknown');

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/search_minister?q=Unknown', expect.any(Object));
    });
    // Check that no suggestion list items are rendered
    // The list itself (ul) might not be in the DOM if suggestions.length is 0
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('handles API error gracefully (shows no suggestions)', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false, // API error
      status: 500,
      json: async () => ({ error: 'Server Error' })
    });
  
    render(<App />);
    const searchInput = await screen.findByPlaceholderText(/type to search for a minister/i);
    // Need to make sure initial fetches are done before interacting
    await waitFor(() => expect(searchInput).toBeInTheDocument());
  
    await userEvent.type(searchInput, 'ErrorCase');
  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/search_minister?q=ErrorCase', expect.any(Object));
    });
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

});
