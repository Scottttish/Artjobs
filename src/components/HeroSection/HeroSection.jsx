import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HeroSection.css';
import image1 from '../../assets/image1.jpg';
import image2 from '../../assets/image2.jpg';
import image3 from '../../assets/image3.jpg';
import card1 from '../../assets/card1.jpg';
import card2 from '../../assets/card2.jpg';
import card3 from '../../assets/card3.jpg';
import card4 from '../../assets/card4.jpg';

const slides = [
  {
    image: image1,
    subtitle1: 'современная фотография',
    title: 'Тираж(ы) 2025: Европейский фестиваль молодой фотографии в Le Centquatre',
    subtitle2: 'Sortir à Paris | 13.02.2025',
  },
  {
    image: image2,
    subtitle1: 'современное искусство',
    title: 'Ярмарка искусства Art Paris 2025: бессмертие и культурные границы',
    subtitle2: 'Коммерсантъ | 20.02.2025',
  },
  {
    image: image3,
    subtitle1: 'международный фестиваль, живопись',
    title: 'Международный фестиваль «Планета Искусств» в Казани: конкурс и награды',
    subtitle2: 'Art-Center.ru | 04.2025',
  },
];

const cards = [
  {
    image: card1,
    title: 'Дегенеративное искусство: взгляд в прошлое',
    subtitle: 'By Art-Minded',
  },
  {
    image: card2,
    title: 'Павел Трубецкой: скульптор и князь',
    subtitle: 'By Sortir à Paris',
  },
  {
    image: card3,
    title: 'Социальное искусство как инструмент перемен',
    subtitle: 'By ITBAI',
  },
  {
    image: card4,
    title: 'NFT и цифровое искусство: тренд или пузырь?',
    subtitle: 'By WorkShop VMS',
  },
];

function HeroSection() {
  const heroSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <section id="home" className="HeroSection" aria-label="Hero Section">
      <div className="HeroSection-slider">
        <Slider {...heroSettings}>
          {slides.map((slide, index) => (
            <div key={index} className="HeroSection-slide">
              <img src={slide.image} alt={`Slide ${index + 1}`} className="HeroSection-image" />
              <div className="HeroSection-text">
                <p className="HeroSection-subtitle1">{slide.subtitle1}</p>
                <h1 className="HeroSection-title">{slide.title}</h1>
                <p className="HeroSection-subtitle2">{slide.subtitle2}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <div className="HeroSection-bottom">
        <div className="HeroSection-bottom-content">
          {cards.map((card, index) => (
            <div key={index} className="HeroSection-card">
              <img src={card.image} alt={`Card ${index + 1}`} className="HeroSection-card-image" />
              <div className="HeroSection-card-text">
                <h3 className="HeroSection-card-title">{card.title}</h3>
                <p className="HeroSection-card-subtitle">{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
