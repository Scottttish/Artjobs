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
        setError('Ошибка загрузки данных пользователя: ' + userError.message);
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
        .select('id, publication_id, table_name, title, date, status')
        .eq('user_id', userId);

      if (historyError) {
        console.error('Error fetching history:', historyError);
        setError('Ошибка загрузки истории: ' + historyError.message);
      } else {
        setHistoryItems(historyData.map(item => ({
          id: item.id,
          publication_id: item.publication_id,
          table_name: item.table_name,
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
      const tables = ['illustration', 'motion', 'other', 'three_d', 'interior'];
      let allProducts = [];

      for (const table of tables) {
        console.log(`Fetching products from table: ${table}`);
        const { data, error } = await supabase
          .from(table)
          .select('id, title, category, description, published_at, start_date, end_date, price, status')
          .eq('user_id', userId);

        if (error) {
          console.error(`Error fetching from ${table}:`, error);
          setError(`Ошибка загрузки данных из таблицы ${table}: ${error.message}`);
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
            durationTooltip: `${new Date(product.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} - ${new Date(product.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`,
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
    const updatedUserData = {
      username: tempUserInfo.nickname,
      email: tempUserInfo.email,
      password: tempUserInfo.password,
    };

    console.log('Updating user data:', updatedUserData);

    const { error } = await supabase
      .from('users')
      .update(updatedUserData)
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
      const formatDate = (dateStr) => {
        try {
          const [day, monthStr, year] = dateStr.trim().split(' ');
          const monthNames = {
            JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
            JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
          };
          const month = monthNames[monthStr.toUpperCase()];
          if (!month) throw new Error('Invalid month');
          const formatted = `${year}-${month}-${day}`;
          if (!isValidDateFormat(formatted)) {
            throw new Error('Invalid date format');
          }
          return formatted;
        } catch (err) {
          console.error('Error formatting date:', err);
          alert('Ошибка: Неверный формат даты. Ожидается "01 JAN 2023".');
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
      '3D': 'three_d',
      'Интерьер': 'interior',
      'Моушн': 'motion',
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

    console.log('Saving product to table:', table);
    console.log('Product data:', productData);

    if (isEditing) {
      const oldProduct = products.find(p => p.id === editingProductId);
      const oldTable = tableMap[oldProduct.direction] || 'other';

      if (oldTable === table) {
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
        const { error: deleteError } = await supabase.from(oldTable).delete().eq('id', editingProductId);
        if (deleteError) {
          console.error('Error deleting product from old table:', deleteError);
          alert('Ошибка при удалении старого объявления: ' + deleteError.message);
          return;
        }

        const { data, error: insertError } = await supabase.from(table).insert(productData).select();
        if (insertError) {
          console.error('Error inserting product into new table:', insertError);
          alert('Ошибка при создании нового объявления: ' + insertError.message);
          return;
        }

        setEditingProductId(data[0].id);
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
        durationTooltip: `${new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} - ${new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`,
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
        durationTooltip: `${new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} - ${new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`,
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
      '3D': 'three_d',
      'Интерьер': 'interior',
      'Моушн': 'motion',
      'Иллюстрация': 'illustration',
      'Другое': 'other',
    };

    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      const table = tableMap[product.direction] || 'other';
      console.log(`Deleting product from table: ${table}, id: ${productId}`);
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
      '3D': 'three_d',
      'Интерьер': 'interior',
      'Моушн': 'motion',
      'Иллюстрация': 'illustration',
      'Другое': 'other',
    };
    const table = tableMap[product.direction] || 'other';

    const currentDate = new Date();
    const historyData = {
      user_id: userId,
      publication_id: product.id,
      table_name: table,
      title: product.title,
      date: currentDate.toISOString(),
      status: 'Completed',
    };

    console.log('Adding to history:', historyData);

    const { data: insertedHistory, error: insertError } = await supabase
      .from('history')
      .insert(historyData)
      .select()
      .single();

    if (insertError) {
      console.error('Error adding to history:', insertError);
      alert('Ошибка при добавлении в историю: ' + insertError.message);
      return;
    }

    setHistoryItems([
      {
        id: insertedHistory.id, // Используем id из базы данных
        publication_id: product.id,
        table_name: table,
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

    setProducts(products.filter(p => p.id !== product.id));
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
      '3D': 'three_d',
      'Интерьер': 'interior',
      'Моушн': 'motion',
      'Иллюстрация': 'illustration',
      'Другое': 'other',
    };
    const table = tableMap[product.direction] || 'other';

    const currentDate = new Date();
    const historyData = {
      user_id: userId,
      publication_id: product.id,
      table_name: table,
      title: product.title,
      date: currentDate.toISOString(),
      status: 'Rejected',
    };

    console.log('Adding to history:', historyData);

    const { data: insertedHistory, error: insertError } = await supabase
      .from('history')
      .insert(historyData)
      .select()
      .single();

    if (insertError) {
      console.error('Error adding to history:', insertError);
      alert('Ошибка при добавлении в историю: ' + insertError.message);
      return;
    }

    setHistoryItems([
      {
        id: insertedHistory.id, // Используем id из базы данных
        publication_id: product.id,
        table_name: table,
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

    setProducts(products.filter(p => p.id !== product.id));
  };

  const handleRestore = async (historyItem) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    console.log('Attempting to delete from history, id:', historyItem.id);
    const { error: deleteError } = await supabase.from('history').delete().eq('id', historyItem.id);
    if (deleteError) {
      console.error('Error deleting from history:', deleteError);
      alert('Ошибка при удалении из истории: ' + deleteError.message);
      return;
    }
    console.log('Successfully deleted from history');

    const table = historyItem.table_name;
    const { data: productData, error: fetchError } = await supabase
      .from(table)
      .select('id, title, category, description, published_at, start_date, end_date, price, status')
      .eq('id', historyItem.publication_id)
      .single();

    if (fetchError || !productData) {
      console.error('Error fetching product:', fetchError);
      alert('Ошибка при восстановлении продукта: ' + (fetchError?.message || 'Продукт не найден'));
      return;
    }

    const { error: updateError } = await supabase
      .from(table)
      .update({ status: 'Active' })
      .eq('id', historyItem.publication_id);

    if (updateError) {
      console.error('Error updating product status:', updateError);
      alert('Ошибка при обновлении статуса продукта: ' + updateError.message);
      return;
    }

    setProducts([...products, {
      id: productData.id,
      title: productData.title,
      direction: productData.category,
      description: productData.description,
      date: new Date(productData.published_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase(),
      status: 'Active',
      price: productData.price,
      duration: calculateDuration(productData.start_date, productData.end_date),
      durationTooltip: `${new Date(productData.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} - ${new Date(productData.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`,
    }]);

    setHistoryItems(historyItems.filter((item) => item.id !== historyItem.id));
  };

  const handleDeleteHistory = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    const userId = sessionData.session.user.id;

    const { data: historyData, error: fetchError } = await supabase
      .from('history')
      .select('publication_id, table_name')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error fetching history:', fetchError);
      alert('Ошибка при получении истории: ' + fetchError.message);
      return;
    }

    for (const item of historyData) {
      const { publication_id, table_name } = item;
      console.log(`Deleting product from table: ${table_name}, id: ${publication_id}`);
      const { error: deleteProductError } = await supabase
        .from(table_name)
        .delete()
        .eq('id', publication_id);

      if (deleteProductError) {
        console.error(`Error deleting product from ${table_name}:`, deleteProductError);
        alert(`Ошибка при удалении продукта из таблицы ${table_name}: ${deleteProductError.message}`);
        return;
      }
    }

    console.log(`Deleting history for user_id: ${userId}`);
    const { error: deleteHistoryError } = await supabase
      .from('history')
      .delete()
      .eq('user_id', userId);

    if (deleteHistoryError) {
      console.error('Error deleting history:', deleteHistoryError);
      alert('Ошибка при удалении истории: ' + deleteHistoryError.message);
      return;
    }

    const publicationIdsToDelete = historyData.map(item => item.publication_id);
    setProducts(products.filter(product => !publicationIdsToDelete.includes(product.id)));
    setHistoryItems([]);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredHistoryItems = historyItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleProducts = products.filter(product =>
    !historyItems.some(historyItem => historyItem.publication_id === product.id)
  );

  const filteredProducts = selectedDirection === 'All Products'
    ? visibleProducts
    : visibleProducts.filter((product) => product.direction === selectedDirection);

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
                    <p>{item.title || item.publication_id}</p>
                    <span>{item.date}</span>
                    <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
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
            <option>Интерьер</option>
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
                <option value="Интерьер">Интерьер</option>
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
