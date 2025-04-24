const express = require('express');
const app = express();
const { Pool } = require('pg');
const cors = require('cors');

// Подключение к базе данных PostgreSQL
const pool = new Pool({
  user: 'postgres', 
  host: 'db.jvccejerkjfnkwtqumcd.supabase.co',
  database: 'postgres',
  password: 'your_password',
  port: 5432,
});

app.use(cors());
app.use(express.json()); // Для парсинга JSON в теле запроса

// Маршрут для регистрации пользователя
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Вставка данных в таблицу users
    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, password, role]
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован!',
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при регистрации!', error: error.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
