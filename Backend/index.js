require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/api/data", async (req, res) => {
  const result = await pool.query("SELECT * FROM your_table");
  res.json(result.rows);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
