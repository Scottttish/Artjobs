import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './AdminPanel.css';

// Простая реализация debounce для ограничения частоты запросов
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const supabaseUrl = 'https://jvccejerkjfnkwtqumcd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NlamVya2pmbmt3dHF1bWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTMzMjAsImV4cCI6MjA2MTA4OTMyMH0.xgqIMs3r007pJIeV5P8y8kG4hRcFqrgXvkkdavRtVIw';
const supabase = createClient(supabaseUrl, supabaseKey);

function AdminPanel() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching admin panel data...');
      setLoading(true);
      setError(null);

      try {
        // Проверка, является ли пользователь администратором
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.error('Session error:', sessionError);
          setError('Пожалуйста, войдите в систему.');
          setLoading(false);
          return;
        }

        const userId = sessionData.session.user.id;
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', userId)
          .single();

        if (userError || !userData?.is_admin) {
          console.error('User error or not admin:', userError);
          setError('Доступ запрещён. Только для администраторов.');
          setLoading(false);
          return;
        }

        // Загрузка всех пользователей
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, username, email, role, telegram_username, is_admin');

        if (usersError) {
          console.error('Users fetch error:', usersError);
          setError('Ошибка загрузки данных пользователей: ' + usersError.message);
          setLoading(false);
          return;
        }

        // Загрузка проектов из всех таблиц
        const tables = ['interior', 'motion', 'three_d', 'illustration', 'other'];
        let allProjects = [];
        for (const table of tables) {
          const { data: projectData, error: projectError } = await supabase
            .from(table)
            .select('id, user_id, title, category, description, published_at, start_date, end_date, price, status');
          if (projectError) {
            console.error(`Project fetch error for ${table}:`, projectError);
            setError(`Ошибка загрузки данных из ${table}: ` + projectError.message);
            setLoading(false);
            return;
          }
          allProjects = [...allProjects, ...projectData.map(project => ({ ...project, table }))];
        }

        console.log('Fetched users:', usersData);
        console.log('Fetched projects:', allProjects);
        setUsers(usersData || []);
        setProjects(allProjects || []);
        setLoading(false);

        // Настройка подписок в реальном времени
        const userSubscription = supabase
          .channel('users-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users' },
            (payload) => {
              console.log('Users subscription event:', payload);
              if (payload.eventType === 'INSERT') {
                setUsers(prev => [...prev, payload.new]);
              } else if (payload.eventType === 'UPDATE') {
                setUsers(prev => prev.map(user => (user.id === payload.new.id ? payload.new : user)));
              } else if (payload.eventType === 'DELETE') {
                setUsers(prev => prev.filter(user => user.id !== payload.old.id));
              }
            }
          )
          .subscribe();

        const projectSubscriptions = tables.map(table =>
          supabase
            .channel(`${table}-changes`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table },
              (payload) => {
                console.log(`${table} subscription event:`, payload);
                if (payload.eventType === 'INSERT') {
                  setProjects(prev => [...prev, { ...payload.new, table }]);
                } else if (payload.eventType === 'UPDATE') {
                  setProjects(prev =>
                    prev.map(project =>
                      project.id === payload.new.id && project.table === table
                        ? { ...payload.new, table }
                        : project
                    )
                  );
                } else if (payload.eventType === 'DELETE') {
                  setProjects(prev =>
                    prev.filter(project => !(project.id === payload.old.id && project.table === table))
                  );
                }
              }
            )
            .subscribe()
        );

        return () => {
          console.log('Cleaning up subscriptions');
          supabase.removeChannel(userSubscription);
          projectSubscriptions.forEach(sub => supabase.removeChannel(sub));
        };
      } catch (err) {
        console.error('Unexpected error in fetchData:', err);
        setError('Произошла непредвиденная ошибка: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    console.log('Rendering loading state');
    return (
      <div className="app-container">
        <main>
          <div className="admin-container">
            <div className="loading">Загрузка...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="app-container">
        <main>
          <div className="admin-container">
            <div className="error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  console.log('Rendering admin panel with users:', users, 'and projects:', projects);
  return (
    <div className="app-container">
      <div className="main-container">
        <header className="admin-header">
          <h1>Панель администратора</h1>
          <div className="current-time">{formatTime(currentTime)}</div>
        </header>
        <AdminDetails users={users} setUsers={setUsers} projects={projects} setProjects={setProjects} />
      </div>
    </div>
  );
}

const AdminDetails = ({ users, setUsers, projects, setProjects }) => {
  const textareaRefs = useRef({});

  const handleTextareaResize = (id) => {
    const textarea = textareaRefs.current[id];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const updateUser = async (userId, updatedFields) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updatedFields)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        alert('Ошибка при обновлении пользователя: ' + error.message);
        return;
      }
      console.log('User updated:', updatedFields);
    } catch (err) {
      console.error('Unexpected error in updateUser:', err);
      alert('Произошла ошибка: ' + err.message);
    }
  };

  const updateProject = async (projectId, table, updatedFields) => {
    try {
      const { error } = await supabase
        .from(table)
        .update(updatedFields)
        .eq('id', projectId);

      if (error) {
        console.error('Error updating project:', error);
        alert('Ошибка при обновлении проекта: ' + error.message);
        return;
      }
      console.log('Project updated:', updatedFields);
    } catch (err) {
      console.error('Unexpected error in updateProject:', err);
      alert('Произошла ошибка: ' + err.message);
    }
  };

  const debouncedUpdateUser = debounce(updateUser, 500);
  const debouncedUpdateProject = debounce(updateProject, 500);

  const handleUserChange = (userId, field, value) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, [field]: value } : user
      )
    );
    const updatedFields = { [field]: value };
    if (field === 'is_admin') {
      updatedFields[field] = value === 'true';
    }
    debouncedUpdateUser(userId, updatedFields);
  };

  const handleProjectChange = (projectId, table, field, value) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId && project.table === table
          ? { ...project, [field]: value }
          : project
      )
    );
    const updatedFields = { [field]: field === 'price' ? Number(value) : value };
    debouncedUpdateProject(projectId, table, updatedFields);
  };

  const handleDelete = async (item, type) => {
    if (!window.confirm(`Вы уверены, что хотите удалить ${type === 'user' ? 'пользователя' : 'проект'}?`)) {
      return;
    }

    try {
      if (type === 'user') {
        const { error } = await supabase.from('users').delete().eq('id', item.id);
        if (error) {
          console.error('Error deleting user:', error);
          alert('Ошибка при удалении пользователя: ' + error.message);
          return;
        }
        setUsers(prev => prev.filter(user => user.id !== item.id));
      } else if (type === 'project') {
        const { error } = await supabase.from(item.table).delete().eq('id', item.id);
        if (error) {
          console.error('Error deleting project:', error);
          alert('Ошибка при удалении проекта: ' + error.message);
          return;
        }
        setProjects(prev => prev.filter(project => !(project.id === item.id && project.table === item.table)));
      }
      alert('Элемент успешно удалён!');
    } catch (err) {
      console.error('Unexpected error in handleDelete:', err);
      alert('Произошла ошибка при удалении: ' + err.message);
    }
  };

  return (
    <div className="admin-details-container">
      <div className="section">
        <h3>Управление пользователями</h3>
        {users.length === 0 ? (
          <p>Пользователи не найдены</p>
        ) : (
          users.map(user => (
            <div key={user.id} className="detail-row">
              <div className="detail-field">
                <label>ID:</label>
                <input
                  type="text"
                  value={user.id}
                  disabled
                />
              </div>
              <div className="detail-field">
                <label>Никнейм:</label>
                <input
                  type="text"
                  value={user.username || ''}
                  onChange={(e) => handleUserChange(user.id, 'username', e.target.value)}
                  placeholder="Никнейм"
                />
              </div>
              <div className="detail-field">
                <label>Email:</label>
                <input
                  type="email"
                  value={user.email || ''}
                  onChange={(e) => handleUserChange(user.id, 'email', e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className="detail-field">
                <label>Роль:</label>
                <select
                  value={user.role || 'artist'}
                  onChange={(e) => handleUserChange(user.id, 'role', e.target.value)}
                >
                  <option value="artist">Художник</option>
                  <option value="hirer">Работодатель</option>
                </select>
              </div>
              <div className="detail-field">
                <label>Telegram:</label>
                <input
                  type="text"
                  value={user.telegram_username || ''}
                  onChange={(e) => handleUserChange(user.id, 'telegram_username', e.target.value)}
                  placeholder="Telegram"
                />
              </div>
              <div className="detail-field">
                <label>Админ:</label>
                <select
                  value={user.is_admin}
                  onChange={(e) => handleUserChange(user.id, 'is_admin', e.target.value)}
                >
                  <option value={true}>Админ</option>
                  <option value={false}>Не админ</option>
                </select>
              </div>
              <button
                onClick={() => handleDelete(user, 'user')}
                className="delete-btn"
              >
                Удалить
              </button>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <h3>Управление проектами</h3>
        {projects.length === 0 ? (
          <p>Проекты не найдены</p>
        ) : (
          projects.map(project => (
            <div key={`${project.table}-${project.id}`} className="detail-row">
              <div className="detail-field">
                <label>ID:</label>
                <input
                  type="text"
                  value={project.id}
                  disabled
                />
              </div>
              <div className="detail-field">
                <label>User ID:</label>
                <input
                  type="text"
                  value={project.user_id}
                  disabled
                />
              </div>
              <div className="detail-field">
                <label>Название:</label>
                <input
                  type="text"
                  value={project.title || ''}
                  onChange={(e) => handleProjectChange(project.id, project.table, 'title', e.target.value)}
                  placeholder="Название"
                />
              </div>
              <div className="detail-field">
                <label>Категория:</label>
                <input
                  type="text"
                  value={project.category || ''}
                  onChange={(e) => handleProjectChange(project.id, project.table, 'category', e.target.value)}
                  placeholder="Категория"
                />
              </div>
              <div className="detail-field">
                <label>Описание:</label>
                <textarea
                  ref={(el) => (textareaRefs.current[`${project.table}-${project.id}`] = el)}
                  value={project.description || ''}
                  onChange={(e) => {
                    handleProjectChange(project.id, project.table, 'description', e.target.value);
                    handleTextareaResize(`${project.table}-${project.id}`);
                  }}
                  placeholder="Описание"
                  onInput={() => handleTextareaResize(`${project.table}-${project.id}`)}
                />
              </div>
              <div className="detail-field">
                <label>Дата публикации:</label>
                <input
                  type="text"
                  value={project.published_at || ''}
                  onChange={(e) => handleProjectChange(project.id, project.table, 'published_at', e.target.value)}
                  placeholder="Дата публикации"
                />
              </div>
              <div className="detail-field">
                <label>Дата начала:</label>
                <input
                  type="text"
                  value={project.start_date || ''}
                  onChange={(e) => handleProjectChange(project.id, project.table, 'start_date', e.target.value)}
                  placeholder="Дата начала"
                />
              </div>
              <div className="detail-field">
                <label>Дата окончания:</label>
                <input
                  type="text"
                  value={project.end_date || ''}
                  onChange={(e) => handleProjectChange(project.id, project.table, 'end_date', e.target.value)}
                  placeholder="Дата окончания"
                />
              </div>
              <div className="detail-field">
                <label>Цена:</label>
                <input
                  type="number"
                  value={project.price || ''}
                  onChange={(e) => handleProjectChange(project.id, project.table, 'price', e.target.value)}
                  placeholder="Цена"
                />
              </div>
              <div className="detail-field">
                <label>Статус:</label>
                <select
                  value={project.status || 'open'}
                  onChange={(e) => handleProjectChange(project.id, project.table, 'status', e.target.value)}
                >
                  <option value="open">Открыт</option>
                  <option value="closed">Закрыт</option>
                </select>
              </div>
              <button
                onClick={() => handleDelete(project, 'project')}
                className="delete-btn"
              >
                Удалить
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
