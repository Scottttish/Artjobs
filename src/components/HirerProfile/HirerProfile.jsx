import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './HirerProfile.css';

// Инициализация Supabase клиента
const supabase = createClient(
  'https://jvccejerkjfnkwtqumcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NlamVya2pmbmt3dHF1bWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTMzMjAsImV4cCI6MjA2MTA4OTMyMH0.xgqIMs3r007pJIeV5P8y8kG4hRcFqrgXvkkdavRtVIw'
);

const HirerProfile = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState({ ...userInfo });
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [tempProduct, setTempProduct] = useState({
    title: '',
    direction: '',
    description: '',
    startDate: '',
    endDate: '',
    price: '',
    status: 'Active',
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('All Products');

  // Валидация формата даты (ожидается YYYY-MM-DD)
  const isValidDateFormat = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Получение сессии пользователя
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Session error:', sessionError);
        setError('Пожалуйста, войдите в систему.');
        setLoading(false);
        return;
      }

      const userId = sessionData.session.user.id;

      // Загрузка данных пользователя
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, email, password')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setError('Ошибка загрузки данных пользователя.');
      } else {
        setUserInfo({
          nickname: userData.username || 'User123',
          email: userData.email || 'user@example.com',
          password: userData.password || '********',
        });
        setTempUserInfo({
          nickname: userData.username || 'User123',
          email: userData.email || 'user@example.com',
          password: userData.password || '********',
        });
      }

      // Загрузка истории
      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select('id, number, title, date, status')
        .eq('user_id', userId);

      if (historyError) {
        console.error('Error fetching history:', historyError);
        setError('Ошибка загрузки истории.');
      } else {
        setHistoryItems(historyData.map(item => ({
          number: item.number,
          title: item.title,
          date: new Date(item.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).toUpperCase(),
          status: item.status,
          statusClass: item.status.toLowerCase(),
        })));
      }

      // Загрузка продуктов из всех таблиц
      const tables = ['illustration', 'motion', 'other', 'interior'];
      let allProducts = [];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('id, title, category, description, published_at, start_date, end_date, price, status')
          .eq('user_id', userId);

        if (error) {
          console.error(`Error fetching from ${table}:`, error);
          setError(`Ошибка загрузки данных из таблицы ${table}.`);
        } else {
          const mappedProducts = data.map(product => ({
            id: product.id,
            title: product.title,
            direction: product.category,
            description: product.description,
            date: new Date(product.published_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).toUpperCase(),
            status: product.status,
            price: product.price,
            duration: calculateDuration(product.start_date, product.end_date),
            durationTooltip: `${new Date(product.start_date).toLocaleDateString('en-GB')} - ${new Date(product.end_date).toLocaleDateString('en-GB')}`,
          }));
          allProducts = [...allProducts, ...mappedProducts];
        }
      }

      setProducts(allProducts);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Uploading image:', file.name);
    }
  };

  const openModal = () => {
    setTempUserInfo({ ...userInfo });
    setModalOpen(true);
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    const userId = sessionData.session.user.id;

    const { error } = await supabase
      .from('users')
      .update({
        username: tempUserInfo.nickname,
        email: tempUserInfo.email,
        password: tempUserInfo.password,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user info:', error);
      alert('Ошибка при сохранении данных пользователя: ' + error.message);
    } else {
      setUserInfo({ ...tempUserInfo });
      alert('Данные пользователя успешно сохранены!');
    }
    setModalOpen(false);
  };

  const openProductModal = (product = null) => {
    if (product) {
      setIsEditing(true);
      setEditingProductId(product.id);
      const [startDate, endDate] = product.durationTooltip.split(' - ');
      // Преобразуем даты из формата DD.MM.YYYY в YYYY-MM-DD
      const formatDate = (dateStr) => {
        try {
          const [day, month, year] = dateStr.split('.');
          const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          if (!isValidDateFormat(formatted)) {
            throw new Error('Invalid date format');
          }
          return formatted;
        } catch (err) {
          console.error('Error formatting date:', err);
          alert('Ошибка: Неверный формат даты. Ожидается ДД.ММ.ГГГГ (например, 01.01.2023).');
          return '';
        }
      };
      setTempProduct({
        title: product.title,
        direction: product.direction,
        description: product.description,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        price: product.price,
        status: product.status,
      });
    } else {
      setIsEditing(false);
      setEditingProductId(null);
      setTempProduct({
        title: '',
        direction: '',
        description: '',
        startDate: '',
        endDate: '',
        price: '',
        status: 'Active',
      });
    }
    setProductModalOpen(true);
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setTempProduct((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '0 days';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const saveProduct = async () => {
    const { title, direction, description, startDate, endDate, price, status } = tempProduct;
    if (!title || !direction || !description || !startDate || !endDate || !price || !status) {
      alert('Все поля обязательны для заполнения!');
      return;
    }

    // Валидация формата дат
    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      alert('Ошибка: Даты должны быть в формате ГГГГ-ММ-ДД (например, 2023-01-01).');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    const userId = sessionData.session.user.id;
    const tableMap = {
      '3D': 'interior',
      'Моушн': 'motion', // Исправлено с moation на motion
      'Иллюстрация': 'illustration',
      'Другое': 'other',
    };
    const table = tableMap[direction] || 'other';

    const currentDate = new Date();
    const productData = {
      user_id: userId,
      title,
      category: direction,
      description,
      published_at: currentDate.toISOString(),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      price,
      status,
    };

    if (isEditing) {
      // Определяем, из какой таблицы нужно обновить продукт
      const oldProduct = products.find(p => p.id === editingProductId);
      const oldTable = tableMap[oldProduct.direction] || 'other';

      if (oldTable === table) {
        // Обновляем в той же таблице
        const { error } = await supabase
          .from(table)
          .update(productData)
          .eq('id', editingProductId);

        if (error) {
          console.error('Error updating product:', error);
          alert('Ошибка при обновлении объявления: ' + error.message);
          return;
        }
      } else {
        // Удаляем из старой таблицы и добавляем в новую
        const { error: deleteError } = await supabase.from(oldTable).delete().eq('id', editingProductId);
        if (deleteError) {
          console.error('Error deleting product from old table:', deleteError);
          alert('Ошибка при удалении старого объявления: ' + deleteError.message);
          return;
        }

        const { error: insertError } = await supabase.from(table).insert(productData);
        if (insertError) {
          console.error('Error inserting product into new table:', insertError);
          alert('Ошибка при создании нового объявления: ' + insertError.message);
          return;
        }
      }

      setProducts(products.map((p) => (p.id === editingProductId ? {
        id: editingProductId,
        title,
        direction,
        description,
        date: currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).toUpperCase(),
        status,
        price,
        duration: calculateDuration(startDate, endDate),
        durationTooltip: `${new Date(startDate).toLocaleDateString('en-GB')} - ${new Date(endDate).toLocaleDateString('en-GB')}`,
      } : p)));
    } else {
      const { data, error } = await supabase.from(table).insert(productData).select();

      if (error) {
        console.error('Error creating product:', error);
        alert('Ошибка при создании объявления: ' + error.message);
        return;
      }

      setProducts([...products, {
        id: data[0].id,
        title,
        direction,
        description,
        date: currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).toUpperCase(),
        status,
        price,
        duration: calculateDuration(startDate, endDate),
        durationTooltip: `${new Date(startDate).toLocaleDateString('en-GB')} - ${new Date(endDate).toLocaleDateString('en-GB')}`,
      }]);
    }

    setProductModalOpen(false);
    setSelectedProducts([]);
  };

  const handleCheckboxToggle = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDelete = async () => {
    const tableMap = {
      '3D': 'interior',
      'Моушн': 'motion',
      'Иллюстрация': 'illustration',
      'Другое': 'other',
    };

    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      const table = tableMap[product.direction] || 'other';
      const { error } = await supabase.from(table).delete().eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        alert('Ошибка при удалении объявления: ' + error.message);
        return;
      }
    }

    setProducts(products.filter((product) => !selectedProducts.includes(product.id)));
    setSelectedProducts([]);
  };

  const handleRename = () => {
    if (selectedProducts.length === 1) {
      const product = products.find((p) => p.id === selectedProducts[0]);
      openProductModal(product);
    }
  };

  const handleComplete = async (product) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    const userId = sessionData.session.user.id;
    const tableMap = {
      '3D': 'interior',
      'Моушн': 'motion',
      'Иллюстрация': 'illustration',
      'Другое': 'other',
    };
    const table = tableMap[product.direction] || 'other';

    const currentDate = new Date();
    const historyData = {
      user_id: userId,
      number: product.id,
      title: product.title,
      date: currentDate.toISOString(),
      status: 'Completed',
    };

    const { error: insertError } = await supabase.from('history').insert(historyData);
    if (insertError) {
      console.error('Error adding to history:', insertError);
      alert('Ошибка при добавлении в историю: ' + insertError.message);
      return;
    }

    const { error: deleteError } = await supabase.from(table).delete().eq('id', product.id);
    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      alert('Ошибка при удалении объявления: ' + deleteError.message);
      return;
    }

    setHistoryItems([
      {
        number: product.id,
        title: product.title,
        date: currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).toUpperCase(),
        status: 'Completed',
        statusClass: 'completed',
      },
      ...historyItems,
    ]);
    setProducts(products.filter((p) => p.id !== product.id));
  };

  const handleReject = async (product) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    const userId = sessionData.session.user.id;
    const tableMap = {
      '3D': 'interior',
      'Моушн': 'motion',
      'Иллюстрация': 'illustration',
      'Другое': 'other',
    };
    const table = tableMap[product.direction] || 'other';

    const currentDate = new Date();
    const historyData = {
      user_id: userId,
      number: product.id,
      title: product.title,
      date: currentDate.toISOString(),
      status: 'Rejected',
    };

    const { error: insertError } = await supabase.from('history').insert(historyData);
    if (insertError) {
      console.error('Error adding to history:', insertError);
      alert('Ошибка при добавлении в историю: ' + insertError.message);
      return;
    }

    const { error: deleteError } = await supabase.from(table).delete().eq('id', product.id);
    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      alert('Ошибка при удалении объявления: ' + deleteError.message);
      return;
    }

    setHistoryItems([
      {
        number: product.id,
        title: product.title,
        date: currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).toUpperCase(),
        status: 'Rejected',
        statusClass: 'rejected',
      },
      ...historyItems,
    ]);
    setProducts(products.filter((p) => p.id !== product.id));
  };

  const handleRestore = async (historyItem) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    const userId = sessionData.session.user.id;
    const tableMap = {
      '3D': 'interior',
      'Моушн': 'motion',
      'Иллюстрация': 'illustration',
      'Другое': 'other',
    };
    const table = 'other'; // По умолчанию восстанавливаем в "other"

    const currentDate = new Date();
    const productData = {
      user_id: userId,
      title: historyItem.title,
      category: 'Другое',
      description: 'Restored product',
      published_at: currentDate.toISOString(),
      start_date: new Date('2023-01-01').toISOString(),
      end_date: new Date('2024-07-01').toISOString(),
      price: '$19,000',
      status: 'Active',
    };

    const { data, error: insertError } = await supabase.from(table).insert(productData).select();
    if (insertError) {
      console.error('Error restoring product:', insertError);
      alert('Ошибка при восстановлении объявления: ' + insertError.message);
      return;
    }

    const { error: deleteError } = await supabase.from('history').delete().eq('number', historyItem.number);
    if (deleteError) {
      console.error('Error deleting from history:', deleteError);
      alert('Ошибка при удалении из истории: ' + deleteError.message);
      return;
    }

    setProducts([...products, {
      id: data[0].id,
      title: historyItem.title,
      direction: 'Другое',
      description: 'Restored product',
      date: currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase(),
      status: 'Active',
      price: '$19,000',
      duration: '600 days',
      durationTooltip: '01.01.2023 - 01.07.2024',
    }]);
    setHistoryItems(historyItems.filter((item) => item.number !== historyItem.number));
  };

  const handleDeleteHistory = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    const userId = sessionData.session.user.id;
    const { error } = await supabase.from('history').delete().eq('user_id', userId);

    if (error) {
      console.error('Error deleting history:', error);
      alert('Ошибка при удалении истории: ' + error.message);
      return;
    }

    setHistoryItems([]);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredHistoryItems = historyItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = selectedDirection === 'All Products'
    ? products
    : products.filter((product) => product.direction === selectedDirection);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="image-upload">
          <label htmlFor="imageUpload" className="upload-button">
            +
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </div>

        <div className="user-info">
          <div className="user-info-item">
            <span>Nickname: {userInfo.nickname}</span>
            <button className="edit-button" onClick={openModal}>✏️</button>
          </div>
          <div className="user-info-item">
            <span>Email: {userInfo.email}</span>
            <button className="edit-button" onClick={openModal}>✏️</button>
          </div>
          <div className="user-info-item">
            <span>Password: {userInfo.password}</span>
            <button className="edit-button" onClick={openModal}>✏️</button>
          </div>
        </div>

        <div className="history">
          <div className="track-header">
            <input
              type="text"
              placeholder="Enter the receipt number"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button>Track Q</button>
          </div>
          <div className="history-header">
            <h3>HISTORY</h3>
            <span onClick={handleDeleteHistory} className="delete-history">Delete History</span>
          </div>
          <div className="history-content">
            {filteredHistoryItems.length > 0 ? (
              filteredHistoryItems.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">📦</div>
                  <div className="history-details">
                    <p>{item.title || item.number}</p>
                    <span>{item.date}</span>
                    <span className={`status ${item.statusClass}`}>{item.status}</span>
                  </div>
                  <button
                    className="restore-button"
                    onClick={() => handleRestore(item)}
                  >
                    🔄
                  </button>
                </div>
              ))
            ) : (
              <div className="no-history">Объявление нету в истории</div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="filters">
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
          >
            <option>All Products</option>
            <option>3D</option>
            <option>Моушн</option>
            <option>Иллюстрация</option>
            <option>Другое</option>
          </select>
          <select>
            <option>Filter</option>
          </select>
          <select>
            <option>Sort by: Created time</option>
          </select>
          <button onClick={() => openProductModal()}>Create New +</button>
          <button
            onClick={handleRename}
            disabled={selectedProducts.length !== 1}
            className={selectedProducts.length !== 1 ? 'disabled' : 'rename'}
          >
            Rename
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedProducts.length === 0}
            className={selectedProducts.length === 0 ? 'disabled' : 'delete'}
          >
            Delete
          </button>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product, index) => (
            <div key={index} className="product-card">
              <div className="product-header">
                <div className="product-title">
                  <span>{product.title}</span>
                </div>
                <input
                  type="checkbox"
                  className="product-checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleCheckboxToggle(product.id)}
                />
              </div>
              <div className="product-direction-section">
                <span>Направление</span>
                <span>{product.direction}</span>
              </div>
              <div className="product-description">
                <span>Описание</span>
                <span className="description">{product.description}</span>
              </div>
              <div className="product-footer">
                <div className="product-left">
                  <div className="product-info">
                    <span>Дата публикации</span>
                    <span>{product.date}</span>
                  </div>
                  <div className="product-info">
                    <span>Стоимость</span>
                    <span>{product.price}</span>
                  </div>
                </div>
                <div className="product-right">
                  <div className="product-info">
                    <span>Срок</span>
                    <span className="duration" title={product.durationTooltip}>
                      {product.duration}
                    </span>
                  </div>
                  <div className="product-info">
                    <span>Статус</span>
                    <span className={`status ${product.status.toLowerCase()}`}>{product.status}</span>
                  </div>
                </div>
              </div>
              <div className="product-actions">
                <button
                  className="complete-button"
                  onClick={() => handleComplete(product)}
                >
                  Завершить
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleReject(product)}
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit User Info</h3>
            <div className="modal-field">
              <label>Nickname</label>
              <input
                type="text"
                name="nickname"
                value={tempUserInfo.nickname}
                onChange={handleModalInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={tempUserInfo.email}
                onChange={handleModalInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={tempUserInfo.password}
                onChange={handleModalInputChange}
                required
              />
            </div>
            <div className="modal-buttons">
              <button onClick={() => setModalOpen(false)}>Cancel</button>
              <button onClick={saveChanges}>Save</button>
            </div>
          </div>
        </div>
      )}

      {productModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="modal-field">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={tempProduct.title}
                onChange={handleProductInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>Direction</label>
              <select
                name="direction"
                value={tempProduct.direction}
                onChange={handleProductInputChange}
                required
              >
                <option value="">Select Direction</option>
                <option value="3D">3D</option>
                <option value="Моушн">Моушн</option>
                <option value="Иллюстрация">Иллюстрация</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Description</label>
              <textarea
                name="description"
                value={tempProduct.description}
                onChange={handleProductInputChange}
                rows="4"
                required
              />
            </div>
            <div className="modal-field">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={tempProduct.startDate}
                onChange={handleProductInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={tempProduct.endDate}
                onChange={handleProductInputChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>Price</label>
              <input
                type="text"
                name="price"
                value={tempProduct.price}
                onChange={handleProductInputChange}
                placeholder="$19,000"
                required
              />
            </div>
            <div className="modal-field">
              <label>Status</label>
              <select
                name="status"
                value={tempProduct.status}
                onChange={handleProductInputChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setProductModalOpen(false)}>Cancel</button>
              <button onClick={saveProduct}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HirerProfile;
