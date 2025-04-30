import { render, screen } from '@testing-library/react';
import HeroSection from './HeroSection.jsx';
import Slider from 'react-slick';

jest.mock('react-slick', () => {
  return jest.fn(() => <div data-testid="slider" />);
});

describe('HeroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('рендерит компонент HeroSection корректно', () => {
    render(<HeroSection />);
    
    const sectionElement = screen.getByRole('region', { name: /hero section/i });
    expect(sectionElement).toBeInTheDocument();
  });

  test('рендерит правильное количество карточек', () => {
    render(<HeroSection />);
    
    const cardImages = screen.getAllByRole('img', { name: /Card \d/ });
    expect(cardImages).toHaveLength(4);
  });

  test('отображает правильный контент карточек', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Дегенеративное искусство: взгляд в прошлое')).toBeInTheDocument();
    expect(screen.getByText('By Art-Minded')).toBeInTheDocument();
  });

  test('рендерит изображения с правильным alt-текстом', () => {
    render(<HeroSection />);
    
    const cardImage = screen.getByRole('img', { name: 'Card 1' });
    expect(cardImage).toBeInTheDocument();
  });
});
