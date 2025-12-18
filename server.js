import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "50mb" }));

// CORS
const rawOrigins = process.env.CORS_ORIGINS || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS bloqueado para: ${origin}`), false);
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 10000;

// “Banco” em arquivo (igual ao sistema original do ZIP)
const DB_FILE = path.join(__dirname, "database.json");

// 7 lojas
const STORES = [
  { id: "paris6", name: "Paris6" },
  { id: "xian", name: "Xian" },
  { id: "stella", name: "Stella" },
  { id: "new-hakata", name: "New Hakata" },
  { id: "jardim-secreto", name: "Jardim Secreto" },
  { id: "mestre-cuca", name: "Mestre Cuca" },
  { id: "food-zone", name: "Food Zone" },
];

const INITIAL_GROUPS = [
  { id: 1, nome: "Sushi", cor: "#f43f5e", metaCMV: 32, icone: "🍣" },
  { id: 2, nome: "Cozinha", cor: "#f59e0b", metaCMV: 28, icone: "🍳" },
  { id: 3, nome: "Bebidas", cor: "#8b5cf6", metaCMV: 25, icone: "🥤" },
  { id: 4, nome: "Hortifruti", cor: "#10b981", metaCMV: 15, icone: "🥬" },
  { id: 5, nome: "Embalagem", cor: "#64748b", metaCMV: 5, icone: "📦" },
  { id: 6, nome: "Limpeza", cor: "#06b6d4", metaCMV: 3, icone: "🧹" },
  { id: 7, nome: "Mercearia", cor: "#f97316", metaCMV: 25, icone: "🥫" },
];

function ensureDBShape(db) {
  const base = {
    users: [],
    stores: STORES,
    // por loja:
    transactionsByStore: {},
    groupsByStore: {},
    suppliersByStore: {},
    goalsByStore: {},
  };

  const merged = { ...base, ...(db || {}) };

  // garante todos storeIds
  for (const s of STORES) {
    if (!merged.transactionsByStore[s.id]) merged.transactionsByStore[s.id] = {};
    if (!merged.groupsByStore[s.id]) merged.groupsByStore[s.id] = INITIAL_GROUPS;
    if (!merged.suppliersByStore[s.id]) merged.suppliersByStore[s.id] = [];
    if (!merged.goalsByStore[s.id]) merged.goalsByStore[s.id] = [];
  }

  // garante master
  const hasMaster = merged.users.some((u) => u.username === "master");
  if (!hasMaster) {
    merged.users.push({
      username: "master",
      password: "master",
      role: "master",
      store_id: null,
    });
  }

  return merged;
}

function getDB() {
  if (!fs.existsSync(DB_FILE)) {
    const fresh = ensureDBShape(null);
    fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  const shaped = ensureDBShape(raw);
  // se precisou ajustar shape, salva
  fs.writeFileSync(DB_FILE, JSON.stringify(shaped, null, 2));
  return shaped;
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getStoreId(req) {
  const headerStore = (req.headers["x-store-id"] || "").toString().trim();
  const queryStore = (req.query.store_id || "").toString().trim();
  const storeId = headerStore || queryStore || "paris6";
  const exists = STORES.some((s) => s.id === storeId);
  return exists ? storeId : "paris6";
}

// HEALTH
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// STORES
app.get("/api/stores", (req, res) => {
  res.json(STORES);
});

// LOGIN (compatível com o frontend “real” do ZIP: {success:true, username})
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const db = getDB();
  const user = db.users.find((u) => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ success: false, message: "Credenciais inválidas" });

  return res.json({ success: true, username: user.username });
});

// REGISTER (compatível ZIP)
app.post("/api/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, message: "Dados inválidos" });

  const db = getDB();
  if (db.users.find((u) => u.username === username)) {
    return res.status(400).json({ success: false, message: "Usuário já existe" });
  }

  db.users.push({ username, password, role: "user", store_id: null });
  saveDB(db);
  return res.json({ success: true, username });
});

// AUTH LOGIN (para o seu modelo novo com token, se você quiser manter)
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const db = getDB();
  const user = db.users.find((u) => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ ok: false, error: "Usuário ou senha inválidos" });

  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const token = jwt.sign(
    { username: user.username, role: user.role || "user" },
    secret,
    { expiresIn: "8h" }
  );

  return res.json({
    ok: true,
    token,
    user: { username: user.username, role: user.role || "user", store_id: user.store_id || null },
  });
});

// TRANSACTIONS (por loja)
app.get("/api/transactions", (req, res) => {
  const storeId = getStoreId(req);
  const db = getDB();
  res.json(db.transactionsByStore[storeId] || {});
});

app.post("/api/transactions", (req, res) => {
  const storeId = getStoreId(req);
  const db = getDB();
  db.transactionsByStore[storeId] = req.body || {};
  saveDB(db);
  res.json({ success: true });
});

// GROUPS (por loja)
app.get("/api/groups", (req, res) => {
  const storeId = getStoreId(req);
  const db = getDB();
  res.json(db.groupsByStore[storeId] || INITIAL_GROUPS);
});

app.post("/api/groups", (req, res) => {
  const storeId = getStoreId(req);
  const db = getDB();
  db.groupsByStore[storeId] = req.body || [];
  saveDB(db);
  res.json({ success: true });
});

// SUPPLIERS (por loja)
app.get("/api/suppliers", (req, res) => {
  const storeId = getStoreId(req);
  const db = getDB();
  res.json(db.suppliersByStore[storeId] || []);
});

app.post("/api/suppliers", (req, res) => {
  const storeId = getStoreId(req);
  const db = getDB();
  db.suppliersByStore[storeId] = req.body || [];
  saveDB(db);
  res.json({ success: true });
});

// GOALS (por loja)
app.get("/api/goals", (req, res) => {
  const storeId = getStoreId(req);
  const db = getDB();
  res.json(db.goalsByStore[storeId] || []);
});

app.post("/api/goals", (req, res) => {
  const storeId = getStoreId(req);
  const db = getDB();
  db.goalsByStore[storeId] = req.body || [];
  saveDB(db);
  res.json({ success: true });
});

// fallback
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada", path: req.path });
});

app.listen(PORT, () => console.log(`✅ API rodando na porta ${PORT}`));
