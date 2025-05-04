import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './AdminPanel.css';

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
      setLoading(true);
      setError(null);

      // Check if user is admin
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
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
        setError('Доступ запрещён. Только для администраторов.');
        setLoading(false);
        return;
      }

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, email, role, telegram_username, is_admin');

      if (usersError) {
        setError('Ошибка загрузки данных пользователей: ' + usersError.message);
        setLoading(false);
        return;
      }

      // Fetch projects from all tables
      const tables = ['interior', 'motion', 'three_d', 'illustration', 'other'];
      let allProjects = [];
      for (const table of tables) {
        const { data: projectData, error: projectError } = await supabase
          .from(table)
          .select('id, user_id, title, category, description, published_at, start_date, end_date, price, status');
        if (projectError) {
          setError(`Ошибка загрузки данных из ${table}: ` + projectError.message);
          setLoading(false);
          return;
        }
        allProjects = [...allProjects, ...projectData.map(project => ({ ...project, table }))];
      }

      setUsers(usersData || []);
      setProjects(allProjects || []);
      setLoading(false);

      // Set up real-time subscriptions
      const userSubscription = supabase
        .channel('users-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          (payload) => {
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
        supabase.removeChannel(userSubscription);
        projectSubscriptions.forEach(sub => supabase.removeChannel(sub));
      };
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

  return (
    <div className="app-container">
      <div className="main-container">
        <header className="admin-header">
          <h1>Панель администратора</h1>
          <div className="current-time">{formatTime(currentTime)}</div>
        </header>
        <AdminDetails users={users} projects={projects} setUsers={setUsers} setProjects={setProjects} />
      </div>
    </div>
  );
}

const AdminDetails = ({ users, projects, setUsers, setProjects }) => {
  const [editMode, setEditMode] = useState(null);
  const [editedItem, setEditedItem] = useState(null);
  const textareaRef = useRef(null);

  const handleEdit = (item, type) => {
    setEditMode(type);
    setEditedItem({ ...item });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({ ...prev, [name]: value }));
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
    if (!editMode || !editedItem) return;

    if (editMode === 'user') {
      const { error } = await supabase
        .from('users')
        .update({
          username: editedItem.username,
          email: editedItem.email,
          role: editedItem.role,
          telegram_username: editedItem.telegram_username,
          is_admin: editedItem.is_admin
        })
        .eq('id', editedItem.id);

      if (error) {
        alert('Ошибка при сохранении данных пользователя: ' + error.message);
        return;
      }
      setUsers(prev => prev.map(user => (user.id === editedItem.id ? editedItem : user)));
    } else if (editMode === 'project') {
      const { error } = await supabase
        .from(editedItem.table)
        .update({
          title: editedItem.title,
          category: editedItem.category,
          description: editedItem.description,
          price: Number(editedItem.price),
          status: editedItem.status
        })
        .eq('id', editedItem.id);

      if (error) {
        alert('Ошибка при сохранении данных проекта: ' + error.message);
        return;
      }
      setProjects(prev =>
        prev.map(project =>
          project.id === editedItem.id && project.table === editedItem.table ? editedItem : project
        )
      );
    }

    alert('Данные успешно сохранены!');
    setEditMode(null);
    setEditedItem(null);
  };

  const handleDelete = async (item, type) => {
    if (type === 'user') {
      const { error } = await supabase.from('users').delete().eq('id', item.id);
      if (error) {
        alert('Ошибка при удалении пользователя: ' + error.message);
        return;
      }
      setUsers(prev => prev.filter(user => user.id !== item.id));
    } else if (type === 'project') {
      const { error } = await supabase.from(item.table).delete().eq('id', item.id);
      if (error) {
        alert('Ошибка при удалении проекта: ' + error.message);
        return;
      }
      setProjects(prev => prev.filter(project => !(project.id === item.id && project.table === item.table)));
    }
    alert('Элемент успешно удалён!');
  };

  return (
    <div className="admin-details-container">
      <div className="section">
        <h3>Управление пользователями</h3>
        {users.map(user => (
          <div key={user.id} className="detail-row">
            {editMode === 'user' && editedItem?.id === user.id ? (
              <>
                <input
                  type="text"
                  name="username"
                  value={editedItem.username}
                  onChange={handleInputChange}
                  placeholder="Никнейм"
                />
                <input
                  type="email"
                  name="email"
                  value={editedItem.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
                <select name="role" value={editedItem.role} onChange={handleInputChange}>
                  <option value="artist">Художник</option>
                  <option value="hirer">Работодатель</option>
                </select>
                <input
                  type="text"
                  name="telegram_username"
                  value={editedItem.telegram_username || ''}
                  onChange={handleInputChange}
                  placeholder="Telegram"
                />
                <select name="is_admin" value={editedItem.is_admin} onChange={handleInputChange}>
                  <option value={true}>Админ</option>
                  <option value={false}>Не админ</option>
                </select>
                <button onClick={handleSave} className="save-btn">Сохранить</button>
                <button onClick={() => setEditMode(null)} className="cancel-btn">Отмена</button>
              </>
            ) : (
              <>
                <span className="value">{user.username} ({user.email}) - {user.role}</span>
                <button onClick={() => handleEdit(user, 'user')} className="edit-btn">Редактировать</button>
                <button onClick={() => handleDelete(user, 'user')} className="delete-btn">Удалить</button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="section">
        <h3>Управление проектами</h3>
        {projects.map(project => (
          <div key={`${project.table}-${project.id}`} className="detail-row">
            {editMode === 'project' && editedItem?.id === project.id && editedItem?.table === project.table ? (
              <>
                <input
                  type="text"
                  name="title"
                  value={editedItem.title}
                  onChange={handleInputChange}
                  placeholder="Название"
                />
                <input
                  type="text"
                  name="category"
                  value={editedItem.category}
                  onChange={handleInputChange}
                  placeholder="Категория"
                />
                <textarea
                  ref={textareaRef}
                  name="description"
                  value={editedItem.description}
                  onChange={(e) => {
                    handleInputChange(e);
                    handleTextareaResize();
                  }}
                  placeholder="Описание"
                />
                <input
                  type="number"
                  name="price"
                  value={editedItem.price}
                  onChange={handleInputChange}
                  placeholder="Цена"
                />
                <select name="status" value={editedItem.status} onChange={handleInputChange}>
                  <option value="open">Открыт</option>
                  <option value="closed">Закрыт</option>
                </select>
                <button onClick={handleSave} className="save-btn">Сохранить</button>
                <button onClick={() => setEditMode(null)} className="cancel-btn">Отмена</button>
              </>
            ) : (
              <>
                <span className="value">{project.title} ({project.table}) - {project.status}</span>
                <button onClick={() => handleEdit(project, 'project')} className="edit-btn">Редактировать</button>
                <button onClick={() => handleDelete(project, 'project')} className="delete-btn">Удалить</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
