import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  // credenciais fixas (por enquanto)
  if (username !== "master" || password !== "master") {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET não configurado no servidor" });
  }

  const token = jwt.sign({ user: "master" }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });

  return res.json({
    token,
    user: { username: "master", role: "admin" },
  });
});

export default router;
