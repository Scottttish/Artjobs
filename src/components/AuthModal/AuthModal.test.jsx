import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModal from './AuthModal';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      }),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  })),
}));

describe('AuthModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form by default', () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    expect(screen.getByText('Создайте Свой Аккаунт')).toBeInTheDocument();
    expect(screen.getByText('Добро пожаловать. Пожалуйста, введите ваши данные')).toBeInTheDocument();
    expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument();
    expect(screen.getByLabelText('Роль')).toBeInTheDocument();
  });

  test('switches to login form when clicking login link', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const loginLink = screen.getByText('Войти');
    await userEvent.click(loginLink);
    
    expect(screen.getByText('Вход в Аккаунт')).toBeInTheDocument();
    expect(screen.getByText('Введите почту и пароль для входа')).toBeInTheDocument();
    expect(screen.queryByLabelText('Имя пользователя')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Роль')).not.toBeInTheDocument();
  });

  test('validates email input', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const emailInput = screen.getByLabelText('Почта');
    await userEvent.type(emailInput, 'invalid-email');
    
    expect(emailInput).toHaveClass('invalid');
    
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'valid@example.com');
    
    expect(emailInput).toHaveClass('valid');
  });

  test('shows password strength indicator', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const passwordInput = screen.getByLabelText('Пароль');
    await userEvent.type(passwordInput, 'weak');
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle('background-color: red');
    
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'StrongP@ssw0rd');
    
    expect(progressBar).toHaveStyle('background-color: green');
  });

  test('validates password match', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const passwordInput = screen.getByLabelText('Пароль');
    const confirmPasswordInput = screen.getByLabelText('Повторить пароль');
    
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password124');
    
    expect(confirmPasswordInput).toHaveClass('invalid');
    
    await userEvent.clear(confirmPasswordInput);
    await userEvent.type(confirmPasswordInput, 'password123');
    
    expect(confirmPasswordInput).toHaveClass('valid');
  });

  test('displays error for invalid registration', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    await userEvent.click(submitButton);
    
    expect(screen.getByText('Введите корректный email')).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText('Почта');
    await userEvent.type(emailInput, 'valid@example.com');
    await userEvent.click(submitButton);
    
    expect(screen.getByText('Выберите роль')).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    const mockSupabase = createClient();
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: '123' } } },
      error: null,
    });
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    });
    mockSupabase.from().insert.mockResolvedValue({ error: null });
    
    render(<AuthModal onClose={mockOnClose} />);
    
    const emailInput = screen.getByLabelText('Почта');
    const passwordInput = screen.getByLabelText('Пароль');
    const confirmPasswordInput = screen.getByLabelText('Повторить пароль');
    const usernameInput = screen.getByLabelText('Имя пользователя');
    const roleSelect = screen.getByLabelText('Роль');
    const checkbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'StrongP@ssw0rd');
    await userEvent.type(confirmPasswordInput, 'StrongP@ssw0rd');
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.selectOptions(roleSelect, 'artist');
    await userEvent.click(checkbox);
    
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Регистрация успешна!');
      expect(mockOnClose).toHaveBeenCalled();
    });
    
    alertSpy.mockRestore();
  });

  test('handles successful login', async () => {
    const mockSupabase = createClient();
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });
    
    render(<AuthModal onClose={mockOnClose} />);
    
    const loginLink = screen.getByText('Войти');
    await userEvent.click(loginLink);
    
    const emailInput = screen.getByLabelText('Почта');
    const passwordInput = screen.getByLabelText('Пароль');
    const checkbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: 'Войти' });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(checkbox);
    
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Вход успешен!');
      expect(mockOnClose).toHaveBeenCalled();
    });
    
    alertSpy.mockRestore();
  });

  test('closes modal when close button is clicked', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: '×' });
    await userEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});

beforeAll(() => {
  const progressBar = document.createElement('div');
  progressBar.setAttribute('data-testid', 'progress-bar');
  document.body.appendChild(progressBar);
});
