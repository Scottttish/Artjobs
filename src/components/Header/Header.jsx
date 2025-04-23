import './Header.css';
import logo from '../../assets/logo.png'; 

function Header() {
  return (
    <header className="Header">
      <div className="Header-logo">
        <img src={logo} alt="Logo" />
      </div>
      <nav className="Header-nav">
        <a href="#home">Главная</a>
        <a href="#about">Направление1</a>
        <a href="#services">Направление2</a>
        <a href="#projects">Направление3</a>
        <a href="#blog">Направление4</a>
        <a href="#contacts">Другое</a>
      </nav>
      <div className="Header-auth">
        <a href="#login">Войти/Регистрация</a>
      </div>
    </header>
  );
}

export default Header;
