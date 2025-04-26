import React, { useState, useEffect, useRef } from 'react';
import './ArtProfile.css';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState({
    fullName: 'Иван Иванов',
    nickname: 'user_312',
    email: 'hacker@example.com',
    artSkills: {
      drawingLevel: 'Новичок',
      preferredMedium: 'Карандаш',
      experienceYears: 0,
      portfolioLink: '',
      artDescription: ''
    }
  });

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

  const handleSave = () => {
    onSave(editedUser);
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
