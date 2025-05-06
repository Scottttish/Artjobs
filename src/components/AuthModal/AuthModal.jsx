import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import './AuthModal.css';
import mainImage from '../../assets/main.jpg';

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

  const getProgressBarColor = (strength) => {
    switch (strength) {
      case 1: return 'red';
      case 2: return 'orange';
      case 3: return 'yellow';
      case 4: return 'green';
      default: return 'transparent';
    }
  };

  const checkUserExistsInUsersTable = async (email) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch {
      return false;
    }
  };

  const handleRegister = async () => {
    try {
      await delay(1000);
      const userExists = await checkUserExistsInUsersTable(email);
      if (userExists) {
        setError('Этот email уже зарегистрирован. Попробуйте войти.');
        return;
      }

      // Hash the password before storing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('Generated hashed password:', hashedPassword); // Debug: Log hashed password

      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setError('Email уже зарегистрирован. Попробуйте войти.');
          setIsLogin(true);
        } else {
          setError(authError.message);
        }
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!sessionData.session || sessionError) {
        setError('Сессия не найдена');
        return;
      }

      // Store hashed password in the users table
      const { data: insertData, error: dbError } = await supabase
        .from('users')
        .insert([{ id: authData.user.id, email, username, role: selectedRole, hashed_password: hashedPassword }]);

      if (dbError) {
        console.error('Database insert error:', dbError); // Debug: Log insert error
        setError(`Ошибка при сохранении пользователя: ${dbError.message}`);
        return;
      }

      console.log('User inserted successfully:', insertData); // Debug: Log insert result
      alert('Регистрация успешна!');
      onClose();
    } catch (err) {
      console.error('Registration error:', err); // Debug: Log general error
      setError('Ошибка регистрации: ' + err.message);
    }
  };

  const handleLogin = async () => {
    try {
      // First, attempt to sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError('Неверный email или пароль');
        return;
      }

      // Verify password against hashed password in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('hashed_password')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setError('Пользователь не найден');
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, userData.hashed_password);
      if (!isPasswordValid) {
        setError('Неверный пароль');
        return;
      }

      alert('Вход успешен!');
      onClose();
    } catch {
      setError('Ошибка входа');
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
          setError('Пароль слишком короткий');
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
        <div className="auth-news-block">
          <img src={mainImage} alt="Main" />
        </div>
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
                <option value="" disabled hidden>Выберите роль</option>
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
                  Повторите пароль
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="auth-password"
                    required
                  />
                </label>
              </>
            )}

            <button type="submit" className="auth-submit-button" disabled={isSubmitting}>
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>

            <p className="auth-switch">
              {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <span onClick={() => setIsLogin(!isLogin)} className="auth-toggle">
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
