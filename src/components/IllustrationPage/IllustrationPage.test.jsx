import { render, screen, fireEvent } from '@testing-library/react';
import IllustrationPage from 'src/components/IllustrationPage/IllustrationPage.jsx';  
import '@testing-library/jest-dom';

jest.mock('react-slick', () => ({ children }) => <div data-testid="slider">{children}</div>);

describe('IllustrationPage', () => {
  it('должен рендерить компонент HeroSection', () => {
    render(<IllustrationPage />);

    const slider = screen.getByTestId('slider');
    expect(slider).toBeInTheDocument();

    const slides = slider.querySelectorAll('.HeroSection-slide');
    expect(slides).toHaveLength(3);
  });

  it('должен отображать карточки на странице IllustrationPage', () => {
    render(<IllustrationPage />);

    const cards = screen.getAllByTestId('HeroSection-card');
    expect(cards).toHaveLength(4);

    cards.forEach((card) => {
      expect(card.querySelector('img')).toHaveAttribute('alt');
      expect(card.querySelector('h3')).toBeInTheDocument();
      expect(card.querySelector('p')).toBeInTheDocument();
    });
  });

  it('должен содержать правильные тексты и ссылки', () => {
    render(<IllustrationPage />);

    const slideTexts = [
      'Тираж(ы) 2025: Европейский фестиваль молодой фотографии в Le Centquatre',
      'Ярмарка искусства Art Paris 2025: бессмертие и культурные границы',
      'Международный фестиваль «Планета Искусств» в Казани: конкурс и награды',
    ];

    slideTexts.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    const cardTitles = [
      'Дегенеративное искусство: взгляд в прошлое',
      'Павел Трубецкой: скульптор и князь',
      'Социальное искусство как инструмент перемен',
      'NFT и цифровое искусство: тренд или пузырь?',
    ];

    cardTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('должен иметь правильные alt-атрибуты для изображений', () => {
    render(<IllustrationPage />);

    const slides = screen.getAllByAltText(/Slide/);
    expect(slides).toHaveLength(3);

    const cards = screen.getAllByAltText(/Card/);
    expect(cards).toHaveLength(4);
  });

  it('должен переключать слайды при клике', () => {
    render(<IllustrationPage />);

    const slider = screen.getByTestId('slider');

    let currentSlide = slider.querySelector('.HeroSection-slide');
    expect(currentSlide).toHaveTextContent('Тираж(ы) 2025: Европейский фестиваль молодой фотографии в Le Centquatre');

    fireEvent.click(screen.getByTestId('next-slide-button'));

    currentSlide = slider.querySelector('.HeroSection-slide');
    expect(currentSlide).toHaveTextContent('Ярмарка искусства Art Paris 2025: бессмертие и культурные границы');
  });
});
