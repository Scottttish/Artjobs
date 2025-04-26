import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './ArtProfile.css';

// Инициализация Supabase клиента
const supabase = createClient(
  'https://jvccejerkjfnkwtqumcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NlamVya2pmbmt3dHF1bWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTMzMjAsImV4cCI6MjA2MTA4OTMyMH0.xgqIMs3r007pJIeV5P8y8kG4hRcFqrgXvkkdavRtVIw'
);

function ArtProfile() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState({
    nickname: '',
    email: '',
    artSkills: {
      drawingLevel: 'Новичок',
      preferredMedium: 'Карандаш',
      experienceYears: 0,
      portfolioLink: '',
      artDescription: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных пользователя при монтировании компонента
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      // Получение сессии пользователя
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Session error:', sessionError);
        setError('Пожалуйста, войдите в систему.');
        setLoading(false);
        return;
      }

      const userId = sessionData.session.user.id;

      // Загрузка данных пользователя из таблицы users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, email')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setError('Ошибка загрузки данных пользователя: ' + userError.message);
        setLoading(false);
        return;
      }

      // Загрузка дополнительных данных из таблицы additionalInfo
      const { data: additionalData, error: additionalError } = await supabase
        .from('additionalInfo')
        .select('drawingLevel, preferredMedium, experienceYears, portfolioLink, artDescription')
        .eq('user_id', userId)
        .single();

      if (additionalError && additionalError.code !== 'PGRST116') {
        console.error('Error fetching additional info:', additionalError);
        setError('Ошибка загрузки дополнительных данных: ' + additionalError.message);
        setLoading(false);
        return;
      }

      let artSkills = {
        drawingLevel: 'Новичок',
        preferredMedium: 'Карандаш',
        experienceYears: 0,
        portfolioLink: '',
        artDescription: ''
      };

      if (!additionalData) {
        const { error: insertError } = await supabase
          .from('additionalInfo')
          .insert({ user_id: userId, ...artSkills });

        if (insertError) {
          console.error('Error creating additional info:', insertError);
          setError('Ошибка создания дополнительных данных: ' + insertError.message);
          setLoading(false);
          return;
        }
      } else {
        artSkills = {
          drawingLevel: additionalData.drawingLevel || 'Новичок',
          preferredMedium: additionalData.preferredMedium || 'Карандаш',
          experienceYears: additionalData.experienceYears || 0,
          portfolioLink: additionalData.portfolioLink || '',
          artDescription: additionalData.artDescription || ''
        };
      }

      const userState = {
        nickname: userData.username || 'user_312',
        email: userData.email || 'hacker@example.com',
        artSkills
      };

      setUser(userState);
      setLoading(false);

      // Подписка на изменения в таблице users
      const userSubscription = supabase
        .channel('users-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            setUser(prev => ({
              ...prev,
              nickname: payload.new.username || prev.nickname,
              email: payload.new.email || prev.email
            }));
          }
        )
        .subscribe();

      // Подписка на изменения в таблице additionalInfo
      const additionalInfoSubscription = supabase
        .channel('additionalInfo-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'additionalInfo',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            setUser(prev => ({
              ...prev,
              artSkills: {
                drawingLevel: payload.new.drawingLevel || prev.artSkills.drawingLevel,
                preferredMedium: payload.new.preferredMedium || prev.artSkills.preferredMedium,
                experienceYears: payload.new.experienceYears || prev.artSkills.experienceYears,
                portfolioLink: payload.new.portfolioLink || prev.artSkills.portfolioLink,
                artDescription: payload.new.artDescription || prev.artSkills.artDescription
              }
            }));
          }
        )
        .subscribe();

      // Очистка подписок при размонтировании компонента
      return () => {
        supabase.removeChannel(userSubscription);
        supabase.removeChannel(additionalInfoSubscription);
      };
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const formatTime = (date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app-container">
      <div className="main-container">
        <header className="profile-header">
          <h1>Добро пожаловать, {user.nickname}</h1>
          <div className="current-time">{formatTime(currentTime)}</div>
        </header>
        
        <ProfileDetails 
          user={user} 
          onSave={handleSaveProfile} 
        />
      </div>
    </div>
  );
}

