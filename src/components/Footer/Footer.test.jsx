import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Footer from './Footer';
import '@testing-library/jest-dom';
jest.mock('../TelegramMessages/TelegramMessages');

import { sendToTelegram } from '../TelegramMessages/TelegramMessages';

describe('Footer', () => {
  it('открывает и закрывает модальное окно', () => {
    render(<Footer />);
    fireEvent.click(screen.getByText(/Обратная связь/i));
    expect(screen.getByText(/Обратная связь/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText(/Ваше имя/i)).not.toBeInTheDocument();
  });

  it('показывает ошибку при неверном email и не вызывает sendToTelegram', async () => {
    render(<Footer />);
    fireEvent.click(screen.getByText(/Обратная связь/i));

    fireEvent.change(screen.getByLabelText(/Имя/i), { target: { value: 'Алия' } });
    fireEvent.change(screen.getByLabelText(/Почта/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/Сообщение/i), { target: { value: 'Привет' } });

    fireEvent.click(screen.getByText(/Отправить/i));

    await waitFor(() => {
      expect(sendToTelegram).not.toHaveBeenCalled();
    });
  });

  it('успешно отправляет сообщение при валидном email', async () => {
    render(<Footer />);
    fireEvent.click(screen.getByText(/Обратная связь/i));

    fireEvent.change(screen.getByLabelText(/Имя/i), { target: { value: 'Алия' } });
    fireEvent.change(screen.getByLabelText(/Почта/i), { target: { value: 'aliya@mail.com' } });
    fireEvent.change(screen.getByLabelText(/Сообщение/i), { target: { value: 'Привет!' } });

    fireEvent.click(screen.getByText(/Отправить/i));

    await waitFor(() => {
      expect(sendToTelegram).toHaveBeenCalledWith('Алия', 'aliya@mail.com', 'Привет!');
    });
  });
});
