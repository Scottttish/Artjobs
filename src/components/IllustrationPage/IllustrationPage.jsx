import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../ThreeDPage/3DPage.css';

// Инициализация Supabase клиента
const supabase = createClient(
  'https://jvccejerkjfnkwtqumcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NlamVya2pmbmt3dHF1bWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTMzMjAsImV4cCI6MjA2MTA4OTMyMH0.xgqIMs3r007pJIeV5P8y8kG4hRcFqrgXvkkdavRtVIw'
);

function IllustrationPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      // Загрузка вакансий из таблицы illustration
      const { data: jobData, error: jobError } = await supabase
        .from('illustration')
        .select('id, user_id, title, description, published_at, start_date, end_date, price, status, category')
        .eq('category', 'Иллюстрация');

      if (jobError) {
        console.error('Error fetching jobs from illustration:', jobError);
        setError('Ошибка загрузки вакансий: ' + jobError.message);
        setLoading(false);
        return;
      }

      console.log('Fetched jobs from illustration:', jobData);

      // Если данных нет, проверяем, какие категории существуют
      if (jobData.length === 0) {
        const { data: allCategories, error: categoryError } = await supabase
          .from('illustration')
          .select('category');
        if (categoryError) {
          console.error('Error fetching categories:', categoryError);
        } else {
          console.log('Available categories in illustration:', [...new Set(allCategories.map(job => job.category))]);
        }
      }

      // Для каждой вакансии получаем никнейм работодателя
      const jobsWithCompany = await Promise.all(
        jobData.map(async (job) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('username')
            .eq('id', job.user_id)
            .single();

          if (userError) {
            console.error('Error fetching user data for user_id', job.user_id, ':', userError);
            return { ...job, company: 'Неизвестный работодатель' };
          }

          // Расчёт дедлайна (разница между end_date и start_date в днях)
          const startDate = new Date(job.start_date);
          const endDate = new Date(job.end_date);
          
          // Проверка на валидность дат
          let deadlineDays = 'Не указано';
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            deadlineDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            deadlineDays = `${deadlineDays} дней`;
          }

          // Форматирование даты публикации
          const publishedDateObj = new Date(job.published_at);
          const publishedDate = !isNaN(publishedDateObj.getTime())
            ? publishedDateObj.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : 'Не указано';

          return {
            ...job,
            company: userData.username || 'Неизвестный работодатель',
            salary: job.price ? `${job.price} ₸` : 'Не указано',
            publishedDate,
            deadline: deadlineDays
          };
        })
      );

      setJobs(jobsWithCompany);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <main>
          <div className="job-listings-container">
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
          <div className="job-listings-container">
            <div className="error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <main>
        <div className="job-listings-container">
          {jobs.length === 0 ? (
            <p className="no-jobs">Вакансий в категории Иллюстрация пока нет.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="job-card">
                <h3 className="job-title">{job.title}</h3>
                <p className="job-salary">{job.salary}</p>
                <p className="job-company">
                  <span className="company-name">{job.company}</span>
                  <span className="verified">✔</span>
                </p>
                <p className="job-deadline">
                  <span className="deadline-label">Срок выполнения:</span> {job.deadline}
                </p>
                <p className="job-published">
                  <span className="published-label">Дата публикации:</span> {job.publishedDate}
                </p>
                <p className="job-description-label">Описание работы:</p>
                <p className="job-description">{job.description}</p>
                <button className="apply-btn">Откликнуться</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default IllustrationPage;