const ProfileDetails = ({ user = {}, onSave = (data) => console.log('Saved:', data) }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({
    ...user,
    artSkills: user.artSkills || {
      drawingLevel: 'Новичок',
      preferredMedium: 'Карандаш',
      experienceYears: 0,
      portfolioLink: '',
      artDescription: ''
    }
  });

  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in editedUser.artSkills) {
      setEditedUser(prev => ({
        ...prev,
        artSkills: { ...prev.artSkills, [name]: value }
      }));
    } else {
      setEditedUser(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (editMode && textareaRef.current) {
      handleTextareaResize();
    }
  }, [editMode]);

  const handleSave = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    const userId = sessionData.session.user.id;

    // Обновление основной информации пользователя в таблице users
    const updatedUserData = {
      username: editedUser.nickname,
      email: editedUser.email
    };

    const { error: userError } = await supabase
      .from('users')
      .update(updatedUserData)
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user info:', userError);
      alert('Ошибка при сохранении данных пользователя: ' + userError.message);
      return;
    }

    // Обновление дополнительных данных в таблице additionalInfo
    const updatedAdditionalData = {
      drawingLevel: editedUser.artSkills.drawingLevel,
      preferredMedium: editedUser.artSkills.preferredMedium,
      experienceYears: Number(editedUser.artSkills.experienceYears),
      portfolioLink: editedUser.artSkills.portfolioLink,
      artDescription: editedUser.artSkills.artDescription
    };

    const { error: additionalError } = await supabase
      .from('additionalInfo')
      .update(updatedAdditionalData)
      .eq('user_id', userId);

    if (additionalError) {
      console.error('Error updating additional info:', additionalError);
      alert('Ошибка при сохранении дополнительных данных: ' + additionalError.message);
      return;
    }

    onSave(editedUser);
    alert('Данные пользователя успешно сохранены!');
    setEditMode(false);
  };

  return (
    <div className="profile-details-container">
      <div className="section">
        <h3>Основная информация</h3>

        <div className="detail-row">
          <span className="label">Никнейм:</span>
          {editMode ? (
            <input
              type="text"
              name="nickname"
              value={editedUser.nickname}
              onChange={handleInputChange}
              placeholder="Введите ваш никнейм"
            />
          ) : (
            <span className="value">{user.nickname}</span>
          )}
        </div>

        <div className="detail-row">
          <span className="label">Email:</span>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleInputChange}
              className="email-input"
            />
          ) : (
            <span className="value">{user.email}</span>
          )}
        </div>
      </div>

      <div className="section">
        <h3>Художественные навыки</h3>
        
        <div className="detail-row">
          <span className="label">Уровень рисования:</span>
          {editMode ? (
            <select
              name="drawingLevel"
              value={editedUser.artSkills.drawingLevel}
              onChange={handleInputChange}
            >
              <option value="Новичок">Новичок</option>
              <option value="Любитель">Любитель</option>
              <option value="Профессионал">Профессионал</option>
            </select>
          ) : (
            <span className="value">{user.artSkills.drawingLevel}</span>
          )}
        </div>

        <div className="detail-row">
          <span className="label">Предпочитаемый материал:</span>
          {editMode ? (
            <select
              name="preferredMedium"
              value={editedUser.artSkills.preferredMedium}
              onChange={handleInputChange}
            >
              <option value="Карандаш">Карандаш</option>
              <option value="Акварель">Акварель</option>
              <option value="Масло">Масло</option>
              <option value="Цифровое искусство">Цифровое искусство</option>
            </select>
          ) : (
            <span className="value">{user.artSkills.preferredMedium}</span>
          )}
        </div>

        <div className="detail-row">
          <span className="label">Опыт (годы):</span>
          {editMode ? (
            <input
              type="number"
              name="experienceYears"
              value={editedUser.artSkills.experienceYears}
              onChange={handleInputChange}
              min="0"
            />
          ) : (
            <span className="value">{user.art0
            <span className="value">{user.artSkills.experienceYears}</span>
          )}
        </div>

        <div className="detail-row">
          <span className="label">Ссылка на портфолио:</span>
          {editMode ? (
            <input
              type="url"
              name="portfolioLink"
              value={editedUser.artSkills.portfolioLink}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          ) : (
            <span className="value">{user.artSkills.portfolioLink || 'Не указана'}</span>
          )}
        </div>

        <div className="detail-row">
          <span className="label">Описание стиля:</span>
          {editMode ? (
            <textarea
              ref={textareaRef}
              name="artDescription"
              value={editedUser.artSkills.artDescription}
              onChange={(e) => {
                handleInputChange(e);
                handleTextareaResize();
              }}
              placeholder="Опишите ваш художественный стиль"
            />
          ) : (
            <div className="value-multiline">{user.artSkills.artDescription || 'Не указано'}</div>
          )}
        </div>
      </div>

      <div className="actions">
        {editMode ? (
          <>
            <button onClick={handleSave} className="save-btn">Сохранить</button>
            <button onClick={() => setEditMode(false)} className="cancel-btn">Отмена</button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)} className="edit-btn">Редактировать</button>
        )}
      </div>
    </div>
  );
};

export default ArtProfile;
