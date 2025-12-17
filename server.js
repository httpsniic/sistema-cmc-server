import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Parse CORS_ORIGINS="https://seusite.netlify.app,http://localhost:3000"
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // permite Postman/Render health sem origin
      if (!origin) return cb(null, true);

      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS bloqueado para origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// health
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// auth
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});
