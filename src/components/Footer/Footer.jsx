import { useState, useRef, useEffect } from 'react';
import './Footer.css';

import locationIcon from '../../assets/location-icon.png';
import phoneIcon from '../../assets/phone-icon.png';
import emailIcon from '../../assets/email-icon.png';
import instagramIcon from '../../assets/instagram-icon.png';
import tiktokIcon from '../../assets/tiktok-icon.png';
import notionIcon from '../../assets/notion-icon.png';

function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(null);
  const textareaRef = useRef(null);
  const modalRef = useRef(null);

  // Open/close modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setMessage('');
    setEmail('');
    setIsEmailValid(null);
  };

  // Handle clicks outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Email validation
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(value === '' ? null : validateEmail(value));
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }
    // Placeholder for form submission logic (e.g., API call)
    alert('Feedback submitted! (Placeholder)');
    closeModal();
  };

  return (
    <footer id="contacts" className="Footer">
      <div className="Footer-container">
        <div className="Footer-contact">
          <div className="Footer-contact-item">
            <img src={locationIcon} alt="Location" className="Footer-icon" />
            <p className="Footer-text">21 Revolution Street, Paris, France</p>
          </div>
          <div className="Footer-contact-item">
            <img src={phoneIcon} alt="Phone" className="Footer-icon" />
            <p className="Footer-text">+1 555 123456</p>
          </div>
          <div className="Footer-contact-item">
            <img src={emailIcon} alt="Email" className="Footer-icon" />
            <p className="Footer-text">
              <a href="mailto:support@company.com" className="Footer-link">support@company.com</a>
            </p>
          </div>
          <button className="Footer-feedback-button" onClick={openModal}>
            Обратная связь
          </button>
        </div>
        <div className="Footer-about">
          <h3 className="Footer-title">Наши ценности</h3>
          <p className="Footer-description">
            Мы поддерживаем талантливых художников, помогая им раскрыть свой потенциал. Наша цель — дать каждому шанс найти своё место в мире искусства.
          </p>
          <div className="Footer-socials">
            <a href="https://instagram.com" className="Footer-social-icon">
              <img src={instagramIcon} alt="Instagram" className="Footer-social-image" />
            </a>
            <a href="https://tiktok.com" className="Footer-social-icon">
              <img src={tiktokIcon} alt="TikTok" className="Footer-social-image" />
            </a>
            <a href="https://notion.so" className="Footer-social-icon">
              <img src={notionIcon} alt="Notion" className="Footer-social-image" />
            </a>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="Footer-modal-overlay">
          <div className="Footer-modal" ref={modalRef}>
            <button className="Footer-modal-close" onClick={closeModal}>
              ×
            </button>
            <h2 className="Footer-modal-title">Обратная связь</h2>
            <form className="Footer-modal-form" onSubmit={handleSubmit}>
              <div className="Footer-modal-field">
                <label htmlFor="name">Имя</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Ваше имя"
                  required
                />
              </div>
              <div className="Footer-modal-field">
                <label htmlFor="email">Почта</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Ваша почта"
                  value={email}
                  onChange={handleEmailChange}
                  className={isEmailValid === null ? '' : isEmailValid ? 'valid' : 'invalid'}
                  required
                />
              </div>
              <div className="Footer-modal-field">
                <label htmlFor="message">Сообщение</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Ваше сообщение"
                  value={message}
                  onChange={handleMessageChange}
                  ref={textareaRef}
                  required
                />
              </div>
              <button type="submit" className="Footer-modal-submit">
                Отправить
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;
