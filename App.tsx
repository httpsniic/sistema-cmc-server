import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, ShoppingBag, Target, Users, Package, PieChart as PieChartIcon, LogOut, User as UserIcon, Loader2, Database, Wifi, WifiOff, HardDrive, Settings } from 'lucide-react';
import { DashboardTab } from './components/DashboardTab';
import { PurchasesTab } from './components/PurchasesTab';
import { GoalsTab } from './components/GoalsTab';
import { SuppliersTab } from './components/SuppliersTab';
import { GroupsTab } from './components/GroupsTab';
import { AnalysisTab } from './components/AnalysisTab';
import { KPICards } from './components/KPICards';
import { LoginScreen } from './components/LoginScreen';
import { Transaction, Group, Supplier, Goal, Metrics } from './types';
import { parseDate } from './utils';
import { db } from './services/db';

const MESES_NOMES = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function App() {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<string | null>(db.auth.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState<boolean>(false);

  // --- APP STATE ---
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [ano, setAno] = useState(today.getFullYear());
  const [cmvMeta] = useState(30);
  const [abaSelecionada, setAbaSelecionada] = useState('dashboard');
  
  // --- PERSISTENT DATA STATE ---
  const [dadosPorMes, setDadosPorMes] = useState<Record<string, Transaction[]>>({});
  const [grupos, setGrupos] = useState<Group[]>([]);
  const [fornecedores, setFornecedores] = useState<Supplier[]>([]);
  const [metas, setMetas] = useState<Goal[]>([]);

  // Carregamento de dados via Banco de Dados (Service Layer)
  const loadData = useCallback(async () => {
    try {
      // Verifica conexão
      const isOnline = await db.health.checkConnection();
      setServerOnline(isOnline);

      // Carregamos tudo em paralelo para ser mais rápido
      // O db.service agora decide automaticamente se busca do servidor ou do local
      const [
        loadedTransactions,
        loadedGroups,
        loadedSuppliers,
        loadedGoals
      ] = await Promise.all([
        db.transactions.getAll(),
        db.groups.getAll(),
        db.suppliers.getAll(),
        db.goals.getAll()
      ]);

      setDadosPorMes(loadedTransactions);
      setGrupos(loadedGroups);
      setFornecedores(loadedSuppliers);
      setMetas(loadedGoals);
      
      // Atualiza sessão se mudou externamente
      const sessionUser = db.auth.getCurrentUser();
      if (sessionUser !== currentUser) {
        setCurrentUser(sessionUser);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- SYNC MECHANISM ---
  // Escuta mudanças no banco local (outras abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Recarrega se houver mudanças no storage (mesmo em modo local)
      loadData();
    };

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadData]);

  // --- HANDLERS ---

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    loadData(); // Recarrega dados após login
  };

  const handleLogout = async () => {
    await db.auth.logout();
    setCurrentUser(null);
  };

  const handleConfigureServer = () => {
    const currentUrl = db.config.getApiUrl().replace('/api', '');
    const newUrl = prompt(
      "Para conectar outros computadores, insira o endereço do servidor:\n\n" +
      "Exemplo: http://192.168.0.10:3001\n\n" +
      "Para voltar ao modo local/padrão, digite: http://localhost:3001",
      currentUrl
    );

    if (newUrl) {
      db.config.setApiUrl(newUrl);
      window.location.reload();
    }
  };

  const chaveMes = `${mes}-${ano}`;
  const dados = dadosPorMes[chaveMes] || [];
  const diasNoMes = new Date(ano, mes, 0).getDate();

  const mudarMes = (delta: number) => {
    let novoMes = mes + delta;
    let novoAno = ano;
    
    if (novoMes > 12) {
      novoMes = 1;
      novoAno++;
    } else if (novoMes < 1) {
      novoMes = 12;
      novoAno--;
    }
    
    setMes(novoMes);
    setAno(novoAno);
  };

  const metrics: Metrics = useMemo(() => {
    const faturamentoTotal = dados.reduce((acc, d) => acc + d.faturamentoTotal, 0);
    const comprasTotal = dados.reduce((acc, d) => acc + d.compras, 0);
    const cmcAtual = faturamentoTotal > 0 ? (comprasTotal / faturamentoTotal) * 100 : 0;
    
    const diasRealizados = dados.filter(d => d.faturamentoTotal > 0).length;
    const diasRestantes = diasNoMes - diasRealizados;
    const mediaFaturamentoDia = diasRealizados > 0 ? faturamentoTotal / diasRealizados : 0;
    const projecaoFaturamento = faturamentoTotal + (mediaFaturamentoDia * diasRestantes);
    
    return {
      faturamentoTotal,
      comprasTotal,
      cmcAtual,
      diasRealizados,
      diasRestantes,
      projecaoFaturamento,
      mediaFaturamentoDia
    };
  }, [dados, diasNoMes]);

  const metricasPorGrupo = useMemo(() => {
    return grupos.map(grupo => {
      const comprasGrupo = dados
        .filter(d => d.grupo === grupo.nome)
        .reduce((acc, d) => acc + d.compras, 0);
      
      const faturamentoGrupo = dados
        .filter(d => d.grupo === grupo.nome)
        .reduce((acc, d) => acc + d.faturamentoTotal, 0);
      
      const cmcGrupo = faturamentoGrupo > 0 ? (comprasGrupo / faturamentoGrupo) * 100 : 0;
      
      return {
        nome: grupo.nome,
        cor: grupo.cor,
        icone: grupo.icone,
        compras: comprasGrupo,
        faturamento: faturamentoGrupo,
        cmc: cmcGrupo,
        metaCMV: grupo.metaCMV
      };
    });
  }, [dados, grupos]);

  // Wrapper Functions to call DB Service
  
  const handleAddPurchase = async (compra: { data: string; valor: string; grupo: string; fornecedor: string }) => {
    if (!compra.data || !compra.valor) {
      alert('Preencha data e valor da compra');
      return;
    }

    const valorFloat = parseFloat(compra.valor);
    const [d, m, y] = compra.data.split('/');
    
    // Check Date consistency
    if (Number(m) !== mes || Number(y) !== ano) {
       if(!window.confirm(`A data ${compra.data} não pertence ao mês selecionado (${MESES_NOMES[mes]}/${ano}). Deseja adicionar mesmo assim?`)) {
         return;
       }
    }

    const targetKey = `${Number(m)}-${Number(y)}`;
    const currentList = dadosPorMes[targetKey] || [];
    const existingDay = currentList.find(x => x.data === compra.data);
    
    let newList;
    if (existingDay) {
      newList = currentList.map(x => x.data === compra.data ? {
        ...x,
        compras: x.compras + valorFloat,
        grupo: compra.grupo || x.grupo,
        fornecedor: compra.fornecedor || x.fornecedor
      } : x);
    } else {
       const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
       const dateObj = new Date(Number(y), Number(m)-1, Number(d));
       newList = [...currentList, {
         data: compra.data,
         dia: diasSemana[dateObj.getDay()],
         faturamentoTotal: 0,
         compras: valorFloat,
         grupo: compra.grupo,
         fornecedor: compra.fornecedor
       }].sort((a,b) => parseDate(a.data).getTime() - parseDate(b.data).getTime());
    }

    const newDadosPorMes = { ...dadosPorMes, [targetKey]: newList };
    
    // Otimistic Update
    setDadosPorMes(newDadosPorMes); 
    // DB Persist
    await db.transactions.save(newDadosPorMes);
  };

  const handleRemovePurchase = async (dataCompra: string) => {
    if (window.confirm(`Deseja excluir o lançamento de compras do dia ${dataCompra}?`)) {
        const currentData = dadosPorMes[chaveMes] || [];
        const novosDados = currentData.map(d => {
          if (d.data === dataCompra) {
            return { ...d, compras: 0, grupo: '', fornecedor: '' };
          }
          return d;
        }).filter(d => d.faturamentoTotal > 0 || d.compras > 0);
        
        const newDadosPorMes = { ...dadosPorMes, [chaveMes]: novosDados };
        setDadosPorMes(newDadosPorMes);
        await db.transactions.save(newDadosPorMes);
    }
  };

  const handleAddGroup = async (grupo: Partial<Group>) => {
    const novoId = Math.max(0, ...grupos.map(g => g.id)) + 1;
    const newGroups = [...grupos, { id: novoId, nome: grupo.nome!, cor: grupo.cor!, metaCMV: grupo.metaCMV!, icone: grupo.icone! }];
    setGrupos(newGroups);
    await db.groups.save(newGroups);
  };

  const handleRemoveGroup = async (id: number) => {
    if (window.confirm('Deseja remover este grupo?')) {
      const newGroups = grupos.filter(g => g.id !== id);
      setGrupos(newGroups);
      await db.groups.save(newGroups);
    }
  };

  const handleAddSupplier = async (fornecedor: Partial<Supplier>) => {
    const novoId = Math.max(0, ...fornecedores.map(f => f.id)) + 1;
    const newSuppliers = [...fornecedores, { id: novoId, nome: fornecedor.nome!, contato: fornecedor.contato!, email: fornecedor.email!, categorias: fornecedor.categorias! }];
    setFornecedores(newSuppliers);
    await db.suppliers.save(newSuppliers);
  };

  const handleRemoveSupplier = async (id: number) => {
    if (window.confirm('Deseja remover este fornecedor?')) {
      const newSuppliers = fornecedores.filter(f => f.id !== id);
      setFornecedores(newSuppliers);
      await db.suppliers.save(newSuppliers);
    }
  };

  const handleAddGoal = async (meta: Partial<Goal>) => {
    const novoId = Math.max(0, ...metas.map(m => m.id)) + 1;
    const newGoals = [...metas, { id: novoId, periodo: meta.periodo!, faturamentoMeta: meta.faturamentoMeta!, cmcMeta: meta.cmcMeta!, ticketMedio: meta.ticketMedio! }];
    setMetas(newGoals);
    await db.goals.save(newGoals);
  };

  const handleRemoveGoal = async (id: number) => {
    if (window.confirm('Deseja remover esta meta?')) {
      const newGoals = metas.filter(m => m.id !== id);
      setMetas(newGoals);
      await db.goals.save(newGoals);
    }
  };

  const renderTabContent = () => {
    switch (abaSelecionada) {
      case 'dashboard':
        return <DashboardTab data={dados} metrics={metrics} cmvMeta={cmvMeta} grupos={grupos} />;
      case 'compras':
        if (grupos.length === 0) {
           return (
             <div className="text-center py-12">
               <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-slate-700">Nenhum Grupo Cadastrado</h3>
               <p className="text-slate-500 mb-6">Cadastre grupos de produtos antes de lançar compras.</p>
               <button onClick={() => setAbaSelecionada('grupos')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                 Ir para Grupos
               </button>
             </div>
           )
        }
        return <PurchasesTab dados={dados} grupos={grupos} fornecedores={fornecedores} onAddPurchase={handleAddPurchase} onRemovePurchase={handleRemovePurchase} />;
      case 'metas':
        return <GoalsTab metas={metas} onAddGoal={handleAddGoal} onRemoveGoal={handleRemoveGoal} />;
      case 'fornecedores':
        return <SuppliersTab fornecedores={fornecedores} onAddSupplier={handleAddSupplier} onRemoveSupplier={handleRemoveSupplier} />;
      case 'grupos':
        return <GroupsTab grupos={grupos} onAddGroup={handleAddGroup} onRemoveGroup={handleRemoveGroup} />;
      case 'analise':
        return <AnalysisTab metricasPorGrupo={metricasPorGrupo} />;
      default:
        return null;
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p className="font-medium">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
                Controle Financeiro
              </h1>
              <p className="text-slate-500 mt-2 text-lg">
                Controle Estratégico de Custos & Performance
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3 w-full justify-end">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  <UserIcon className="w-4 h-4" />
                  {currentUser}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-sm font-medium transition-colors"
                  title="Sair do sistema"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>

              <div className="flex items-center bg-slate-100 rounded-xl p-1.5 border border-slate-200">
                <button
                  onClick={() => mudarMes(-1)}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-48 text-center font-bold text-slate-800 text-lg">
                  {MESES_NOMES[mes]} <span className="text-slate-400">/</span> {ano}
                </div>
                <button
                  onClick={() => mudarMes(1)}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <KPICards metrics={metrics} cmvMeta={cmvMeta} />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-t-2xl shadow-sm border border-slate-200 border-b-0">
          <div className="flex overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'compras', label: 'Lançar Compras', icon: ShoppingBag },
              { id: 'metas', label: 'Metas', icon: Target },
              { id: 'fornecedores', label: 'Fornecedores', icon: Users },
              { id: 'grupos', label: 'Grupos', icon: Package },
              { id: 'analise', label: 'Análise', icon: PieChartIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAbaSelecionada(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                  abaSelecionada === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${abaSelecionada === tab.id ? 'stroke-[2.5px]' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 border-t-0 p-6 min-h-[500px]">
          <div className="animate-fade-in">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-8">
          <p className="text-slate-400 text-sm font-medium">
            Controle Financeiro © {new Date().getFullYear()}
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              {serverOnline ? (
                 <>
                   <Database className="w-4 h-4 text-green-500" />
                   <p className="text-xs font-semibold text-green-600">
                     Conectado ao Servidor
                   </p>
                   <Wifi className="w-3 h-3 text-green-500"/>
                 </>
              ) : (
                 <>
                   <HardDrive className="w-4 h-4 text-orange-500" />
                   <p className="text-xs font-semibold text-orange-600">
                     Modo Local (Offline)
                   </p>
                   <WifiOff className="w-3 h-3 text-orange-500"/>
                 </>
              )}
            </div>
            
            <button 
              onClick={handleConfigureServer}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold text-slate-600 transition-colors"
            >
              <Settings className="w-3 h-3" /> Configurar IP
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {serverOnline 
              ? `Conectado em: ${db.config.getApiUrl()}` 
              : 'Seus dados estão seguros neste navegador.'}
          </p>
        </div>
      </div>
    </div>
  );
}