import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Footer from './Footer';

jest.mock('../TelegramMessages/TelegramMessages', () => ({
  sendToTelegram: jest.fn().mockResolvedValue(true),
}));

describe('Footer component', () => {
  test('opens and closes feedback modal', () => {
    render(<Footer />);
    const feedbackButton = screen.getByText(/обратная связь/i);
    fireEvent.click(feedbackButton);
    expect(screen.getByText(/обратная связь/i)).toBeInTheDocument();

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    expect(screen.queryByPlaceholderText(/ваше сообщение/i)).not.toBeInTheDocument();
  });

  test('submits feedback form successfully', async () => {
    render(<Footer />);
    fireEvent.click(screen.getByText(/обратная связь/i));

    fireEvent.change(screen.getByPlaceholderText(/ваше имя/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ваша почта/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ваше сообщение/i), {
      target: { value: 'Test message' },
    });

    fireEvent.click(screen.getByText(/отправить/i));

    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/ваше сообщение/i)).not.toBeInTheDocument()
    );
  });
});
