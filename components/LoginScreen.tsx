import React, { useState } from 'react';
import { User, Lock, ArrowRight, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { db } from '../services/db';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        const success = await db.auth.register(username, password);
        if (success) {
          onLogin(username);
        } else {
          setError('Usuário já existe.');
        }
      } else {
        const success = await db.auth.login(username, password);
        if (success) {
          onLogin(username);
        } else {
          setError('Usuário ou senha incorretos.');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight mb-2">
              Controle Financeiro
            </h1>
            <p className="text-slate-500">
              {isRegistering ? 'Crie sua conta para começar' : 'Entre para gerenciar seus custos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                  placeholder="Seu nome de usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                  placeholder="Sua senha"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processando...
                </>
              ) : isRegistering ? (
                <>
                  <UserPlus className="w-5 h-5" /> Criar Conta
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setUsername('');
                setPassword('');
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              {isRegistering ? (
                <>Já tem uma conta? Entre aqui <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Não tem conta? Crie agora <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400">
            Sistema seguro. Seus dados são criptografados localmente.
          </p>
        </div>
      </div>
    </div>
  );
};