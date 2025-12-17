import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definida no .env");
}

const needsSSL =
  connectionString.includes("render.com") ||
  connectionString.includes("oregon-postgres") ||
  connectionString.includes("postgres.render.com");

export const pool = new Pool({
  connectionString,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});
