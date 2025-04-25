import React from 'react';
import './3DPage.css';

function ThreeDPage() {
  const jobs = [
    {
      title: 'Агент по привлечению водителей',
      salary: '175000 – 250000 ₸ за месяц, на руки',
      company: 'ТОО inDrive',
      location: 'Астана',
      description: 'Работа с водителями, привлечение новых клиентов, работа в офисе и на выезде.',
      deadline: '30 дней', // Срок выполнения работы
      publishedDate: '15 октября 2025', // Дата публикации
    },
    {
      title: 'Менеджер по работе с клиентами',
      salary: '450000 – 2000000 ₸ за месяц, на руки',
      company: 'ТОО TK Стан - Астана',
      location: 'Астана, улица Ахмета Байтурсынова, 13',
      description: 'Работа с клиентами, обработка заказов, ведение переговоров.',
      deadline: '45 дней',
      publishedDate: '10 октября 2025',
    },
    {
      title: 'Сату менеджері',
      salary: '450000 – 1000000 ₸ за месяц, до вычета налогов',
      company: 'ТОО Ozat Online',
      location: 'Астана',
      description: 'Продажи услуг компании, работа с клиентами, ведение отчётности.',
      deadline: '20 дней',
      publishedDate: '5 октября 2025',
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

export default ThreeDPage;
