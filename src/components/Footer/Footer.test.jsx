import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Footer from './Footer';
import { sendToTelegram } from '../services/telegram';

jest.mock('../services/telegram'); 

beforeAll(() => {
  window.alert = jest.fn(); 
});

describe('Footer', () => {
  test('открывает и закрывает модальное окно', () => {
    render(<Footer />);

    fireEvent.click(screen.getByRole('button', { name: /Обратная связь/i }));
    expect(screen.getByText(/Обратная связь/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText(/Ваше имя/i)).not.toBeInTheDocument();
  });

  test('успешно отправляет сообщение при валидном email', async () => {
    render(<Footer />);

    fireEvent.change(screen.getByLabelText(/Имя/i), {
      target: { value: 'Алия' },
    });
    fireEvent.change(screen.getByLabelText(/Почта/i), {
      target: { value: 'aliya@mail.com' },
    });
    fireEvent.change(screen.getByLabelText(/Сообщение/i), {
      target: { value: 'Привет!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Отправить/i }));

    await waitFor(() => {
      expect(sendToTelegram).toHaveBeenCalledWith('Алия', 'aliya@mail.com', 'Привет!');
    });
  });
});
