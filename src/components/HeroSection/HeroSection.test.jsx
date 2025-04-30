import { render, screen } from '@testing-library/react';
import HeroSection from './HeroSection';
import Slider from 'react-slick';

jest.mock('react-slick', () => {
  return jest.fn(({ children }) => <div data-testid="slider">{children}</div>);
});

describe('HeroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders HeroSection component correctly', () => {
    render(<HeroSection />);
    
    const sectionElement = screen.getByRole('region', { name: /home/i });
    expect(sectionElement).toBeInTheDocument();
  });

  test('renders correct number of slides', () => {
    render(<HeroSection />);
    
    const slideImages = screen.getAllByRole('img', { name: /Slide \d/ });
    expect(slideImages).toHaveLength(3);
  });

  test('displays correct slide content', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('современная фотография')).toBeInTheDocument();
    expect(screen.getByText('Тираж(ы) 2025: Европейский фестиваль молодой фотографии в Le Centquatre')).toBeInTheDocument();
    expect(screen.getByText('Sortir à Paris | 13.02.2025')).toBeInTheDocument();
  });

  test('renders correct number of cards', () => {
    render(<HeroSection />);
    
    const cardImages = screen.getAllByRole('img', { name: /Card \d/ });
    expect(cardImages).toHaveLength(4);
  });

  test('displays correct card content', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Дегенеративное искусство: взгляд в прошлое')).toBeInTheDocument();
    expect(screen.getByText('By Art-Minded')).toBeInTheDocument();
  });

  test('applies correct slider settings', () => {
    render(<HeroSection />);
    
    expect(Slider).toHaveBeenCalledWith(
      expect.objectContaining({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
      }),
      expect.anything()
    );
  });

  test('renders images with correct alt text', () => {
    render(<HeroSection />);
    
    const slideImage = screen.getByRole('img', { name: 'Slide 1' });
    expect(slideImage).toBeInTheDocument();
    
    const cardImage = screen.getByRole('img', { name: 'Card 1' });
    expect(cardImage).toBeInTheDocument();
  });
});
