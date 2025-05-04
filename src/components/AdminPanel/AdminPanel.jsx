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
    const tables = ['interior', 'motion', 'three_d', 'illustration', 'other'];

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          throw new Error('Пожалуйста, войдите в систему.');
        }

        const userId = sessionData.session.user.id;
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', userId)
          .single();

        if (userError || !userData?.is_admin) {
          throw new Error('Доступ запрещён. Только для администраторов.');
        }

        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, username, email, role, telegram_username, is_admin');
        if (usersError) throw new Error('Ошибка загрузки данных пользователей: ' + usersError.message);

        let allProjects = [];
        for (const table of tables) {
          const { data: projectData, error: projectError } = await supabase
            .from(table)
            .select('id, user_id, title, category, description, published_at, start_date, end_date, price, status');
          if (projectError) throw new Error(`Ошибка загрузки данных из ${table}: ` + projectError.message);
          allProjects = [...allProjects, ...projectData.map(project => ({ ...project, table }))];
        }

        setUsers(usersData || []);
        setProjects(allProjects || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const userSubscription = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('User change:', payload);
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
            console.log(`${table} change:`, payload);
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const textareaRef = useRef(null);

  const categories = ['interior', 'motion', 'three_d', 'illustration', 'other'];

  const handleEdit = (item, type) => {
    setEditMode(type);
    setEditedItem({ ...item });
    setSaveError(null);
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
    if (!editMode || !editedItem || isSaving) return;
    setSaveError(null);

    // Validation
    if (editMode === 'user') {
      if (!editedItem.username || !editedItem.email) {
        setSaveError('Никнейм и email обязательны!');
        return;
      }
    } else if (editMode === 'project') {
      if (!editedItem.title || !editedItem.category || isNaN(editedItem.price)) {
        setSaveError('Название, категория и цена обязательны, и цена должна быть числом!');
        return;
      }
    }

    setIsSaving(true);
    try {
      if (editMode === 'user') {
        console.log('Saving user:', editedItem);
        const { error } = await supabase
          .from('users')
          .update({
            username: editedItem.username,
            email: editedItem.email,
            role: editedItem.role,
            telegram_username: editedItem.telegram_username || null,
            is_admin: editedItem.is_admin === 'true' // Convert string to boolean
          })
          .eq('id', editedItem.id);
        if (error) throw error;
        setUsers(prev => prev.map(user => (user.id === editedItem.id ? { ...editedItem, is_admin: editedItem.is_admin === 'true' } : user)));
      } else if (editMode === 'project') {
        console.log('Saving project:', editedItem);
        const { error } = await supabase
          .from(editedItem.table)
          .update({
            title: editedItem.title,
            category: editedItem.category,
            description: editedItem.description || null,
            price: Number(editedItem.price),
            status: editedItem.status
          })
          .eq('id', editedItem.id);
        if (error) throw error;
        setProjects(prev =>
          prev.map(project =>
            project.id === editedItem.id && project.table === editedItem.table ? editedItem : project
          )
        );
      }
      setEditMode(null);
      setEditedItem(null);
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(`Ошибка при сохранении: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item, type) => {
    if (isDeleting || !window.confirm(`Вы уверены, что хотите удалить ${type === 'user' ? 'пользователя' : 'проект'}?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      console.log('Deleting:', { item, type });
      if (type === 'user') {
        const { error } = await supabase.from('users').delete().eq('id', item.id);
        if (error) throw error;
        setUsers(prev => prev.filter(user => user.id !== item.id));
      } else if (type === 'project') {
        const { error } = await supabase.from(item.table).delete().eq('id', item.id);
        if (error) throw error;
        setProjects(prev => prev.filter(project => !(project.id === item.id && project.table === item.table)));
      }
    } catch (error) {
      console.error('Delete error:', error);
      setSaveError(`Ошибка при удалении: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-details-container">
      {saveError && <div className="error">{saveError}</div>}
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
                  <option value="true">Админ</option>
                  <option value="false">Не админ</option>
                </select>
                <button onClick={handleSave} className="save-btn" disabled={isSaving}>
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button onClick={() => setEditMode(null)} className="cancel-btn" disabled={isSaving}>
                  Отмена
                </button>
              </>
            ) : (
              <>
                <span className="value">{user.username} ({user.email}) - {user.role}</span>
                <button onClick={() => handleEdit(user, 'user')} className="edit-btn" disabled={isDeleting}>
                  Ред主
                  .edit-btn:hover {
                    background-color: #f0f0f0;
                  }
                  .cancel-btn:hover {
                    background-color: #f0f0f0;
                  }
                </style>
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
                <select name="category" value={editedItem.category} onChange={handleInputChange}>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <textarea
                  ref={textareaRef}
                  name="description"
                  value={editedItem.description || ''}
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
                <button onClick={handleSave} className="save-btn" disabled={isSaving}>
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button onClick={() => setEditMode(null)} className="cancel-btn" disabled={isSaving}>
                  Отмена
                </button>
              </>
            ) : (
              <>
                <span className="value">{project.title} ({project.table}) - {project.status}</span>
                <button onClick={() => handleEdit(project, 'project')} className="edit-btn" disabled={isDeleting}>
                  Редактировать
                </button>
                <button onClick={() => handleDelete(project, 'project')} className="delete-btn" disabled={isDeleting}>
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
