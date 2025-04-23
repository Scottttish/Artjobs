import './Footer.css';

import locationIcon from '../../assets/location-icon.png';
import phoneIcon from '../../assets/phone-icon.png';
import emailIcon from '../../assets/email-icon.png';
import instagramIcon from '../../assets/instagram-icon.png';
import tiktokIcon from '../../assets/tiktok-icon.png';
import notionIcon from '../../assets/notion-icon.png';

function Footer() {
  return (
    <footer className="Footer">
      <div className="Footer-container">
        <div className="Footer-contact">
          <div className="Footer-contact-item">
            <img src={locationIcon} alt="Location" className="Footer-icon" />
            <p className="Footer-text">21 Revolution Street, Paris, France</p>
          </div>
          <div className="Footer-contact-item">
            <img src={phoneIcon} alt="Phone" className="Footer-icon" />
            <p className="Footer-text">+1 555 123456</p>
          </div>
          <div className="Footer-contact-item">
            <img src={emailIcon} alt="Email" className="Footer-icon" />
            <p className="Footer-text">
              <a href="mailto:support@company.com" className="Footer-link">support@company.com</a>
            </p>
          </div>
        </div>
        <div className="Footer-about">
          <h3 className="Footer-title">Наши ценности</h3>
          <p className="Footer-description">
          Мы поддерживаем талантливых художников, помогая им раскрыть свой потенциал. Наша цель — дать каждому шанс найти своё место в мире искусства.
          </p>
          <div className="Footer-socials">
            <a href="https://instagram.com" className="Footer-social-icon">
              <img src={instagramIcon} alt="Instagram" className="Footer-social-image" />
            </a>
            <a href="https://tiktok.com" className="Footer-social-icon">
              <img src={tiktokIcon} alt="TikTok" className="Footer-social-image" />
            </a>
            <a href="https://notion.so" className="Footer-social-icon">
              <img src={notionIcon} alt="Notion" className="Footer-social-image" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
