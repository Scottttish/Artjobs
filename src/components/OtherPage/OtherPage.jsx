import React from 'react';
import '../ThreeDPage/3DPage.css'; 

function OtherPage() {
  const jobs = [
    {
      title: 'Фотограф',
      salary: '180000 – 300000 ₸ за месяц, на руки',
      company: 'ТОО Photo Studio',
      location: 'Алматы',
      description: 'Съёмка мероприятий и портретов, обработка фотографий.',
      deadline: '30 дней',
      publishedDate: '16 октября 2025',
    },
    {
      title: 'Графический дизайнер',
      salary: '200000 – 400000 ₸ за месяц, на руки',
      company: 'ТОО Design Agency',
      location: 'Астана',
      description: 'Создание логотипов, баннеров и фирменного стиля.',
      deadline: '35 дней',
      publishedDate: '11 октября 2025',
    },
    {
      title: 'Копирайтер',
      salary: '150000 – 300000 ₸ за месяц, до вычета налогов',
      company: 'ТОО Content Creators',
      location: 'Удалённо',
      description: 'Написание текстов для сайтов и рекламы.',
      deadline: '20 дней',
      publishedDate: '7 октября 2025',
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

export default OtherPage;
