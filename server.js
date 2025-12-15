import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Render define PORT automaticamente
// Local: 3001
const PORT = process.env.PORT || 3001;

// =======================
// Postgres (Render)
// =======================
const DATABASE_URL = process.env.DATABASE_URL;

// Se DATABASE_URL não existir, não quebra o servidor.
// Só o /api/db-test vai avisar que não está configurado.
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

// =======================
// (Seu armazenamento atual em arquivo)
// =======================
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}), "utf-8");
}

function readDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// =======================
// Rotas
// =======================
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// Teste de conexão com Postgres
app.get("/api/db-test", async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({
        ok: false,
        error: "DATABASE_URL não está configurada no ambiente (Render).",
      });
    }

    const result = await pool.query("SELECT NOW() as now");
    res.json({
      ok: true,
      now: result.rows?.[0]?.now,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao conectar no Postgres",
    });
  }
});

// Exemplo: manter seu banco em arquivo (se você já usa alguma rota parecida)
// Ajuste/expanda conforme seu sistema já estava usando
app.get("/api/db", (req, res) => {
  const db = readDb();
  res.json(db);
});

app.post("/api/db", (req, res) => {
  const body = req.body || {};
  writeDb(body);
  res.json({ ok: true });
});

// 404 por último (IMPORTANTE: tem que ficar depois das rotas)
app.use((req, res) => {
  res.status(404).send(`Não foi possível obter o resultado em ${req.originalUrl}`);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
