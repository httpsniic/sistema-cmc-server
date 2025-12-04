import React, { useState } from 'react';
import { Goal } from '../types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils';

interface GoalsTabProps {
  metas: Goal[];
  onAddGoal: (meta: Partial<Goal>) => void;
  onRemoveGoal: (id: number) => void;
}

export const GoalsTab: React.FC<GoalsTabProps> = ({ metas, onAddGoal, onRemoveGoal }) => {
  const [novaMeta, setNovaMeta] = useState({
    periodo: '',
    faturamentoMeta: '',
    cmcMeta: '',
    ticketMedio: ''
  });

  const handleAdd = () => {
    if (!novaMeta.periodo || !novaMeta.faturamentoMeta) {
      alert('Preencha período e faturamento meta');
      return;
    }
    onAddGoal({
      periodo: novaMeta.periodo,
      faturamentoMeta: parseFloat(novaMeta.faturamentoMeta),
      cmcMeta: parseFloat(novaMeta.cmcMeta) || 30,
      ticketMedio: parseFloat(novaMeta.ticketMedio) || 0
    });
    setNovaMeta({ periodo: '', faturamentoMeta: '', cmcMeta: '', ticketMedio: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestão de Metas</h2>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
           <PlusCircle className="w-5 h-5" /> Cadastrar Nova Meta
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-purple-900 mb-1.5">Período</label>
            <input
              type="text"
              placeholder="Ex: Janeiro/2025"
              value={novaMeta.periodo}
              onChange={(e) => setNovaMeta({ ...novaMeta, periodo: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-purple-900 mb-1.5">Fat. Meta (R$)</label>
            <input
              type="number"
              placeholder="0,00"
              value={novaMeta.faturamentoMeta}
              onChange={(e) => setNovaMeta({ ...novaMeta, faturamentoMeta: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-purple-900 mb-1.5">CMC Meta (%)</label>
            <input
              type="number"
              step="0.1"
              placeholder="30"
              value={novaMeta.cmcMeta}
              onChange={(e) => setNovaMeta({ ...novaMeta, cmcMeta: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-purple-900 mb-1.5">Ticket Médio (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={novaMeta.ticketMedio}
              onChange={(e) => setNovaMeta({ ...novaMeta, ticketMedio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full bg-purple-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" /> Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metas.map(meta => (
          <div key={meta.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold text-slate-800">{meta.periodo}</h4>
              <button
                onClick={() => onRemoveGoal(meta.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-600 font-medium">Faturamento Meta</span>
                <span className="font-bold text-blue-600">{formatCurrency(meta.faturamentoMeta)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-600 font-medium">CMC Meta</span>
                <span className="font-bold text-green-600">{meta.cmcMeta}%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600 font-medium">Ticket Médio</span>
                <span className="font-bold text-purple-600">{formatCurrency(meta.ticketMedio)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};