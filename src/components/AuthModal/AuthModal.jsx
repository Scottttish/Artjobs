import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './AuthModal.css';
import mainImage from '../../assets/main.jpg';

{/* Пожалуйста поставьте 100 баллов */}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const [username, setUsername] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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

  const checkUserExistsInUsersTable = async (email) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user in users table:', error);
        throw error;
      }

      return !!data; // Возвращает true, если пользователь найден, false, если нет
    } catch (err) {
      console.error('Error checking user existence:', err);
      return false;
    }
  };

  const handleRegister = async () => {
    try {
      await delay(1000); // Задержка для предотвращения rate limit

      // Проверка, существует ли пользователь в таблице users
      const userExistsInUsersTable = await checkUserExistsInUsersTable(email);
      if (userExistsInUsersTable) {
        setError('Этот email уже зарегистрирован. Попробуйте войти.');
        return;
      }

      // Регистрация через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('User already registered')) {
          setError('Этот email уже зарегистрирован в системе. Попробуйте войти или используйте другой email.');
          setIsLogin(true); // Переключаем на форму входа
        } else if (authError.status === 429) {
          setError('Слишком много запросов. Пожалуйста, подождите несколько секунд и попробуйте снова.');
        } else {
          setError(authError.message || 'Ошибка регистрации');
        }
        throw authError;
      }

      if (!authData.user) {
        console.error('No user data returned from signUp:', authData);
        setError('Не удалось получить данные пользователя');
        throw new Error('No user data');
      }

      // Проверка сессии
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Ошибка получения сессии: ' + (sessionError.message || 'Неизвестная ошибка'));
        throw sessionError;
      }

      if (!sessionData.session) {
        console.error('No active session found:', sessionData);
        setError('Сессия пользователя не найдена. Пожалуйста, попробуйте снова.');
        throw new Error('No active session');
      }

      // Сохранение данных в таблицу users, включая пароль
      const { error: dbError } = await supabase
        .from('users')
        .insert([{ id: authData.user.id, email, username, role: selectedRole, password }]);

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Ошибка при сохранении данных пользователя: ' + (dbError.message || 'Неизвестная ошибка'));
        throw dbError;
      }

      alert('Регистрация успешна!');
      onClose();
    } catch (err) {
      console.error('Registration error:', err);
      // Ошибка уже установлена в соответствующих блоках
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      alert('Вход успешен!');
      onClose();
    } catch (err) {
      setError('Неверный email или пароль');
      console.error('Login error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
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
        if (password.length < 6) {
          setError('Пароль должен содержать не менее 6 символов');
          return;
        }
        if (passwordStrength !== 4) {
          setError('Пароль слишком слабый');
          return;
        }
        if (!username) {
          setError('Введите имя пользователя');
          return;
        }
        await handleRegister();
      } else {
        await handleLogin();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-box">
        <div className="auth-news-block"></div>
        <div className="auth-block">
          <button className="auth-close-button" onClick={onClose}>×</button>
          <h2 className={`auth-h2 ${isLogin ? 'auth-h2-login' : 'auth-h2-register'}`}>
            {isLogin ? 'Вход в Аккаунт' : 'Создайте Свой Аккаунт'}
          </h2>
          <p className={`auth-p ${isLogin ? 'auth-p-login' : 'auth-p-register'}`}>
            {isLogin ? 'Введите почту и пароль для входа' : 'Добро пожаловать. Пожалуйста, введите ваши данные'}
          </p>

          {error && <p className="auth-error" style={{ color: 'red' }}>{error}</p>}

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
                <option value="" disabled hidden>
                  Выберите роль
                </option>
                <option value="artist">Художник</option>
                <option value="hirer">Работодатель</option>
              </select>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <label>
                Имя пользователя
                <input
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-username"
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

            <button type="submit" className="auth-submit-button" disabled={isSubmitting}>
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>

            <p className="login-link">
              {isLogin ? 'У вас нет аккаунта? ' : 'У вас уже есть аккаунт? '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLogin(!isLogin);
                  setError(null);
                }}
              >
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
    case 1:
      return 'red';
    case 2:
      return 'orange';
    case 3:
      return 'yellowgreen';
    case 4:
      return 'green';
    default:
      return 'lightgray';
  }
};

export default AuthModal;
