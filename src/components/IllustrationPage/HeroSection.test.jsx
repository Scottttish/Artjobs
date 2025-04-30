import { render, screen } from '@testing-library/react';
import HeroSection from './HeroSection';
import '@testing-library/jest-dom';

jest.mock('react-slick', () => ({ children }) => <div data-testid="slider">{children}</div>);

describe('Компонент HeroSection', () => {
  test('Отображаются заголовки всех слайдов', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Тираж\(ы\) 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Art Paris 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Планета Искусств/)).toBeInTheDocument();
  });

  test('На странице присутствует ровно 3 слайда', () => {
    render(<HeroSection />);
    const titles = screen.getAllByRole('heading', { level: 1 });
    expect(titles).toHaveLength(3);
  });

  test('На странице отображаются все 4 карточки с подписями и изображениями', () => {
    render(<HeroSection />);
    const subtitles = screen.getAllByText(/By/);
    expect(subtitles).toHaveLength(4);
    const images = screen.getAllByAltText(/Card \d+/);
    expect(images).toHaveLength(4);
  });

  test('Компонент содержит секцию с aria-label "Hero Section"', () => {
    render(<HeroSection />);
    expect(screen.getByLabelText('Hero Section')).toBeInTheDocument();
  });
});
