import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "uma_chave_super_secreta_aqui";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ ok: false, error: "Token ausente" });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Token inválido" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ ok: false, error: "Sem permissão" });
    }
    return next();
  };
}
