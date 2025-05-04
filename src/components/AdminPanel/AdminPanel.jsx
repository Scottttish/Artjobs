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
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [tempUser, setTempUser] = useState({
    id: '',
    username: '',
    email: '',
    role: 'artist',
    telegram_username: '',
    is_admin: 'false'
  });
  const [tempProject, setTempProject] = useState({
    id: '',
    title: '',
    category: '',
    description: '',
    start_date: '',
    end_date: '',
    price: '',
    status: 'open',
    table: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef(null);

  const tableMap = {
    '3D': 'three_d',
    'Интерьер': 'interior',
    'Моушн': 'motion',
    'Иллюстрация': 'illustration',
    'Другое': 'other'
  };

  const isValidDateFormat = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const openUserModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setEditingId(user.id);
      setTempUser({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        telegram_username: user.telegram_username || '',
        is_admin: user.is_admin.toString()
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setTempUser({
        id: '',
        username: '',
        email: '',
        role: 'artist',
        telegram_username: '',
        is_admin: 'false'
      });
    }
    setModalError(null);
    setUserModalOpen(true);
  };

  const openProjectModal = (project = null) => {
    if (project) {
      setIsEditing(true);
      setEditingId(project.id);
      setTempProject({
        id: project.id,
        title: project.title,
        category: project.category,
        description: project.description || '',
        start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
        end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
        price: project.price,
        status: project.status,
        table: project.table
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setTempProject({
        id: '',
        title: '',
        category: '',
        description: '',
        start_date: '',
        end_date: '',
        price: '',
        status: 'open',
        table: ''
      });
    }
    setModalError(null);
    setProjectModalOpen(true);
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setTempUser(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setTempProject(prev => ({ ...prev, [name]: value }));
  };

  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (projectModalOpen && textareaRef.current) {
      handleTextareaResize();
    }
  }, [projectModalOpen]);

  const saveUser = async () => {
    if (isSaving) return;
    setModalError(null);

    const { username, email, role, telegram_username, is_admin } = tempUser;
    if (!username || !email || !role) {
      setModalError('Никнейм, email и роль обязательны!');
      return;
    }

    setIsSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Пожалуйста, войдите в систему.');
      }

      const userData = {
        username,
        email,
        role,
        telegram_username: telegram_username || null,
        is_admin: is_admin === 'true'
      };

      if (isEditing) {
        console.log('Updating user:', userData);
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingId);
        if (updateError) throw updateError;
        setUsers(prev => prev.map(user => (user.id === editingId ? { ...userData, id: editingId } : user)));
      }

      setUserModalOpen(false);
      setTempUser({
        id: '',
        username: '',
        email: '',
        role: 'artist',
        telegram_username: '',
        is_admin: 'false'
      });
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      // eslint-disable-next-line no-undef
      console.error('Save user error:', error);
      // eslint-disable-next-line no-undef
      setModalError(`Ошибка при сохранении: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveProject = async () => {
    if (isSaving) return;
    setModalError(null);

    const { title, category, description, start_date, end_date, price, status, table } = tempProject;
    if (!title || !category || !price || !status) {
      setModalError('Название, категория, цена и статус обязательны!');
      return;
    }
    if (start_date && !isValidDateFormat(start_date)) {
      setModalError('Дата начала должна быть в формате ГГГГ-ММ-ДД!');
      return;
    }
    if (end_date && !isValidDateFormat(end_date)) {
      setModalError('Дата окончания должна быть в формате ГГГГ-ММ-ДД!');
      return;
    }
    if (isNaN(price) || Number(price) <= 0) {
      setModalError('Цена должна быть положительным числом!');
      return;
    }

    setIsSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Пожалуйста, войдите в систему.');
      }

      const projectTable = tableMap[category] || 'other';
      const projectData = {
        title,
        category,
        description: description || null,
        start_date: start_date ? new Date(start_date).toISOString() : null,
        end_date: end_date ? new Date(end_date).toISOString() : null,
        price: Number(price),
        status,
        user_id: sessionData.session.user.id,
        published_at: new Date().toISOString()
      };

      if (isEditing) {
        console.log('Updating project:', projectData);
        if (table === projectTable) {
          const { error: updateError } = await supabase
            .from(projectTable)
            .update(projectData)
            .eq('id', editingId);
          if (updateError) throw updateError;
        } else {
          const { error: deleteError } = await supabase.from(table).delete().eq('id', editingId);
          if (deleteError) throw deleteError;
          const { data, error: insertError } = await supabase.from(projectTable).insert(projectData).select();
          if (insertError) throw insertError;
          setEditingId(data[0].id);
        }
        setProjects(prev =>
          prev.map(project =>
            project.id === editingId && project.table === table
              ? { ...projectData, id: editingId, table: projectTable }
              : project
          )
        );
      }

      setProjectModalOpen(false);
      setTempProject({
        id: '',
        title: '',
        category: '',
        description: '',
        start_date: '',
        end_date: '',
        price: '',
        status: 'open',
        table: ''
      });
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      // eslint-disable-next-line no-undef
      console.error('Save project error:', error);
      // eslint-disable-next-line no-undef
      setModalError(`Ошибка при сохранении: ${error.message}`);
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
        const { error: deleteError } = await supabase.from('users').delete().eq('id', item.id);
        if (deleteError) throw deleteError;
        setUsers(prev => prev.filter(user => user.id !== item.id));
      } else if (type === 'project') {
        const { error: deleteError } = await supabase.from(item.table).delete().eq('id', item.id);
        if (deleteError) throw deleteError;
        setProjects(prev => prev.filter(project => !(project.id === item.id && project.table === item.table)));
      }
    } catch (error) {
      console.error('Delete error:', error);
      setModalError(`Ошибка при удалении: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-details-container">
      {modalError && <div className="error">{modalError}</div>}
      <div className="section">
        <h3>Управление пользователями</h3>
        {users.map(user => (
          <div key={user.id} className="detail-row">
            <span className="value">{user.username} ({user.email}) - {user.role}</span>
            <button onClick={() => openUserModal(user)} className="edit-btn" disabled={isDeleting}>
              Редактировать
            </button>
            <button onClick={() => handleDelete(user, 'user')} className="delete-btn" disabled={isDeleting}>
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        ))}
      </div>

      <div className="section">
        <h3>Управление проектами</h3>
        {projects.map(project => (
          <div key={`${project.table}-${project.id}`} className="detail-row">
            <span className="value">{project.title} ({project.table}) - {project.status}</span>
            <button onClick={() => openProjectModal(project)} className="edit-btn" disabled={isDeleting}>
              Редактировать
            </button>
            <button onClick={() => handleDelete(project, 'project')} className="delete-btn" disabled={isDeleting}>
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        ))}
      </div>

      {userModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Редактировать пользователя</h3>
            {modalError && <div className="error">{modalError}</div>}
            <div className="modal-field">
              <label>Никнейм</label>
              <input
                type="text"
                name="username"
                value={tempUser.username}
                onChange={handleUserInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={tempUser.email}
                onChange={handleUserInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>Роль</label>
              <select name="role" value={tempUser.role} onChange={handleUserInputChange}>
                <option value="artist">Художник</option>
                <option value="hirer">Работодатель</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Telegram</label>
              <input
                type="text"
                name="telegram_username"
                value={tempUser.telegram_username}
                onChange={handleUserInputChange}
                placeholder="@username"
              />
            </div>
            <div className="modal-field">
              <label>Администратор</label>
              <select name="is_admin" value={tempUser.is_admin} onChange={handleUserInputChange}>
                <option value="true">Админ</option>
                <option value="false">Не админ</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setUserModalOpen(false)} disabled={isSaving}>Отмена</button>
              <button onClick={saveUser} disabled={isSaving}>
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {projectModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Редактировать проект</h3>
            {modalError && <div className="error">{modalError}</div>}
            <div className="modal-field">
              <label>Название</label>
              <input
                type="text"
                name="title"
                value={tempProject.title}
                onChange={handleProjectInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>Категория</label>
              <select name="category" value={tempProject.category} onChange={handleProjectInputChange} required>
                <option value="">Выберите категорию</option>
                <option value="3D">3D</option>
                <option value="Интерьер">Интерьер</option>
                <option value="Моушн">Моушн</option>
                <option value="Иллюстрация">Иллюстрация</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Описание</label>
              <textarea
                ref={textareaRef}
                name="description"
                value={tempProject.description}
                onChange={(e) => {
                  handleProjectInputChange(e);
                  handleTextareaResize();
                }}
                rows="4"
              />
            </div>
            <div className="modal-field">
              <label>Дата начала</label>
              <input
                type="date"
                name="start_date"
                value={tempProject.start_date}
                onChange={handleProjectInputChange}
              />
            </div>
            <div className="modal-field">
              <label>Дата окончания</label>
              <input
                type="date"
                name="end_date"
                value={tempProject.end_date}
                onChange={handleProjectInputChange}
              />
            </div>
            <div className="modal-field">
              <label>Цена</label>
              <input
                type="number"
                name="price"
                value={tempProject.price}
                onChange={handleProjectInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>Статус</label>
              <select name="status" value={tempProject.status} onChange={handleProjectInputChange}>
                <option value="open">Открыт</option>
                <option value="closed">Закрыт</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setProjectModalOpen(false)} disabled={isSaving}>Отмена</button>
              <button onClick={saveProject} disabled={isSaving}>
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
