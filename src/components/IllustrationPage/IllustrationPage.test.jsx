import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IllustrationPage from './IllustrationPage';
import { createClient } from '@supabase/supabase-js';

// Мокаем Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
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

  test('рендерит состояние загрузки изначально', async () => {
    mockSupabase.from().select().eq.mockReturnValue({
      data: [],
      error: null,
    });
    render(<IllustrationPage />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });
  });

  test('отображает состояние ошибки при сбое Supabase', async () => {
    mockSupabase.from().select().eq.mockReturnValue({
      data: null,
      error: { message: 'Ошибка базы данных' },
    });

    render(<IllustrationPage />);

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки вакансий: Ошибка базы данных')).toBeInTheDocument();
    });
  });

  test('отображает сообщение об отсутствии вакансий', async () => {
    mockSupabase.from().select().eq.mockReturnValue({
      data: [],
      error: null,
    });
    mockSupabase.from().select.mockReturnValue({
      data: [],
      error: null,
    });

    render(<IllustrationPage />);

    await waitFor(() => {
      expect(screen.getByText('Вакансий в категории Иллюстрация пока нет.')).toBeInTheDocument();
    });
  });

  test('рендерит карточки вакансий с правильными данными', async () => {
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

    mockSupabase.from().select().eq.mockReturnValue({
      data: mockJobs,
      error: null,
    });
    mockSupabase.from().select().eq().single.mockReturnValue({
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

  test('обрабатывает клик по кнопке "Откликнуться" с валидной Telegram-ссылкой', async () => {
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

    mockSupabase.from().select().eq.mockReturnValue({
      data: mockJobs,
      error: null,
    });
    mockSupabase.from().select().eq().single.mockReturnValue({
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

  test('обрабатывает клик по кнопке "Откликнуться" без Telegram-ссылки', async () => {
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

    mockSupabase.from().select().eq.mockReturnValue({
      data: mockJobs,
      error: null,
    });
    mockSupabase.from().select().eq().single.mockReturnValue({
      data: mockUser,
      error: null,
    });

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

  test('корректно обрабатывает невалидные даты', async () => {
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

    mockSupabase.from().select().eq.mockReturnValue({
      data: mockJobs,
      error: null,
    });
    mockSupabase.from().select().eq().single.mockReturnValue({
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
