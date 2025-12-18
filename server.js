import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.js";

const app = express();

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS
const raw = process.env.CORS_ORIGINS || "";
const allowedOrigins = raw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests without origin (curl/postman)
      if (!origin) return cb(null, true);

      if (allowedOrigins.length === 0) return cb(null, true);

      const ok = allowedOrigins.includes(origin);
      return cb(ok ? null : new Error("Not allowed by CORS"), ok);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
  console.log(`CORS_ORIGINS: ${allowedOrigins.join(", ") || "(livre)"}`);
});

