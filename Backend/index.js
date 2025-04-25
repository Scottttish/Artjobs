const express = require('express');
const app = express();
const { Pool } = require('pg');
const cors = require('cors');

const pool = new Pool({
  user: 'postgres', 
  host: 'db.jvccejerkjfnkwtqumcd.supabase.co',
  database: 'postgres',
  password: 'aPEJFvRbyKDoGKJj',
  port: 5432,
});

app.use(cors());
app.use(express.json());

app.post('/register', async (req, res) => {
  const { email, password, role, username } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO users (email, password, role, username) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, password, role, username]
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован!',
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при регистрации!', error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей!', error: error.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
