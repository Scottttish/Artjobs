import { render, screen } from '@testing-library/react';
import App from './App';

describe('Компонент App', () => {
  test('отображает Header и Footer', () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('отображает HomePage на маршруте "/"', () => {
    render(<App />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });
});
