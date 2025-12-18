import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import storesRoutes from "./routes/stores.js";

dotenv.config();

const app = express();
app.use(express.json());

// CORS (Render -> Netlify)
const rawOrigins = process.env.CORS_ORIGINS || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // permite chamadas sem origin (ex: curl, healthcheck)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS bloqueado para: ${origin}`), false);
    },
    credentials: true,
  })
);

// health
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// rotas
app.use("/api/auth", authRoutes);
app.use("/api/stores", storesRoutes);

// fallback
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada", path: req.path });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ API rodando na porta ${PORT}`));
