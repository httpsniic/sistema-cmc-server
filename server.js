import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Render injeta PORT. Local: 10000.
const PORT = process.env.PORT || 10000;

// Render Postgres: use DATABASE_URL
// Se estiver rodando local, você pode setar DATABASE_URL no .env/.env.local
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// =====================
// DB INIT
// =====================
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      key TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getKey(key) {
  const r = await pool.query(`SELECT data FROM app_data WHERE key = $1`, [key]);
  if (r.rows.length === 0) return null;
  return r.rows[0].data;
}

async function setKey(key, data) {
  await pool.query(
    `
    INSERT INTO app_data (key, data, updated_at)
    VALUES ($1, $2::jsonb, NOW())
    ON CONFLICT (key)
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `,
    [key, JSON.stringify(data ?? {})]
  );
}

// =====================
// HEALTH + ROOT
// =====================
app.get("/", (req, res) => {
  res.status(200).send("Servidor online. Use /api/health");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// =====================
// AUTH (simples, sem token)
// =====================
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Dados inválidos." });
    }

    await pool.query(`INSERT INTO users (username, password) VALUES ($1, $2)`, [
      username,
      password,
    ]);

    res.json({ success: true });
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      return res.status(409).json({ success: false, message: "Usuário já existe." });
    }
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Erro ao registrar." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Dados inválidos." });
    }

    const r = await pool.query(
      `SELECT id, username FROM users WHERE username = $1 AND password = $2 LIMIT 1`,
      [username, password]
    );

    if (r.rows.length === 0) {
      return res.json({ success: false, message: "Usuário ou senha incorretos." });
    }

    res.json({ success: true, username: r.rows[0].username, userId: r.rows[0].id });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Erro ao logar." });
  }
});

// =====================
// DATA ENDPOINTS (salva/retorna objetos inteiros)
// =====================
// Mantive o padrão: GET retorna {} se não existir.
// POST substitui tudo (igual seu JSON antigo).

function makeGetPost(key) {
  app.get(`/api/${key}`, async (req, res) => {
    try {
      const data = await getKey(key);
      res.json(data ?? {});
    } catch (err) {
      console.error(`GET /api/${key} ERROR:`, err);
      res.status(500).json({ success: false, message: "Erro ao buscar dados." });
    }
  });

  app.post(`/api/${key}`, async (req, res) => {
    try {
      await setKey(key, req.body ?? {});
      res.json({ success: true });
    } catch (err) {
      console.error(`POST /api/${key} ERROR:`, err);
      res.status(500).json({ success: false, message: "Erro ao salvar dados." });
    }
  });
}

// Crie aqui as “coleções” que seu front usa:
makeGetPost("transactions");
makeGetPost("groups");
makeGetPost("goals");
makeGetPost("purchases");
makeGetPost("suppliers");
makeGetPost("categories");
makeGetPost("settings");

// Opcional: endpoint genérico caso você queira usar depois
app.get("/api/data/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const data = await getKey(key);
    res.json(data ?? {});
  } catch (err) {
    console.error("GET /api/data/:key ERROR:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar dados." });
  }
});

app.post("/api/data/:key", async (req, res) => {
  try {
    const key = req.params.key;
    await setKey(key, req.body ?? {});
    res.json({ success: true });
  } catch (err) {
    console.error("POST /api/data/:key ERROR:", err);
    res.status(500).json({ success: false, message: "Erro ao salvar dados." });
  }
});

// =====================
// START
// =====================
async function start() {
  try {
    await initDb();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log("Postgres conectado via DATABASE_URL:", !!process.env.DATABASE_URL);
    });
  } catch (err) {
    console.error("STARTUP ERROR:", err);
    process.exit(1);
  }
}

start();
