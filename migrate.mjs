// migrate.mjs
import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não está definida no ambiente.");
  console.error("➡️ Garanta que existe no arquivo .env: DATABASE_URL=postgresql://...");
  process.exit(1);
}

const MAX_RETRIES = 6;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withDb(fn) {
  let lastErr;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    try {
      console.log(`🔌 Conectando no Postgres (tentativa ${attempt}/${MAX_RETRIES})...`);
      await client.connect();
      return await fn(client);
    } catch (err) {
      lastErr = err;
      console.log(`⚠️ Falha ao conectar (tentativa ${attempt}/${MAX_RETRIES}). Motivo: ${err.message}`);
      // Importante: sempre finalizar o client desta tentativa
      try { await client.end(); } catch {}
      // backoff leve
      await sleep(800 * attempt);
    }
  }

  throw lastErr;
}

async function run() {
  try {
    await withDb(async (client) => {
      // Tabelas
      await client.query(`
        CREATE TABLE IF NOT EXISTS stores (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          store_id INTEGER REFERENCES stores(id),
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("✅ Tabelas criadas/confirmadas com sucesso!");
    });
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exitCode = 1;
  }
}

run();
