import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from './AuthModal';

// Моким onClose для проверки закрытия модала
const mockOnClose = jest.fn();

describe('AuthModal', () => {
  test('рендерится корректно', () => {
    render(<AuthModal onClose={mockOnClose} />);
    expect(screen.getByText(/Создайте Свой Аккаунт/i)).toBeInTheDocument();
  });

  test('проверка на изменение email', () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const emailInput = screen.getByPlaceholderText(/Введите свою почту/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('проверка на некорректный email', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const emailInput = screen.getByPlaceholderText(/Введите свою почту/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const errorText = await screen.findByText(/Введите корректный email/i);
    expect(errorText).toBeInTheDocument();
  });

  test('проверка на совпадение паролей при регистрации', () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    const confirmPasswordInput = screen.getByPlaceholderText(/Повторить пароль/i);
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test('проверка на слабый пароль', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    
    const errorText = await screen.findByText(/Пароль слишком слабый/i);
    expect(errorText).toBeInTheDocument();
  });

  test('проверка на успешную регистрацию', async () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    // Заполняем поля
    fireEvent.change(screen.getByPlaceholderText(/Введите имя пользователя/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Введите свою почту/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), { target: { value: 'strongPassword123!' } });
    fireEvent.change(screen.getByPlaceholderText(/Повторить пароль/i), { target: { value: 'strongPassword123!' } });

    // Кликаем по кнопке "Зарегистрироваться"
    fireEvent.click(screen.getByText(/Зарегистрироваться/i));

    // Ожидаем, что не будет ошибок
    await waitFor(() => {
      expect(screen.queryByText(/Пароль слишком слабый/i)).toBeNull();
    });
  });

  test('проверка на переключение между формами регистрации и входа', () => {
    render(<AuthModal onClose={mockOnClose} />);
    
    // Проверяем начальный текст
    expect(screen.getByText(/Создайте Свой Аккаунт/i)).toBeInTheDocument();

    // Переключаем на форму входа
    fireEvent.click(screen.getByText(/Зарегистрируйтесь/i));

    // Проверяем, что текст изменился на форму входа
    expect(screen.getByText(/Вход в Аккаунт/i)).toBeInTheDocument();
  });
});
