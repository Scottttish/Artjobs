import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminPanel.css';

function AdminPanel() {
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Проверка роли пользователя
      const { data: user } = await supabase.auth.getUser();
      if (user.user && user.user.user_metadata.role !== 'admin') {
        alert('Доступ запрещён. Только для администраторов.');
        return;
      }

      // Загрузка вакансий
      const { data: jobsData } = await supabase
        .from('jobs') // Предполагаем объединённую таблицу или UNION всех категорий
        .select('*');
      setJobs(jobsData);

      // Загрузка работодателей
      const { data: employersData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'employer');
      setEmployers(employersData);

      // Загрузка фрилансеров
      const { data: freelancersData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'freelancer');
      setFreelancers(freelancersData);
    };
    fetchData();
  }, []);

  const handleDeleteJob = async (jobId) => {
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (!error) setJobs(jobs.filter((job) => job.id !== jobId));
  };

  const handleEditJob = async (job) => {
    setSelectedJob(job);
    // Логика редактирования (например, открытие формы)
  };

  const handleSaveJob = async (updatedJob) => {
    const { error } = await supabase
      .from('jobs')
      .update(updatedJob)
      .eq('id', updatedJob.id);
    if (!error) {
      setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
      setSelectedJob(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) {
      setEmployers(employers.filter((user) => user.id !== userId));
      setFreelancers(freelancers.filter((user) => user.id !== userId));
    }
  };

  const handleEditUser = async (user) => {
    setSelectedUser(user);
    // Логика редактирования (например, открытие формы)
  };

  const handleSaveUser = async (updatedUser) => {
    const { error } = await supabase
      .from('users')
      .update(updatedUser)
      .eq('id', updatedUser.id);
    if (!error) {
      setEmployers(
        employers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setFreelancers(
        freelancers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setSelectedUser(null);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Панель администратора</h1>

      {/* Секция 1: Управление вакансиями */}
      <section>
        <h2>Управление вакансиями</h2>
        {jobs.map((job) => (
          <div key={job.id}>
            <h3>{job.title}</h3>
            <button onClick={() => handleEditJob(job)}>Редактировать</button>
            <button onClick={() => handleDeleteJob(job.id)}>Удалить</button>
          </div>
        ))}
        {selectedJob && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveJob(selectedJob); }}>
            <input
              value={selectedJob.title}
              onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
            />
            <button type="submit">Сохранить</button>
            <button onClick={() => setSelectedJob(null)}>Отмена</button>
          </form>
        )}
      </section>

      {/* Секция 2: Управление работодателями */}
      <section>
        <h2>Управление работодателями</h2>
        {employers.map((user) => (
          <div key={user.id}>
            <h3>{user.username}</h3>
            <button onClick={() => handleEditUser(user)}>Редактировать</button>
            <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
          </div>
        ))}
        {selectedUser && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(selectedUser); }}>
            <input
              value={selectedUser.username}
              onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
            />
            <button type="submit">Сохранить</button>
            <button onClick={() => setSelectedUser(null)}>Отмена</button>
          </form>
        )}
      </section>

      {/* Секция 3: Управление художниками */}
      <section>
        <h2>Управление художниками</h2>
        {freelancers.map((user) => (
          <div key={user.id}>
            <h3>{user.username}</h3>
            <button onClick={() => handleEditUser(user)}>Редактировать</button>
            <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
          </div>
        ))}
        {selectedUser && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(selectedUser); }}>
            <input
              value={selectedUser.username}
              onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
            />
            <button type="submit">Сохранить</button>
            <button onClick={() => setSelectedUser(null)}>Отмена</button>
          </form>
        )}
      </section>
    </div>
  );
}

export default AdminPanel;
