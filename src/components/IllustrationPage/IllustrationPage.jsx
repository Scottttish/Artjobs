import React from 'react';
import '../ThreeDPage/3DPage.css';

function IllustrationPage() {
  const jobs = [
    {
      title: 'Иллюстратор детских книг',
      salary: '150000 – 300000 ₸ за месяц, на руки',
      company: 'ТОО Fairy Tales',
      location: 'Алматы',
      description: 'Создание иллюстраций для детских книг, работа с авторами.',
      deadline: '30 дней',
      publishedDate: '18 октября 2025',
    },
    {
      title: 'Художник-иллюстратор',
      salary: '200000 – 400000 ₸ за месяц, на руки',
      company: 'ТОО Art Studio',
      location: 'Астана',
      description: 'Разработка иллюстраций для журналов и рекламы.',
      deadline: '35 дней',
      publishedDate: '14 октября 2025',
    },
    {
      title: 'Фриланс-иллюстратор',
      salary: '180000 – 350000 ₸ за месяц, до вычета налогов',
      company: 'ТОО Freelance Hub',
      location: 'Удалённо',
      description: 'Создание цифровых иллюстраций для клиентов.',
      deadline: '20 дней',
      publishedDate: '10 октября 2025',
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
            <span className="verifid">✔</span>
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

export default IllustrationPage;
