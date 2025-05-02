import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import supabase from '../../supabaseClient'; 
import './Header.css';
import logo from '../../assets/logo.png';
import icon from '../../assets/icon.png';
import AuthModal from '../AuthModal/AuthModal';

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setIsAuthenticated(true);
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();

        if (userData && !error) {
          setUserRole(userData.role);
        }
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        checkSession();
      } else {
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setShowDropdown(false);
      setUserRole(null);
      navigate('/');
      alert('Вы успешно вышли из аккаунта!');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Ошибка при выходе из аккаунта.');
    }
  };

  const handleSettings = () => {
    if (userRole === 'artist') {
      navigate('/artprofile');
    } else if (userRole === 'hirer') {
      navigate('/hirerprofile');
    }
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
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
          <NavLink to="/3d" className={({ isActive }) => (isActive ? 'active' : '')}>
            3D
          </NavLink>
          <NavLink to="/motion" className={({ isActive }) => (isActive ? 'active' : '')}>
            Моушн
          </NavLink>
          <NavLink to="/illustration" className={({ isActive }) => (isActive ? 'active' : '')}>
            Иллюстрация
          </NavLink>
          <NavLink to="/interior" className={({ isActive }) => (isActive ? 'active' : '')}>
            Интерьер
          </NavLink>
          <NavLink to="/other" className={({ isActive }) => (isActive ? 'active' : '')}>
            Другое
          </NavLink>
        </nav>
        <div className="Header-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <img
                src={icon}
                alt="User Icon"
                className="user-icon"
                onClick={toggleDropdown}
                style={{ cursor: 'pointer', width: '40px', height: '40px' }}
              />
              {showDropdown && (
                <div className="dropdown-menu">
                  <button onClick={handleSettings}>Настройки</button>
                  <button onClick={handleLogout}>Выйти</button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                setShowAuthModal(true);
              }}
            >
              Войти/Регистрация
            </a>
          )}
        </div>
      </header>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default Header;
