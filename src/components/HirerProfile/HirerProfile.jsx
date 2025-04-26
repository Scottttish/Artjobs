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
    password: '********'
  });
  const [loading, setLoading] = useState(true);

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
    status: 'Active'
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('All Products');

  // Загрузка данных пользователя и продуктов из Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Session error:', sessionError);
        setLoading(false);
        return;
      }

      // Загрузка пользовательских данных
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('nickname, email')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        setUserInfo({
          nickname: userData.nickname || 'User123',
          email: userData.email || 'user@example.com',
          password: '********'
        });
        setTempUserInfo({
          nickname: userData.nickname || 'User123',
          email: userData.email || 'user@example.com',
          password: '********'
        });
      }

      // Загрузка продуктов
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', sessionData.session.user.id);

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }

      // Загрузка истории
      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', sessionData.session.user.id);

      if (historyError) {
        console.error('Error fetching history:', historyError);
      } else {
        setHistoryItems(historyData || []);
      }

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
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({
        nickname: tempUserInfo.nickname,
        email: tempUserInfo.email
      })
      .eq('id', sessionData.session.user.id);

    if (error) {
      console.error('Error saving user info:', error);
      alert('Ошибка при сохранении данных.');
    } else {
      setUserInfo({ ...tempUserInfo });
      alert('Данные успешно сохранены!');
    }

    setModalOpen(false);
    setLoading(false);
  };

  const openProductModal = (product = null) => {
    if (product) {
      setIsEditing(true);
      setEditingProductId(product.id);
      const [startDate, endDate] = product.durationTooltip.split(' - ');
      setTempProduct({
        title: product.title,
        direction: product.direction,
        description: product.description,
        startDate: startDate,
        endDate: endDate,
        price: product.price,
        status: product.status
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
        status: 'Active'
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
      alert('Все поля обязательны!');
      return;
    }

    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      setLoading(false);
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
    const duration = calculateDuration(startDate, endDate);
    const productData = {
      id: isEditing ? editingProductId : `nks${Math.floor(Math.random() * 10000)}`,
      title,
      direction,
      description,
      date: currentDate,
      status,
      price,
      duration,
      durationTooltip: `${startDate} - ${endDate}`,
      user_id: sessionData.session.user.id
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProductId));
    } else {
      ({ error } = await supabase.from('products').insert([productData]));
    }

    if (error) {
      console.error('Error saving product:', error);
      alert('Ошибка при сохранении продукта.');
    } else {
      if (isEditing) {
        setProducts(products.map((p) => (p.id === editingProductId ? productData : p)));
      } else {
        setProducts([...products, productData]);
      }
      alert('Продукт успешно сохранен!');
    }

    setProductModalOpen(false);
    setSelectedProducts([]);
    setLoading(false);
  };

  const handleCheckboxToggle = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', selectedProducts);

    if (error) {
      console.error('Error deleting products:', error);
      alert('Ошибка при удалении продуктов.');
    } else {
      setProducts(products.filter((product) => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      alert('Продукты успешно удалены!');
    }
    setLoading(false);
  };

  const handleRename = () => {
    if (selectedProducts.length === 1) {
      const product = products.find((p) => p.id === selectedProducts[0]);
      openProductModal(product);
    }
  };

  const handleComplete = async (product) => {
    setLoading(true);
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();

    const historyItem = {
      number: product.id,
      title: product.title,
      date: currentDate,
      status: 'Completed',
      statusClass: 'completed',
      user_id: product.user_id
    };

    const { error: historyError } = await supabase.from('history').insert([historyItem]);
    if (historyError) {
      console.error('Error adding to history:', historyError);
      alert('Ошибка при добавлении в историю.');
      setLoading(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      alert('Ошибка при удалении продукта.');
    } else {
      setHistoryItems([historyItem, ...historyItems]);
      setProducts(products.filter((p) => p.id !== product.id));
      alert('Продукт успешно завершен!');
    }
    setLoading(false);
  };

  const handleReject = async (product) => {
    setLoading(true);
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();

    const historyItem = {
      number: product.id,
      title: product.title,
      date: currentDate,
      status: 'Rejected',
      statusClass: 'rejected',
      user_id: product.user_id
    };

    const { error: historyError } = await supabase.from('history').insert([historyItem]);
    if (historyError) {
      console.error('Error adding to history:', historyError);
      alert('Ошибка при добавлении в историю.');
      setLoading(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      alert('Ошибка при удалении продукта.');
    } else {
      setHistoryItems([historyItem, ...historyItems]);
      setProducts(products.filter((p) => p.id !== product.id));
      alert('Продукт успешно отклонен!');
    }
    setLoading(false);
  };

  const handleRestore = async (historyItem) => {
    setLoading(true);
    const product = {
      id: historyItem.number,
      title: historyItem.title,
      direction: 'Другое',
      date: historyItem.date,
      status: 'Active',
      price: '$19,000',
      duration: '600 days',
      durationTooltip: '01.01.2023 - 01.07.2024',
      description: 'Restored product',
      user_id: historyItem.user_id
    };

    const { error: productError } = await supabase.from('products').insert([product]);
    if (productError) {
      console.error('Error restoring product:', productError);
      alert('Ошибка при восстановлении продукта.');
      setLoading(false);
      return;
    }

    const { error: historyError } = await supabase
      .from('history')
      .delete()
      .eq('number', historyItem.number);

    if (historyError) {
      console.error('Error deleting history item:', historyError);
      alert('Ошибка при удалении элемента истории.');
    } else {
      setProducts([...products, product]);
      setHistoryItems(historyItems.filter((item) => item.number !== historyItem.number));
      alert('Продукт успешно восстановлен!');
    }
    setLoading(false);
  };

  const handleDeleteHistory = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('history')
      .delete()
      .eq('user_id', sessionData.session.user.id);

    if (error) {
      console.error('Error deleting history:', error);
      alert('Ошибка при очистке истории.');
    } else {
      setHistoryItems([]);
      alert('История успешно очищена!');
    }
    setLoading(false);
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
    return <div className="hirer-loading">Загрузка...</div>;
  }

  return (
    <div className="hirer-dashboard">
      <div className="hirer-sidebar">
        <div className="hirer-image-upload">
          <label htmlFor="imageUpload" className="hirer-upload-button">
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

        <div className="hirer-user-info">
          <div className="hirer-user-info-item">
            <span>Nickname: {userInfo.nickname}</span>
            <button className="hirer-edit-button" onClick={openModal}>✏️</button>
          </div>
          <div className="hirer-user-info-item">
            <span>Email: {userInfo.email}</span>
            <button className="hirer-edit-button" onClick={openModal}>✏️</button>
          </div>
          <div className="hirer-user-info-item">
            <span>Password: {userInfo.password}</span>
            <button className="hirer-edit-button" onClick={openModal}>✏️</button>
          </div>
        </div>

        <div className="hirer-history">
          <div className="hirer-track-header">
            <input
              type="text"
              placeholder="Введите номер квитанции"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button>Отследить</button>
          </div>
          <div className="hirer-history-header">
            <h3>История</h3>
            <span onClick={handleDeleteHistory} className="hirer-delete-history">Очистить историю</span>
          </div>
          <div className="hirer-history-content">
            {filteredHistoryItems.length > 0 ? (
              filteredHistoryItems.map((item, index) => (
                <div key={index} className="hirer-history-item">
                  <div className="hirer-history-icon">📦</div>
                  <div className="hirer-history-details">
                    <p>{item.title || item.number}</p>
                    <span>{item.date}</span>
                    <span className={`hirer-status ${item.statusClass}`}>{item.status}</span>
                  </div>
                  <button
                    className="hirer-restore-button"
                    onClick={() => handleRestore(item)}
                  >
                    🔄
                  </button>
                </div>
              ))
            ) : (
              <div className="hirer-no-history">Объявлений нет в истории</div>
            )}
          </div>
        </div>
      </div>

      <div className="hirer-main-content">
        <div className="hirer-filters">
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
          >
            <option>Все продукты</option>
            <option>3D</option>
            <option>Моушн</option>
            <option>Иллюстрация</option>
            <option>Другое</option>
          </select>
          <select>
            <option>Фильтр</option>
          </select>
          <select>
            <option>Сортировать по: Время создания</option>
          </select>
          <button onClick={() => openProductModal()}>Создать новый +</button>
          <button
            onClick={handleRename}
            disabled={selectedProducts.length === 0}
            className={selectedProducts.length === 0 ? 'disabled' : 'rename'}
          >
            Переименовать
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedProducts.length === 0}
            className={selectedProducts.length === 0 ? 'disabled' : 'delete'}
          >
            Удалить
          </button>
        </div>
        <div className="hirer-product-grid">
          {filteredProducts.map((product, index) => (
            <div key={index} className="hirer-product-card">
              <div className="hirer-product-header">
                <div className="hirer-product-title">
                  <span>{product.title}</span>
                </div>
                <input
                  type="checkbox"
                  className="hirer-product-checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleCheckboxToggle(product.id)}
                />
              </div>
              <div className="hirer-product-direction-section">
                <span>Направление</span>
                <span>{product.direction}</span>
              </div>
              <div className="hirer-product-description">
                <span>Описание</span>
                <span className="hirer-description">{product.description}</span>
              </div>
              <div className="hirer-product-footer">
                <div className="hirer-product-left">
                  <div className="hirer-product-info">
                    <span>Дата публикации</span>
                    <span>{product.date}</span>
                  </div>
                  <div className="hirer-product-info">
                    <span>Стоимость</span>
                    <span>{product.price}</span>
                  </div>
                </div>
                <div className="hirer-product-right">
                  <div className="hirer-product-info">
                    <span>Срок</span>
                    <span className="hirer-duration" title={product.durationTooltip}>
                      {product.duration}
                    </span>
                  </div>
                  <div className="hirer-product-info">
                    <span>Статус</span>
                    <span className={`hirer-status ${product.status.toLowerCase()}`}>{product.status}</span>
                  </div>
                </div>
              </div>
              <div className="hirer-product-actions">
                <button
                  className="hirer-complete-button"
                  onClick={() => handleComplete(product)}
                >
                  Завершить
                </button>
                <button
                  className="hirer-reject-button"
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
        <div className="hirer-modal">
          <div className="hirer-modal-content">
            <h3>Редактировать информацию</h3>
            <div className="hirer-modal-field">
              <label>Никнейм</label>
              <input
                type="text"
                name="nickname"
                value={tempUserInfo.nickname}
                onChange={handleModalInputChange}
                required
              />
            </div>
            <div className="hirer-modal-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={tempUserInfo.email}
                onChange={handleModalInputChange}
                required
              />
            </div>
            <div className="hirer-modal-field">
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                value={tempUserInfo.password}
                onChange={handleModalInputChange}
                required
              />
            </div>
            <div className="hirer-modal-buttons">
              <button onClick={() => setModalOpen(false)}>Отмена</button>
              <button onClick={saveChanges}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {productModalOpen && (
        <div className="hirer-modal">
          <div className="hirer-modal-content">
            <h3>{isEditing ? 'Редактировать продукт' : 'Добавить новый продукт'}</h3>
            <div className="hirer-modal-field">
              <label>Название</label>
              <input
                type="text"
                name="title"
                value={tempProduct.title}
                onChange={handleProductInputChange}
                required
              />
            </div>
            <div className="hirer-modal-field">
              <label>Направление</label>
              <select
                name="direction"
                value={tempProduct.direction}
                onChange={handleProductInputChange}
                required
              >
                <option value="">Выберите направление</option>
                <option value="3D">3D</option>
                <option value="Моушн">Моушн</option>
                <option value="Иллюстрация">Иллюстрация</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
            <div className="hirer-modal-field">
              <label>Описание</label>
              <textarea
                name="description"
                value={tempProduct.description}
                onChange={handleProductInputChange}
                rows="4"
                required
              />
            </div>
            <div className="hirer-modal-field">
              <label>Дата начала</label>
              <input
                type="date"
                name="startDate"
                value={tempProduct.startDate}
                onChange={handleProductInputChange}
                required
              />
            </div>
            <div className="hirer-modal-field">
              <label>Дата окончания</label>
              <input
                type="date"
                name="endDate"
                value={tempProduct.endDate}
                onChange={handleProductInputChange}
                required
              />
            </div>
            <div className="hirer-modal-field">
              <label>Стоимость</label>
              <input
                type="text"
                name="price"
                value={tempProduct.price}
                onChange={handleProductInputChange}
                placeholder="$19,000"
                required
              />
            </div>
            <div className="hirer-modal-field">
              <label>Статус</label>
              <select
                name="status"
                value={tempProduct.status}
                onChange={handleProductInputChange}
                required
              >
                <option value="Active">Активен</option>
                <option value="Inactive">Неактивен</option>
              </select>
            </div>
            <div className="hirer-modal-buttons">
              <button onClick={() => setProductModalOpen(false)}>Отмена</button>
              <button onClick={saveProduct}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HirerProfile;
