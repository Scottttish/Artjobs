import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

test('Header рендерится без ошибок', () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
});

test('Присутствует ссылка "Главная"', () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  expect(screen.getByText('Главная')).toBeInTheDocument();
});

test('Присутствует ссылка "Контакты"', () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  expect(screen.getByText('Контакты')).toBeInTheDocument();
});
