import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Limite aumentado para dados grandes

// Dados Iniciais Padrão
const INITIAL_DATA = {
  users: [],
  transactions: {},
  groups: [
    { id: 1, nome: 'Sushi', cor: '#f43f5e', metaCMV: 32, icone: '🍣' },
    { id: 2, nome: 'Cozinha', cor: '#f59e0b', metaCMV: 28, icone: '🍳' },
    { id: 3, nome: 'Bebidas', cor: '#8b5cf6', metaCMV: 25, icone: '🥤' },
    { id: 4, nome: 'Hortifruti', cor: '#10b981', metaCMV: 15, icone: '🥬' },
    { id: 5, nome: 'Embalagem', cor: '#64748b', metaCMV: 5, icone: '📦' },
    { id: 6, nome: 'Limpeza', cor: '#06b6d4', metaCMV: 3, icone: '🧹' },
    { id: 7, nome: 'Mercearia', cor: '#f97316', metaCMV: 25, icone: '🥫' },
  ],
  suppliers: [],
  goals: []
};

// Helper para ler/escrever no "banco de dados" (arquivo JSON)
const getDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
    return INITIAL_DATA;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const saveDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- ROTA DE HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ success: true, username: user.username });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const db = getDB();
  
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Usuário já existe' });
  }

  db.users.push({ username, password });
  saveDB(db);
  res.json({ success: true, username });
});

// --- ROTAS DE DADOS (TRANSACTIONS) ---

app.get('/api/transactions', (req, res) => {
  const db = getDB();
  res.json(db.transactions || {});
});

app.post('/api/transactions', (req, res) => {
  const db = getDB();
  db.transactions = req.body;
  saveDB(db);
  res.json({ success: true });
});

// --- ROTAS DE GRUPOS ---

app.get('/api/groups', (req, res) => {
  const db = getDB();
  res.json(db.groups || []);
});

app.post('/api/groups', (req, res) => {
  const db = getDB();
  db.groups = req.body;
  saveDB(db);
  res.json({ success: true });
});

// --- ROTAS DE FORNECEDORES ---

app.get('/api/suppliers', (req, res) => {
  const db = getDB();
  res.json(db.suppliers || []);
});

app.post('/api/suppliers', (req, res) => {
  const db = getDB();
  db.suppliers = req.body;
  saveDB(db);
  res.json({ success: true });
});

// --- ROTAS DE METAS ---

app.get('/api/goals', (req, res) => {
  const db = getDB();
  res.json(db.goals || []);
});

app.post('/api/goals', (req, res) => {
  const db = getDB();
  db.goals = req.body;
  saveDB(db);
  res.json({ success: true });
});

// Escuta em 0.0.0.0 para permitir acesso na rede local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});