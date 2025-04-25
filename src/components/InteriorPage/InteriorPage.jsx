import React from 'react';
import '../ThreeDPage/3DPage.css'; // Переиспользуем стили

function InteriorPage() {
  const jobs = [
    {
      title: 'Дизайнер интерьеров',
      salary: '250000 – 450000 ₸ за месяц, на руки',
      company: 'ТОО Design House',
      location: 'Алматы',
      description: 'Проектирование интерьеров для жилых помещений, работа с клиентами.',
      deadline: '30 дней',
      publishedDate: '17 октября 2025',
    },
    {
      title: 'Архитектор-дизайнер',
      salary: '300000 – 600000 ₸ за месяц, на руки',
      company: 'ТОО Interior Solutions',
      location: 'Астана',
      description: 'Разработка дизайн-проектов для офисов и коммерческих помещений.',
      deadline: '40 дней',
      publishedDate: '13 октября 2025',
    },
    {
      title: 'Специалист по декору интерьеров',
      salary: '200000 – 400000 ₸ за месяц, до вычета налогов',
      company: 'ТОО Decor Studio',
      location: 'Караганда',
      description: 'Подбор мебели и декора для интерьеров.',
      deadline: '25 дней',
      publishedDate: '9 октября 2025',
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

export default InteriorPage;
