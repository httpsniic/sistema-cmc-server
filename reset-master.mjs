import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pg from "pg";

dotenv.config(); // carrega backend/.env

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.includes("render.com") ||
      process.env.DATABASE_URL.includes("oregon-postgres") ||
      process.env.DATABASE_URL.includes("postgres.render.com"))
      ? { rejectUnauthorized: false }
      : undefined,
});

const novaSenha = process.argv[2] || "123456";
const hash = await bcrypt.hash(novaSenha, 10);

// IMPORTANTE: o login do seu auth.js compara com user.password
// então o reset precisa atualizar a coluna `password` (hash bcrypt)
const r1 = await pool.query(
  `
  UPDATE users
  SET password = $1
  WHERE username = 'master'
  RETURNING id, username, email
  `,
  [hash]
);

if (r1.rowCount === 0) {
  const r2 = await pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE email = 'master@cmc.com'
    RETURNING id, username, email
    `,
    [hash]
  );

  if (r2.rowCount === 0) {
    console.log("❌ Usuário master não encontrado.");
  } else {
    console.log("✅ Master atualizado:", r2.rows[0]);
    console.log("🔑 Nova senha:", novaSenha);
  }
} else {
  console.log("✅ Master atualizado:", r1.rows[0]);
  console.log("🔑 Nova senha:", novaSenha);
}

await pool.end();
