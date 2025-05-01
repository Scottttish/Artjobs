import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-slick', () => {
  return function MockSlider({ children }) {
    return <div data-testid="mock-slider">{children}</div>;
  };
});

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
