import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './HirerProfile.css';

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
    telegramUsername: '',
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
  const [dateSortDirection, setDateSortDirection] = useState('asc');
  const [durationSortDirection, setDurationSortDirection] = useState('asc');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const isValidDateFormat = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setError('Please log in.');
        setLoading(false);
        return;
      }

      const userId = sessionData.session.user.id;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, email, telegram_username')
        .eq('id', userId)
        .single();

      if (userError) {
        setError('Error loading user data: ' + userError.message);
      } else {
        setUserInfo({
          nickname: userData.username || 'User123',
          email: userData.email || 'user@example.com',
          telegramUsername: userData.telegram_username || '',
        });
        setTempUserInfo({
          nickname: userData.username || 'User123',
          email: userData.email || 'user@example.com',
          telegramUsername: userData.telegram_username || '',
        });
      }

      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select('id, publication_id, table_name, title, date, status')
        .eq('user_id', userId);

      if (historyError) {
        setError('Error loading history: ' + historyError.message);
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

      const tables = ['illustration', 'motion', 'other', 'three_d', 'interior'];
      let allProducts = [];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('id, title, category, description, published_at, start_date, end_date, price, status')
          .eq('user_id', userId);

        if (error) {
          setError(`Error loading data from table ${table}: ${error.message}`);
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
            publishedAt: new Date(product.published_at),
            status: product.status,
            price: product.price,
            duration: calculateDuration(product.start_date, product.end_date),
            durationDays: Math.ceil(Math.abs(new Date(product.end_date) - new Date(product.start_date)) / (1000 * 60 * 60 * 24)),
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
      alert('Please log in.');
      return;
    }

    const userId = sessionData.session.user.id;
    const updatedUserData = {
      username: tempUserInfo.nickname,
      email: tempUserInfo.email,
      telegram_username: tempUserInfo.telegramUsername,
    };

    const { error } = await supabase
      .from('users')


      .update(updatedUserData)
      .eq('id', userId);

    if (error) {
      alert('Error saving user data: ' + error.message);
    } else {
      setUserInfo({ ...tempUserInfo });
      alert('User data saved successfully!');
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
          alert('Error: Invalid date format. Expected "01 JAN 2023".');
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
      alert('All fields are required!');
      return;
    }

    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      alert('Error: Dates must be in YYYY-MM-DD format (e.g., 2023-01-01).');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      alert('Please log in.');
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

    if (isEditing) {
      const oldProduct = products.find(p => p.id === editingProductId);
      const oldTable = tableMap[oldProduct.direction] || 'other';

      if (oldTable === table) {
        const { error } = await supabase
          .from(table)
          .update(productData)
          .eq('id', editingProductId);

        if (error) {
          alert('Error updating listing: ' + error.message);
          return;
        }
      } else {
        const { error: deleteError } = await supabase.from(oldTable).delete().eq('id', editingProductId);
        if (deleteError) {
          alert('Error deleting old listing: ' + deleteError.message);
          return;
        }

        const { data, error: insertError } = await supabase.from(table).insert(productData).select();
        if (insertError) {
          alert('Error creating new listing: ' + insertError.message);
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
        publishedAt: currentDate,
        status,
        price,
        duration: calculateDuration(startDate, endDate),
        durationDays: Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
        durationTooltip: `${new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} - ${new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`,
      } : p)));
    } else {
      const { data, error } = await supabase.from(table).insert(productData).select();

      if (error) {
        alert('Error creating listing: ' + error.message);
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
        publishedAt: currentDate,
        status,
        price,
        duration: calculateDuration(startDate, endDate),
        durationDays: Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
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
      const { error } = await supabase.from(table).delete().eq('id', productId);

      if (error) {
        alert('Error deleting listing: ' + error.message);
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
      alert('Please log in.');
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

    const { data: insertedHistory, error: insertError } = await supabase
      .from('history')
      .insert(historyData)
      .select()
      .single();

    if (insertError) {
      alert('Error adding to history: ' + insertError.message);
      return;
    }

    setHistoryItems([
      {
        id: insertedHistory.id,
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
      alert('Please log in.');
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

    const { data: insertedHistory, error: insertError } = await supabase
      .from('history')
      .insert(historyData)
      .select()
      .single();

    if (insertError) {
      alert('Error adding to history: ' + insertError.message);
      return;
    }

    setHistoryItems([
      {
        id: insertedHistory.id,
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
      alert('Please log in.');
      return;
    }

    const { error: deleteError } = await supabase.from('history').delete().eq('id', historyItem.id);
    if (deleteError) {
      alert('Error removing from history: ' + deleteError.message);
      return;
    }

    const table = historyItem.table_name;
    const { data: productData, error: fetchError } = await supabase
      .from(table)
      .select('id, title, category, description, published_at, start_date, end_date, price, status')
      .eq('id', historyItem.publication_id)
      .single();

    if (fetchError || !productData) {
      alert('Error restoring product: ' + (fetchError?.message || 'Product not found'));
      return;
    }

    const { error: updateError } = await supabase
      .from(table)
      .update({ status: 'Active' })
      .eq('id', historyItem.publication_id);

    if (updateError) {
      alert('Error updating product status: ' + updateError.message);
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
      publishedAt: new Date(productData.published_at),
      status: 'Active',
      price: productData.price,
      duration: calculateDuration(productData.start_date, productData.end_date),
      durationDays: Math.ceil(Math.abs(new Date(productData.end_date) - new Date(productData.start_date)) / (1000 * 60 * 60 * 24)),
      durationTooltip: `${new Date(productData.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} - ${new Date(productData.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`,
    }]);

    setHistoryItems(historyItems.filter((item) => item.id !== historyItem.id));
  };

  const handleDeleteHistory = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      alert('Please log in.');
      return;
    }

    const userId = sessionData.session.user.id;

    const { data: historyData, error: fetchError } = await supabase
      .from('history')
      .select('publication_id, table_name')
      .eq('user_id', userId);

    if (fetchError) {
      alert('Error fetching history: ' + fetchError.message);
      return;
    }

    for (const item of historyData) {
      const { publication_id, table_name } = item;
      const { error: deleteProductError } = await supabase
        .from(table_name)
        .delete()
        .eq('id', publication_id);

      if (deleteProductError) {
        alert(`Error deleting product from table ${table_name}: ${deleteProductError.message}`);
        return;
      }
    }

    const { error: deleteHistoryError } = await supabase
      .from('history')
      .delete()
      .eq('user_id', userId);

    if (deleteHistoryError) {
      alert('Error deleting history: ' + deleteHistoryError.message);
      return;
    }

    const publicationIdsToDelete = historyData.map(item => item.publication_id);
    setProducts(products.filter(product => !publicationIdsToDelete.includes(product.id)));
    setHistoryItems([]);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleProductSearchChange = (e) => {
    setProductSearchQuery(e.target.value);
  };

  const handleDateSort = () => {
    const newDirection = dateSortDirection === 'asc' ? 'desc' : 'asc';
    setDateSortDirection(newDirection);

    const sortedProducts = [...products].sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return newDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setProducts(sortedProducts);
  };

  const handleDurationSort = () => {
    const newDirection = durationSortDirection === 'asc' ? 'desc' : 'asc';
    setDurationSortDirection(newDirection);

    const sortedProducts = [...products].sort((a, b) => {
      return newDirection === 'asc'
        ? a.durationDays - b.durationDays
        : b.durationDays - a.durationDays;
    });
    setProducts(sortedProducts);
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

  const searchedProducts = filteredProducts.filter((product) =>
    product.title.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard">
        <main>
          <div className="job-listings-container">
            <div className="loading">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <main>
          <div className="job-listings-container">
            <div className="error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="user-info">
          <div className="user-info-item">
            <span>Name: {userInfo.nickname}</span>
            <button className="edit-button" onClick={openModal}>✏️</button>
          </div>
          <div className="user-info-item">
            <span>Email: {userInfo.email}</span>
            <button className="edit-button" onClick={openModal}>✏️</button>
          </div>
          <div className="user-info-item">
            <span>Telegram Username: {userInfo.telegramUsername || 'Not specified'}</span>
            <button className="edit-button" onClick={openModal}>✏️</button>
          </div>
        </div>

        <div className="history">
          <div className="track-header">
            <input
              type="text"
              placeholder="Enter listing title"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button>Search</button>
          </div>
          <div className="history-header">
            <h3>HISTORY</h3>
            <span onClick={handleDeleteHistory} className="delete-history">Delete</span>
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
              <div className="no-history">No listings in history</div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="product-search">
          <input
            type="text"
            placeholder="Search by product name..."
            value={productSearchQuery}
            onChange={handleProductSearchChange}
          />
        </div>
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
          <button className="sort-button" onClick={handleDateSort}>
            Publication Date {dateSortDirection === 'asc' ? '↑' : '↓'}
          </button>
          <button className="sort-button" onClick={handleDurationSort}>
            Duration {durationSortDirection === 'asc' ? '↑' : '↓'}
          </button>
          <button onClick={() => openProductModal()} className="create-new">
            Create New +
          </button>
          <button
            onClick={handleRename}
            disabled={selectedProducts.length !== 1}
            className={selectedProducts.length !== 1 ? 'disabled' : 'rename'}
          >
            Edit
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
          {searchedProducts.map((product, index) => (
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
                <span>Direction</span>
                <span>{product.direction}</span>
              </div>
              <div className="product-description">
                <span>Description</span>
                <span className="description">{product.description}</span>
              </div>
              <div className="product-footer">
                <div className="product-left">
                  <div className="product-info">
                    <span>Publication Date</span>
                    <span>{product.date}</span>
                  </div>
                  <div className="product-info">
                    <span>Price</span>
                    <span>{product.price}</span>
                  </div>
                </div>
                <div className="product-right">
                  <div className="product-info">
                    <span>Duration</span>
                    <span className="duration" title={product.durationTooltip}>
                      {product.duration}
                    </span>
                  </div>
                  <div className="product-info">
                    <span>Status</span>
                    <span className={`status ${product.status.toLowerCase()}`}>{product.status}</span>
                  </div>
                </div>
              </div>
              <div className="product-actions">
                <button
                  className="complete-button"
                  onClick={() => handleComplete(product)}
                >
                  Complete
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleReject(product)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit User Data</h3>
            <div className="modal-field">
              <label>Name</label>
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
              <label>Telegram Username</label>
              <input
                type="text"
                name="telegramUsername"
                value={tempUserInfo.telegramUsername}
                onChange={handleModalInputChange}
                placeholder="@username"
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
                <option value="">Select direction</option>
                <option value="3D">3D</option>
                <option value="Интерьер">Interior</option>
                <option value="Моушн">Motion</option>
                <option value="Иллюстрация">Illustration</option>
                <option value="Другое">Other</option>
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
