import React, { useState } from 'react';
import './HirerProfile.css';

const App = () => {
  const [historyItems, setHistoryItems] = useState([
    { number: '0J.20233JHN92004', date: '26 JAN 2023', status: 'Delivered', statusClass: 'delivered', title: 'Sample Delivery' },
    { number: '0J.20233JHN92005', date: '26 JAN 2023', status: 'Transit', statusClass: 'transit', title: 'Sample Transit' },
  ]);

  const [products, setProducts] = useState([
    {
      id: 'nks3722',
      title: 'Muslim Bride & Groom Finder',
      direction: '3D',
      date: '26 JAN 2023',
      status: 'Active',
      price: '$19,000',
      duration: '640 days',
      durationTooltip: '15.02.2021 - 16.11.2022',
      description: 'A platform designed to connect individuals seeking marriage partners. Features advanced matching algorithms and user-friendly interfaces.',
    },
    {
      id: 'nks3723',
      title: 'Real Estate Website',
      direction: 'Моушн',
      date: '25 JAN 2023',
      status: 'Active',
      price: '$17,000',
      duration: '500 days',
      durationTooltip: '15.03.2021 - 30.07.2022',
      description: 'A dynamic website for real estate listings. Includes motion graphics for enhanced user engagement and property visualization.',
    },
    {
      id: 'nks3724',
      title: 'Job Seeker & Job Finder',
      direction: 'Иллюстрация',
      date: '24 JAN 2023',
      status: 'Active',
      price: '$19,000',
      duration: '600 days',
      durationTooltip: '10.01.2021 - 05.09.2022',
      description: 'A job portal with custom illustrations. Simplifies job searching and hiring with visually appealing designs.',
    },
    {
      id: 'nks3725',
      title: 'Medical CRM',
      direction: 'Другое',
      date: '23 JAN 2023',
      status: 'Active',
      price: '$19,000',
      duration: '720 days',
      durationTooltip: '01.01.2021 - 31.12.2022',
      description: 'A CRM tailored for medical professionals. Streamlines patient management and administrative tasks.',
    },
    {
      id: 'nks3726',
      title: 'Grocery Shop CRM',
      direction: '3D',
      date: '22 JAN 2023',
      status: 'Active',
      price: '$19,000',
      duration: '550 days',
      durationTooltip: '20.02.2021 - 25.08.2022',
      description: 'A CRM for grocery stores with 3D visualizations. Enhances inventory tracking and customer management.',
    },
    {
      id: 'nks3727',
      title: 'E-commerce Website with CRM',
      direction: 'Моушн',
      date: '21 JAN 2023',
      status: 'Active',
      price: '$19,000',
      duration: '680 days',
      durationTooltip: '05.02.2021 - 15.12.2022',
      description: 'An e-commerce platform with integrated CRM. Features motion-based product showcases for better user experience.',
    },
    {
      id: 'nks3728',
      title: 'Fintech - Daily Money Management',
      direction: 'Иллюстрация',
      date: '20 JAN 2023',
      status: 'Active',
      price: '$19,000',
      duration: '620 days',
      durationTooltip: '12.02.2021 - 01.11.2022',
      description: 'A fintech app with custom illustrations. Helps users manage daily finances with intuitive visuals.',
    },
    {
      id: 'nks3729',
      title: 'Job Portal Website',
      direction: 'Другое',
      date: '19 JAN 2023',
      status: 'Active',
      price: '$19,000',
      duration: '590 days',
      durationTooltip: '18.02.2021 - 10.10.2022',
      description: 'A comprehensive job portal. Offers robust features for job seekers and employers.',
    },
  ]);

  const [userInfo, setUserInfo] = useState({
    nickname: 'User123',
    email: 'user@example.com',
    password: '********',
  });

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

  const saveChanges = () => {
    setUserInfo({ ...tempUserInfo });
    setModalOpen(false);
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

  const saveProduct = () => {
    const { title, direction, description, startDate, endDate, price, status } = tempProduct;
    if (!title || !direction || !description || !startDate || !endDate || !price || !status) {
      alert('All fields are required!');
      return;
    }
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
    };

    if (isEditing) {
      setProducts(products.map((p) => (p.id === editingProductId ? productData : p)));
    } else {
      setProducts([...products, productData]);
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

  const handleDelete = () => {
    setProducts(products.filter((product) => !selectedProducts.includes(product.id)));
    setSelectedProducts([]);
  };

  const handleRename = () => {
    if (selectedProducts.length === 1) {
      const product = products.find((p) => p.id === selectedProducts[0]);
      openProductModal(product);
    }
  };

  const handleComplete = (product) => {
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
    setHistoryItems([
      {
        number: product.id,
        title: product.title,
        date: currentDate,
        status: 'Completed',
        statusClass: 'completed',
      },
      ...historyItems,
    ]);
    setProducts(products.filter((p) => p.id !== product.id));
  };

  const handleReject = (product) => {
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
    setHistoryItems([
      {
        number: product.id,
        title: product.title,
        date: currentDate,
        status: 'Rejected',
        statusClass: 'rejected',
      },
      ...historyItems,
    ]);
    setProducts(products.filter((p) => p.id !== product.id));
  };

  const handleRestore = (historyItem) => {
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
    };
    setProducts([...products, product]);
    setHistoryItems(historyItems.filter((item) => item.number !== historyItem.number));
  };

  const handleDeleteHistory = () => {
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
            disabled={selectedProducts.length === 0}
            className={selectedProducts.length === 0 ? 'disabled' : 'rename'}
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
