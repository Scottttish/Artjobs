import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './AuthModal.css';
import mainImage from '../../assets/main.jpg';

const supabase = createClient(
  'https://jvccejerkjfnkwtqumcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NlamVya2pmbmt3dHF1bWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTMzMjAsImV4cCI6MjA2MTA4OTMyMH0.xgqIMs3r007pJIeV5P8y8kG4hRcFqrgXvkkdavRtVIw'
);

function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState(null);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|ru|org|co\.uk|gov|edu|io|travel)$/;
    const isValid = emailRegex.test(value);
    setIsEmailValid(isValid);
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

  const handleRegister = async () => {
    try {
      // Регистрация через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Сохранение дополнительных данных в таблицу users
      const { error: dbError } = await supabase
        .from('users')
        .insert([{ user_id: authData.user.id, email, name, role: selectedRole }]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      alert('Регистрация успешна! Проверьте email для подтверждения.');
      onClose();
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      alert('Вход успешен!');
      onClose();
    } catch (err) {
      setError('Неверный email или пароль');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isEmailValid !== true) {
      setError('Введите корректный email');
      return;
    }

    if (!isLogin) {
      if (!selectedRole) {
        setError('Выберите роль');
        return;
      }
      if (!passwordMatch) {
        setError('Пароли не совпадают');
        return;
      }
      if (passwordStrength !== 4) {
        setError('Пароль слишком слабый');
        return;
      }
      if (!name) {
        setError('Введите имя');
        return;
      }
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-box">
        <div className="auth-news-block"></div>
        <div className="auth-block">
          <button className="auth-close-button" onClick={onClose}>×</button>
          <h2 className={`auth-h2 ${isLogin ? 'auth-h2-login' : 'auth-h2-register'}`}>
            {isLogin ? 'Вход в аккаунт' : 'Создайте свой аккаунт'}
          </h2>
          <p className={`auth-p ${isLogin ? 'auth-p-login' : 'auth-p-register'}`}>
            {isLogin ? 'Введите почту и пароль для входа' : 'Добро пожаловать. Пожалуйста, введите ваши данные'}
          </p>

          {error && <p className="auth-error" style={{ color: 'red' }}>{error}</p>}

          <button className="auth-google-button">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png" alt="Google" className="google-icon" />
            Войти с помощью Google
          </button>

          {!isLogin && (
            <div className="user-role">
              <label htmlFor="role-select">Роль</label>
              <select
                id="role-select"
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="auth-select"
                required
              >
                <option value="" disabled hidden>Выберите роль</option>
                <option value="artist">Художник</option>
                <option value="hirer">Работодатель</option>
              </select>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <label>
                Имя
                <input
                  type="text"
                  placeholder="Введите своё имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-name"
                  required
                />
              </label>
            )}

            <label>
              Почта
              <input
                type="email"
                placeholder="Введите свою почту"
                value={email}
                onChange={handleEmailChange}
                className={`auth-email ${isEmailValid === null ? '' : isEmailValid ? 'valid' : 'invalid'}`}
                required
              />
            </label>

            <label>
              Пароль
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                className="auth-password"
                required
              />
            </label>

            {!isLogin && (
              <>
                <div className="password-levels">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: getProgressBarColor(passwordStrength),
                    }}
                  />
                </div>

                <label>
                  Повторить пароль
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={confirmPassword === '' ? 'neutral' : passwordMatch ? 'valid' : 'invalid'}
                    required
                  />
                </label>
              </>
            )}

            <label className="auth-checkbox-label">
              <div className="checkbox-container">
                <input type="checkbox" required />
              </div>
              <p className="checkbox-text">Я согласен с условиями и конфиденциальностью.</p>
            </label>

            <button type="submit" className="auth-submit-button">
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
}

const getProgressBarColor = (strength) => {
  switch (strength) {
    case 1: return 'red
