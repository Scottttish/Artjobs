import { useState } from 'react';
import './Header.css';
import logo from '../../assets/logo.png';
import AuthModal from '../AuthModal/AuthModal'; // Импортируем новый компонент

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header className="Header">
        <div className="Header-logo">
          <img src={logo} alt="Logo" />
        </div>
        <nav className="Header-nav">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
          >
            Главная
          </a>
          <a
            href="#contacts"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contacts');
            }}
          >
            Контакты
          </a>
          <a href="#3d">3D</a>
          <a href="#motion">Моушн</a>
          <a href="#illustration">Иллюстрация</a>
          <a href="#interior">Интерьер</a>
          <a href="#other">Другое</a>
        </nav>
        <div className="Header-auth">
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              setShowAuthModal(true); // Открываем модальное окно
            }}
          >
            Войти/Регистрация
          </a>
        </div>
      </header>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default Header;
