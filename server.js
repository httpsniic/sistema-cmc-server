import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "2mb" }));

// ===== CONFIG =====
const PORT = process.env.PORT || 10000;

// CORS_ORIGINS no Render: "https://sistemafinanceirocmc.netlify.app,http://localhost:3000"
const corsOriginsRaw = process.env.CORS_ORIGINS || "";
const corsOrigins = corsOriginsRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // permite curl/health sem origin
    if (!origin) return cb(null, true);

    // permite local dev e origens setadas
    const allowed =
      corsOrigins.includes(origin) ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1");

    return cb(allowed ? null : new Error("CORS bloqueado"), allowed);
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ===== STORES =====
const STORES = [
  { id: "paris6", name: "Paris6" },
  { id: "xian", name: "Xian" },
  { id: "stella", name: "Stella" },
  { id: "new-hakata", name: "New Hakata" },
  { id: "jardim-secreto", name: "Jardim Secreto" },
  { id: "mestre-cuca", name: "Mestre Cuca" },
  { id: "food-zone", name: "Food Zone" },
];

// onde ficam os JSON por loja
const DATA_DIR = path.join(__dirname, "data");

// garante pasta data
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function normalizeStoreId(id) {
  const v = String(id || "").trim().toLowerCase();
  return v;
}

function isValidStore(id) {
  return STORES.some((s) => s.id === id);
}

function storeFilePath(storeId) {
  return path.join(DATA_DIR, `store.${storeId}.json`);
}

async function readStoreDb(storeId) {
  await ensureDataDir();
  const fp = storeFilePath(storeId);

  try {
    const raw = await fs.readFile(fp, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
      suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
      metrics: parsed.metrics || null,
    };
  } catch {
    // arquivo não existe ainda
    return {
      purchases: [],
      suppliers: [],
      transactions: [],
      goals: [],
      groups: [],
      metrics: null,
    };
  }
}

async function writeStoreDb(storeId, data) {
  await ensureDataDir();
  const fp = storeFilePath(storeId);
  await fs.writeFile(fp, JSON.stringify(data, null, 2), "utf-8");
}

// ===== AUTH =====
function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ error: "Sem token" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT_SECRET não configurado" });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ===== ROUTES =====
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (username !== "master" || password !== "master") {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT_SECRET não configurado" });
  }

  const token = jwt.sign({ user: "master" }, secret, { expiresIn: "8h" });

  return res.json({
    token,
    user: { username: "master", role: "admin" },
  });
});

// STORES
app.get("/api/stores", authMiddleware, (req, res) => {
  res.json({ stores: STORES });
});

// PURCHASES (listar por loja)
app.get("/api/purchases", authMiddleware, async (req, res) => {
  const storeId = normalizeStoreId(req.query.store);
  if (!isValidStore(storeId)) {
    return res.status(400).json({ error: "store inválida" });
  }

  const db = await readStoreDb(storeId);
  return res.json({ purchases: db.purchases });
});

// PURCHASES (salvar por loja)
app.post("/api/purchases", authMiddleware, async (req, res) => {
  const { storeId: rawStoreId, purchase } = req.body || {};
  const storeId = normalizeStoreId(rawStoreId);

  if (!isValidStore(storeId)) {
    return res.status(400).json({ error: "store inválida" });
  }
  if (!purchase || typeof purchase !== "object") {
    return res.status(400).json({ error: "purchase inválido" });
  }

  const db = await readStoreDb(storeId);

  const item = {
    id: purchase.id || cryptoRandomId(),
    ...purchase,
    createdAt: purchase.createdAt || new Date().toISOString(),
  };

  db.purchases.unshift(item);
  await writeStoreDb(storeId, db);

  return res.json({ ok: true, purchase: item });
});

function cryptoRandomId() {
  // sem depender de libs
  return `p_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// 404 padrão de API
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`API online na porta ${PORT}`);
});
