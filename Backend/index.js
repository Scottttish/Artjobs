const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

const pool = new Pool({
  user: 'postgres',
  host: 'db.jvccejerkjfnkwtqumcd.supabase.co',
  database: 'postgres',
  password: 'aPEJFvRbyKDoGKJj',
  port: 5432,
});

app.use(cors({
  origin: 'https://Scottttish.github.io/Artjobs' // Замените на ваш GitHub Pages URL
}));
app.use(express.json());

// Регистрация
app.post('/register', async (req, res) => {
  const { email, password, role, name } = req.body;

  try {
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, role, name]
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован!',
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при регистрации!', error: error.message });
  }
});

// Вход
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    res.status(200).json({ message: 'Вход успешен', user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при входе!', error: error.message });
  }
});

// Получение всех пользователей (для тестирования)
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей!', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
