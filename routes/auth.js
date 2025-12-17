const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== "master" || password !== "master") {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  const token = jwt.sign(
    { user: "master", role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: {
      username: "master",
      role: "admin",
    },
  });
});

module.exports = router;
