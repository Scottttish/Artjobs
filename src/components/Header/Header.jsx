import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom'; // Заменяем Link на NavLink
import './Header.css';
import logo from '../../assets/logo.png';
import AuthModal from '../AuthModal/AuthModal';

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToSection('home'), 100);
    } else {
      scrollToSection('home');
    }
  };

  return (
    <>
      <header className="Header">
        <div className="Header-logo">
          <img src={logo} alt="Logo" />
        </div>
        <nav className="Header-nav">
          <a href="#home" onClick={handleHomeClick}>
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
          <NavLink to="/3d" className={({ isActive }) => (isActive ? 'active' : '')}>3D</NavLink>
          <NavLink to="/motion" className={({ isActive }) => (isActive ? 'active' : '')}>Моушн</NavLink>
          <NavLink to="/illustration" className={({ isActive }) => (isActive ? 'active' : '')}>Иллюстрация</NavLink>
          <NavLink to="/interior" className={({ isActive }) => (isActive ? 'active' : '')}>Интерьер</NavLink>
          <NavLink to="/other" className={({ isActive }) => (isActive ? 'active' : '')}>Другое</NavLink>
        </nav>
        <div className="Header-auth">
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              setShowAuthModal(true);
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
