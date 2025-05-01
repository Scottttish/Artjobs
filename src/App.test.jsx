import { render, screen } from '@testing-library/react';
import App from './App';

// Мокаем react-slick, чтобы избежать ошибки matchMedia
jest.mock('react-slick', () => {
  return function MockSlider({ children }) {
    return <div data-testid="mock-slider">{children}</div>;
  };
});

// Мокаем GLTFLoader, чтобы избежать ошибки с ES-модулями
jest.mock('three/examples/jsm/loaders/GLTFLoader.js', () => {
  return {
    GLTFLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn(),
    })),
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
