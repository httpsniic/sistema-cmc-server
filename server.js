const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGINS.split(","),
  credentials: true,
}));

// rota de saúde
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// rotas de auth
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
