import React from 'react';
import '../ThreeDPage/3DPage.css'; 

function MotionPage() {
  const jobs = [
    {
      title: 'Моушн-дизайнер',
      salary: '200000 – 350000 ₸ за месяц, на руки',
      company: 'ТОО Creative Studio',
      location: 'Алматы',
      description: 'Создание анимаций для рекламы, работа с After Effects и Cinema 4D.',
      deadline: '25 дней',
      publishedDate: '20 октября 2025',
    },
    {
      title: 'Аниматор для видеороликов',
      salary: '300000 – 500000 ₸ за месяц, на руки',
      company: 'ТОО Motion Works',
      location: 'Астана',
      description: 'Разработка анимационных роликов для соцсетей, работа с клиентами.',
      deadline: '40 дней',
      publishedDate: '12 октября 2025',
    },
    {
      title: 'Специалист по моушн-графике',
      salary: '250000 – 400000 ₸ за месяц, до вычета налогов',
      company: 'ТОО Visual Effects',
      location: 'Шымкент',
      description: 'Создание визуальных эффектов для видео, работа в команде.',
      deadline: '15 дней',
      publishedDate: '8 октября 2025',
    },
  ];

  return (
    <div className="job-listings-container">
      {jobs.map((job, index) => (
        <div key={index} className="job-card">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-salary">{job.salary}</p>
          <p className="job-company">
            <span className="company-name">{job.company}</span>
            <span className="verified">✔</span>
          </p>
          <p className="job-location">{job.location}</p>
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
      ))}
    </div>
  );
}

export default MotionPage;
