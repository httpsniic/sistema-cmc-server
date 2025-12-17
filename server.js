import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Render injeta PORT; local pode ser 10000
const PORT = Number(process.env.PORT || 10000);

// CORS por ENV (CSV)
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Se não tiver ENV, libera localhost para dev
const allowedOrigins =
  corsOrigins.length > 0 ? corsOrigins : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // requests sem origin (curl/postman) passam
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS bloqueado para origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// health
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// db test
app.get("/api/db-test", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("DB_TEST_ERROR:", err);
    res.status(500).json({ ok: false, error: "Falha ao conectar no banco" });
  }
});

// auth routes
app.use("/api/auth", authRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log("CORS liberado para:", allowedOrigins);
});
