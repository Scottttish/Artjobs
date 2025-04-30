import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IllustrationPage from './IllustrationPage';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  })),
}));

describe('IllustrationPage', () => {
  const mockSupabase = createClient();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'open').mockImplementation(() => {});
  });

  afterEach(() => {
    window.open.mockRestore();
  });

  test('renders loading state initially', async () => {
    mockSupabase.from().select().eq.mockReturnValueOnce({
      data: [],
      error: null,
    });
    render(<IllustrationPage />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });
  });

  test('displays error state when Supabase fetch fails', async () => {
    mockSupabase.from().select().eq.mockReturnValueOnce({
      data: null,
      error: { message: 'Database error' },
    });

    render(<IllustrationPage />);

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки вакансий: Database error')).toBeInTheDocument();
    });
  });

  test('displays no jobs message when no jobs are found', async () => {
    mockSupabase.from().select().eq.mockReturnValueOnce({
      data: [],
      error: null,
    });
    mockSupabase.from().select.mockReturnValueOnce({
      data: [],
      error: null,
    });

    render(<IllustrationPage />);

    await waitFor(() => {
      expect(screen.getByText('Вакансий в категории Иллюстрация пока нет.')).toBeInTheDocument();
    });
  });

  test('renders job cards with correct data', async () => {
    const mockJobs = [
      {
        id: 1,
        user_id: 'user1',
        title: 'Иллюстратор для книги',
        description: 'Создание иллюстраций для детской книги',
        published_at: '2025-01-01T00:00:00Z',
        start_date: '2025-02-01T00:00:00Z',
        end_date: '2025-03-01T00:00:00Z',
        price: 50000,
        status: 'open',
        category: 'Иллюстрация',
      },
    ];
    const mockUser = {
      username: 'TestUser',
      telegram_username: '@TestUserTG',
    };

    mockSupabase.from().select().eq.mockReturnValueOnce({
      data: mockJobs,
      error: null,
    });
    mockSupabase.from().select().eq().single.mockReturnValueOnce({
      data: mockUser,
      error: null,
    });

    render(<IllustrationPage />);

    await waitFor(() => {
      expect(screen.getByText('Иллюстратор для книги')).toBeInTheDocument();
      expect(screen.getByText('50,000 ₸')).toBeInTheDocument();
      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByText('Создание иллюстраций для детской книги')).toBeInTheDocument();
      expect(screen.getByText(/Срок выполнения: 28 дней/)).toBeInTheDocument();
      expect(screen.getByText(/Дата публикации: 1 января 2025/)).toBeInTheDocument();
    });
  });

  test('handles apply button click with valid Telegram link', async () => {
    const mockJobs = [
      {
        id: 1,
        user_id: 'user1',
        title: 'Иллюстратор для книги',
        description: 'Создание иллюстраций',
        published_at: '2025-01-01T00:00:00Z',
        start_date: '2025-02-01T00:00:00Z',
        end_date: '2025-03-01T00:00:00Z',
        price: 50000,
        status: 'open',
        category: 'Иллюстрация',
      },
    ];
    const mockUser = {
      username: 'TestUser',
      telegram_username: '@TestUserTG',
    };

    mockSupabase.from().select().eq.mockReturnValueOnce({
      data: mockJobs,
      error: null,
    });
    mockSupabase.from().select().eq().single.mockReturnValueOnce({
      data: mockUser,
      error: null,
    });

    render(<IllustrationPage />);

    await waitFor(() => {
      const applyButton = screen.getByRole('button', { name: 'Откликнуться' });
      fireEvent.click(applyButton);
      expect(window.open).toHaveBeenCalledWith('https://t.me/TestUserTG', '_blank');
    });
  });

  test('handles apply button click with missing Telegram link', async () => {
    const mockJobs = [
      {
        id: 1,
        user_id: 'user1',
        title: 'Иллюстратор для книги',
        description: 'Создание иллюстраций',
        published_at: '2025-01-01T00:00:00Z',
        start_date: '2025-02-01T00:00:00Z',
        end_date: '2025-03-01T00:00:00Z',
        price: 50000,
        status: 'open',
        category: 'Иллюстрация',
      },
    ];
    const mockUser = {
      username: 'TestUser',
      telegram_username: null,
    };

    mockSupabase.from().select().eq.mockReturnValueOnce({
      data: mockJobs,
      error: null,
    });
    mockSupabase.from().select().eq().single.mockReturnValueOnce({
      data: mockUser,
      error: null,
    });

    // Мокаем console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<IllustrationPage />);

    await waitFor(() => {
      const applyButton = screen.getByRole('button', { name: 'Откликнуться' });
      fireEvent.click(applyButton);
      expect(window.open).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Telegram link is not available for this job');
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles invalid dates gracefully', async () => {
    const mockJobs = [
      {
        id: 1,
        user_id: 'user1',
        title: 'Иллюстратор для книги',
        description: 'Создание иллюстраций',
        published_at: 'invalid-date',
        start_date: 'invalid-date',
        end_date: 'invalid-date',
        price: 50000,
        status: 'open',
        category: 'Иллюстрация',
      },
    ];
    const mockUser = {
      username: 'TestUser',
      telegram_username: '@TestUserTG',
    };

    mockSupabase.from().select().eq.mockReturnValueOnce({
      data: mockJobs,
      error: null,
    });
    mockSupabase.from().select().eq().single.mockReturnValueOnce({
      data: mockUser,
      error: null,
    });

    render(<IllustrationPage />);

    await waitFor(() => {
      expect(screen.getByText('Срок выполнения: Не указано')).toBeInTheDocument();
      expect(screen.getByText('Дата публикации: Не указано')).toBeInTheDocument();
    });
  });
});
