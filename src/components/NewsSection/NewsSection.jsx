import './NewsSection.css';
import image1 from '../../assets/news-image1.jpg'; 
import image2 from '../../assets/news-image2.jpg';
import image3 from '../../assets/news-image3.jpg';
import image4 from '../../assets/news-image4.jpg';

const block2Items = [
  {
    image: image2,
    title: 'Ограбление музея: похищено золото на 6 млн',
    description: 'В музее Нидерландов украдены древние артефакты. Воры прорвались через главный вход.',
    subtitle: 'Ronny Reyes | 27.01.2025',
  },
  {
    image: image3,
    title: 'AI-арт:targets: новое искусство или угроза?',
    description: 'Обсуждается, AI-арт риск для традиционного творчества? Художники обеспокоены авторскими правами.',
    subtitle: 'Kazeeem Adeleke | 14.02.2025',
  },
  {
    image: image4,
    title: 'Арт-дилера осудили за хищение $6,5 млн',
    description: 'Лиза Шифф признана виновной в присвоении средств клиентов. Получила 2,5 года тюрьмы.',
    subtitle: 'Eileen Kinsella | 19.03.2025',
  },
];

const block3Items = [
  {
    number: '01',
    title: 'Рисунок - основа всех видов изобразительного искусства',
    subtitle: 'rah.ru | 12.01.2025',
  },
  {
    number: '02',
    title: 'Живопись: от классики до экспериментальных техник',
    subtitle: 'МГХПА им. Строганова | 18.02.2025',
  },
  {
    number: '03',
    title: 'Композиция как язык визуального мышления',
    subtitle: 'СПбГХПА им. Штиглица | 23.03.2025',
  },
  {
    number: '04',
    title: 'Пластическая анатомия: понимание формы и движения',
    subtitle: 'BHSAD | 10.03.2025',
  },
];

function NewsSection() {
  return (
    <section className="NewsSection">
      <div className="NewsSection-container">
        <div className="NewsSection-left-column">
          <div className="NewsSection-block1">
            <div className="NewsSection-block1-text">
              <span className="NewsSection-label">Политика</span>
              <h2 className="NewsSection-title">AI-изображения обвинили в расизме. Жалоба оппазиции.</h2>
              <p className="NewsSection-subtitle">The Guardian | 18.04.2025</p>
              <p className="NewsSection-description">
                Итальянская партия использовала фейковые образы мигрантов. Оппозиция подала жалобу.
              </p>
            </div>
            <img src={image1} alt="News Image 1" className="NewsSection-image" />
          </div>
          <div className="NewsSection-block2">
            {block2Items.map((item, index) => (
              <div key={index} className="NewsSection-block2-item">
                <img src={item.image} alt={`News Item ${index + 1}`} className="NewsSection-block2-image" />
                <h3 className="NewsSection-block2-title">{item.title}</h3>
                <p className="NewsSection-block2-description">{item.description}</p>
                <p className="NewsSection-block2-subtitle">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="NewsSection-block3">
          <h3 className="NewsSection-block3-title">Популярное</h3>
          <div className="NewsSection-block3-line"></div>
          {block3Items.map((item, index) => (
            <div key={index} className="NewsSection-block3-item">
              <div className="NewsSection-block3-subitem">
                <span className="NewsSection-block3-number">{item.number}</span>
                <div className="NewsSection-block3-text">
                  <h4 className="NewsSection-block3-subitem-title">{item.title}</h4>
                  <p className="NewsSection-block3-subitem-subtitle">{item.subtitle}</p>
                </div>
              </div>
              {index < block3Items.length - 1 && (
                <div className="NewsSection-block3-divider"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewsSection;
