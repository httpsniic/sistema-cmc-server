import React, { useState } from 'react';
import { Group } from '../types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface GroupsTabProps {
  grupos: Group[];
  onAddGroup: (grupo: Partial<Group>) => void;
  onRemoveGroup: (id: number) => void;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({ grupos, onAddGroup, onRemoveGroup }) => {
  const [novoGrupo, setNovoGrupo] = useState({
    nome: '',
    cor: '#3b82f6',
    metaCMV: 30,
    icone: '📦'
  });

  const handleAdd = () => {
    if (!novoGrupo.nome) {
      alert('Preencha o nome do grupo');
      return;
    }
    onAddGroup(novoGrupo);
    setNovoGrupo({ nome: '', cor: '#3b82f6', metaCMV: 30, icone: '📦' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestão de Grupos</h2>

      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5"/> Cadastrar Novo Grupo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase text-indigo-900 mb-1.5">Nome do Grupo</label>
            <input
              type="text"
              placeholder="Ex: Pizza"
              value={novoGrupo.nome}
              onChange={(e) => setNovoGrupo({ ...novoGrupo, nome: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-indigo-900 mb-1.5">Cor</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={novoGrupo.cor}
                onChange={(e) => setNovoGrupo({ ...novoGrupo, cor: e.target.value })}
                className="h-11 w-full rounded-lg cursor-pointer border-2 border-white shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-indigo-900 mb-1.5">Meta CMV (%)</label>
            <input
              type="number"
              step="0.1"
              placeholder="30"
              value={novoGrupo.metaCMV}
              onChange={(e) => setNovoGrupo({ ...novoGrupo, metaCMV: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-indigo-900 mb-1.5">Ícone (Emoji)</label>
            <input
              type="text"
              placeholder="🍕"
              value={novoGrupo.icone}
              onChange={(e) => setNovoGrupo({ ...novoGrupo, icone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-center text-xl"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
           <button
              onClick={handleAdd}
              className="bg-indigo-600 text-white font-bold py-2.5 px-8 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" /> Adicionar Grupo
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {grupos.map(grupo => (
          <div key={grupo.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: grupo.cor }}></div>
            
            <div className="pl-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow-sm">{grupo.icone}</span>
                  <h4 className="text-xl font-bold text-slate-800">{grupo.nome}</h4>
                </div>
                <button
                  onClick={() => onRemoveGroup(grupo.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Cor Identificadora</span>
                  <div 
                    className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                    style={{ backgroundColor: grupo.cor }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Meta CMV</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{grupo.metaCMV}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};