import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

describe('Header', () => {
  test('рендерит компонент и основные элементы', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByAltText('Logo')).toBeInTheDocument();

    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Контакты')).toBeInTheDocument();
    expect(screen.getByText('Иллюстрация')).toBeInTheDocument();

    expect(screen.getByText('Войти/Регистрация')).toBeInTheDocument();
  });
});
