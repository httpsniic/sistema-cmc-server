import { Transaction, Group, Supplier, Goal } from '../types';

const STORAGE_PREFIX = 'cmc_local_';
const SERVER_URL_KEY = 'cmc_server_url';
const SESSION_KEY = 'cmc_session_user';

// Carrega URL salva ou usa localhost como padrão
let API_URL = localStorage.getItem(SERVER_URL_KEY) || 'http://localhost:3001/api';

// --- LOCAL STORAGE HELPERS (FALLBACK) ---
// Usados quando o servidor não está rodando

const localDB = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    // Dispara evento para sincronizar abas
    window.dispatchEvent(new StorageEvent('storage', { key: 'cmc_update' }));
  }
};

// Dados iniciais para quando estiver offline e for o primeiro acesso
const INITIAL_LOCAL_GROUPS = [
  { id: 1, nome: 'Sushi', cor: '#f43f5e', metaCMV: 32, icone: '🍣' },
  { id: 2, nome: 'Cozinha', cor: '#f59e0b', metaCMV: 28, icone: '🍳' },
  { id: 3, nome: 'Bebidas', cor: '#8b5cf6', metaCMV: 25, icone: '🥤' },
  { id: 4, nome: 'Hortifruti', cor: '#10b981', metaCMV: 15, icone: '🥬' },
  { id: 5, nome: 'Embalagem', cor: '#64748b', metaCMV: 5, icone: '📦' },
  { id: 6, nome: 'Limpeza', cor: '#06b6d4', metaCMV: 3, icone: '🧹' },
];

// --- SERVICE IMPLEMENTATION ---

let isOnline = false;

export const db = {
  config: {
    getApiUrl: () => API_URL,
    setApiUrl: (url: string) => {
      // Remove trailing slash and /api if user added it manually to avoid dupes
      let cleanUrl = url.trim().replace(/\/$/, ""); 
      if (!cleanUrl.endsWith('/api')) {
        cleanUrl += '/api';
      }
      localStorage.setItem(SERVER_URL_KEY, cleanUrl);
      API_URL = cleanUrl;
    }
  },

  health: {
    checkConnection: async (): Promise<boolean> => {
      try {
        // Tenta conectar com timeout curto (2s) para não travar a tela
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        isOnline = res.ok;
        return res.ok;
      } catch (error) {
        isOnline = false;
        return false;
      }
    },
    isOnline: () => isOnline
  },

  auth: {
    getCurrentUser: () => {
      return localStorage.getItem(SESSION_KEY);
    },
    login: async (username: string, password: string): Promise<boolean> => {
      if (isOnline) {
        try {
          const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await response.json();
          if (data.success) {
            localStorage.setItem(SESSION_KEY, data.username);
            return true;
          }
          return false;
        } catch (e) { console.error(e); }
      }
      
      // Fallback Local
      const users = localDB.get<{username:string, password:string}[]>('users', []);
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem(SESSION_KEY, username);
        return true;
      }
      return false;
    },
    register: async (username: string, password: string): Promise<boolean> => {
      if (isOnline) {
        try {
          const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await response.json();
          if (data.success) {
            localStorage.setItem(SESSION_KEY, data.username);
            return true;
          }
          return false;
        } catch (e) { console.error(e); }
      }

      // Fallback Local
      const users = localDB.get<{username:string, password:string}[]>('users', []);
      if (users.find(u => u.username === username)) return false;
      
      users.push({ username, password });
      localDB.set('users', users);
      localStorage.setItem(SESSION_KEY, username);
      return true;
    },
    logout: async () => {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  transactions: {
    getAll: async (): Promise<Record<string, Transaction[]>> => {
      if (isOnline) {
        try {
          const res = await fetch(`${API_URL}/transactions`);
          if (res.ok) return await res.json();
        } catch (e) { console.error(e); }
      }
      return localDB.get('transactions', {});
    },
    save: async (data: Record<string, Transaction[]>) => {
      if (isOnline) {
        try {
          await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return true;
        } catch (e) { console.error(e); }
      }
      localDB.set('transactions', data);
      return true;
    }
  },

  groups: {
    getAll: async (): Promise<Group[]> => {
      if (isOnline) {
        try {
          const res = await fetch(`${API_URL}/groups`);
          if (res.ok) return await res.json();
        } catch (e) { console.error(e); }
      }
      return localDB.get('groups', INITIAL_LOCAL_GROUPS);
    },
    save: async (data: Group[]) => {
      if (isOnline) {
        try {
          await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return true;
        } catch (e) { console.error(e); }
      }
      localDB.set('groups', data);
      return true;
    }
  },

  suppliers: {
    getAll: async (): Promise<Supplier[]> => {
      if (isOnline) {
        try {
          const res = await fetch(`${API_URL}/suppliers`);
          if (res.ok) return await res.json();
        } catch (e) { console.error(e); }
      }
      return localDB.get('suppliers', []);
    },
    save: async (data: Supplier[]) => {
      if (isOnline) {
        try {
          await fetch(`${API_URL}/suppliers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return true;
        } catch (e) { console.error(e); }
      }
      localDB.set('suppliers', data);
      return true;
    }
  },

  goals: {
    getAll: async (): Promise<Goal[]> => {
      if (isOnline) {
        try {
          const res = await fetch(`${API_URL}/goals`);
          if (res.ok) return await res.json();
        } catch (e) { console.error(e); }
      }
      return localDB.get('goals', []);
    },
    save: async (data: Goal[]) => {
      if (isOnline) {
        try {
          await fetch(`${API_URL}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return true;
        } catch (e) { console.error(e); }
      }
      localDB.set('goals', data);
      return true;
    }
  }
};