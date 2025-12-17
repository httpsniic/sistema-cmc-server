import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const role = req.user?.role;
    const storeId = req.user?.store_id;

    if (role === "master") {
      const r = await pool.query(
        `SELECT id, name, active, created_at
         FROM stores
         ORDER BY name ASC`
      );
      return res.json({ ok: true, stores: r.rows });
    }

    if (!storeId) {
      return res.status(403).json({ ok: false, error: "Usuário sem store_id" });
    }

    const r = await pool.query(
      `SELECT id, name, active, created_at
       FROM stores
       WHERE id = $1
       LIMIT 1`,
      [storeId]
    );

    return res.json({ ok: true, stores: r.rows });
  } catch (err) {
    console.error("STORES_LIST_ERROR:", err);
    return res.status(500).json({ ok: false, error: "Erro ao listar lojas" });
  }
});

export default router;
