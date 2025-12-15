import express from "express";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(express.json());

// ==========================
// CONFIG BANCO
// ==========================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ==========================
// HEALTH CHECK
// ==========================
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

// ==========================
// TESTE DE BANCO
// ==========================
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    res.json({
      database: "connected",
      result: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      database: "error",
      message: error.message,
    });
  }
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
