import React, { useState } from 'react';
import '../styles/Statistic.css';

const Statistic = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="statistic-container">
      <button className="register-button" onClick={() => setShowModal(true)}>Зарегистрироваться</button>
      {showModal && <RegistrationModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

const RegistrationModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(evaluatePasswordStrength(newPassword));
    setPasswordMatch(confirmPassword === newPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPasswordValue = e.target.value;
    setConfirmPassword(confirmPasswordValue);
    setPasswordMatch(confirmPasswordValue === password);
  };

  const evaluatePasswordStrength = (password) => {
    let strength = 0;
    if (/[a-zA-Zа-яё]/.test(password)) strength++;
    if (/[A-ZА-ЯЁ]/.test(password) && /[a-zа-яё]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  return (
    <div className="registration-modal-overlay">
      <div className="registration-modal-box">
        <div className="registration-news-block"></div>
        <div className="reigstration-block">
          <button className="registration-close-button" onClick={onClose}>&times;</button>
          <h2 className="registration-h2">{isLogin ? 'Вход в аккаунт' : 'Создайте свой аккаунт'}</h2>
          <p className="registration-p">{isLogin ? 'Введите почту и пароль для входа' : 'Добро пожаловать. Пожалуйста, введите ваши данные'}</p>

          <button className="registration-google-button">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png" className="google-icon" />
            Войти с помощью Google
          </button>

          {!isLogin && (
            <div className="user-role">
              <label htmlFor="role-select">Роль</label>
              <select
                id="role-select"
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="registration-select"
              >
                <option value="" disabled hidden>Выберите роль</option>
                <option value="user">Пользователь</option>
                <option value="artist">Художник</option>
                <option value="hirer">Работодатель</option>
              </select>
            </div>
          )}

          <form className="registration-form">
            {!isLogin && (
              <label>Имя <input type="text" placeholder="Введите своё имя" className="registration-name" /></label>
            )}

            <label>Почта
              <input
                type="email"
                placeholder="Введите свою почту"
                value={email}
                onChange={handleEmailChange}
                className={`registration-email ${isEmailValid === null ? '' : isEmailValid ? 'valid' : 'invalid'}`}
              />
            </label>

            <label>Пароль
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                className="registration-password"
              />
            </label>

            {!isLogin && (
              <>
                <div className="password-levels">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: getProgressBarColor(passwordStrength)
                    }}
                  />
                </div>

                <label>Повторить пароль
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={confirmPassword === '' ? 'neutral' : passwordMatch ? 'valid' : 'invalid'}
                  />
                </label>
              </>
            )}

            <label className="registration-checkbox-label">
              <div className="checkbox-container">
                <input type="checkbox" />
              </div>
              <p className="checkbox-text">Я согласен с условиями и конфиденциальностью.</p>
            </label>

            <button type="submit" className="registration-submit-button">
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>

            <p className="login-link">
              {isLogin ? 'У вас нет аккаунта? ' : 'У вас уже есть аккаунт? '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
                {isLogin ? 'Зарегистрируйтесь' : 'Войти'}
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const getProgressBarColor = (strength) => {
  switch (strength) {
    case 1: return 'red';
    case 2: return 'orange';
    case 3: return 'yellowgreen';
    case 4: return 'green';
    default: return 'lightgray';
  }
};

export default Statistic;
