const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());

// CORS
function buildCorsOrigins() {
  const raw = process.env.CORS_ORIGINS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const corsOrigins = buildCorsOrigins();
app.use(
  cors({
    origin: function (origin, callback) {
      // permite Postman e chamadas sem origin
      if (!origin) return callback(null, true);
      if (corsOrigins.length === 0) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS bloqueado para esta origem: " + origin));
    },
    credentials: true,
  })
);

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// Lojas
const STORES = [
  { id: "paris6", name: "Paris6" },
  { id: "xian", name: "Xian" },
  { id: "stella", name: "Stella" },
  { id: "new-hakata", name: "New Hakata" },
  { id: "jardim-secreto", name: "Jardim Secreto" },
  { id: "mestre-cuca", name: "Mestre Cuca" },
  { id: "food-zone", name: "Food Zone" },
];

// Auth middleware
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Token ausente" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

// Store middleware
function requireStore(req, res, next) {
  const storeId = req.headers["x-store-id"];
  if (!storeId) return res.status(400).json({ error: "Loja não informada (x-store-id)" });

  const ok = STORES.some((s) => s.id === storeId);
  if (!ok) return res.status(400).json({ error: "Loja inválida" });

  req.storeId = storeId;
  return next();
}

// Rotas
app.use("/api/auth", authRoutes);

// Lista de lojas (protegido)
app.get("/api/stores", requireAuth, (req, res) => {
  res.json({ stores: STORES });
});

// Exemplo de rota protegida e com loja escolhida (para você testar)
app.get("/api/me", requireAuth, requireStore, (req, res) => {
  res.json({
    user: req.user,
    storeId: req.storeId,
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});
