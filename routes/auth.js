import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (username !== "master" || password !== "master") {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  const secret = process.env.JWT_SECRET || "dev_secret_change_me";

  const token = jwt.sign({ user: "master" }, secret, { expiresIn: "8h" });

  return res.json({
    token,
    user: {
      username: "master",
      role: "admin",
    },
  });
});

export default router;

