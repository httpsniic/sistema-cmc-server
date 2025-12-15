import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Transaction, Group, Supplier } from '../types';
import { formatCurrency, formatPercent } from '../utils';

interface PurchasesTabProps {
  dados: Transaction[];
  grupos: Group[];
  fornecedores: Supplier[];
  onAddPurchase: (compra: { data: string; valor: string; grupo: string; fornecedor: string }) => void;
  onRemovePurchase: (data: string) => void;
}

export const PurchasesTab: React.FC<PurchasesTabProps> = ({ dados, grupos, fornecedores, onAddPurchase, onRemovePurchase }) => {
  const [novaCompra, setNovaCompra] = useState({
    data: '',
    valor: '',
    grupo: '',
    fornecedor: ''
  });

  const handleAdd = () => {
    onAddPurchase(novaCompra);
    setNovaCompra({ data: '', valor: '', grupo: '', fornecedor: '' });
  };

  const comprasRecentes = dados
    .filter(d => d.compras > 0)
    .slice(-10)
    .reverse();

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Lançamento de Compras
      </h2>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Nova Compra
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-blue-800 mb-1.5">
              Data da Compra
            </label>
            <input
              type="text"
              placeholder="DD/MM/AAAA"
              value={novaCompra.data}
              onChange={(e) => setNovaCompra({ ...novaCompra, data: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-blue-800 mb-1.5">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={novaCompra.valor}
              onChange={(e) => setNovaCompra({ ...novaCompra, valor: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-blue-800 mb-1.5">
              Grupo
            </label>
            <select
              value={novaCompra.grupo}
              onChange={(e) => setNovaCompra({ ...novaCompra, grupo: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
            >
              <option value="">Selecione...</option>
              {grupos.map(g => (
                <option key={g.id} value={g.nome}>{g.icone} {g.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-blue-800 mb-1.5">
              Fornecedor
            </label>
            <select
              value={novaCompra.fornecedor}
              onChange={(e) => setNovaCompra({ ...novaCompra, fornecedor: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
            >
              <option value="">Selecione...</option>
              {fornecedores.map(f => (
                <option key={f.id} value={f.nome}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Últimas Compras do Mês</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {comprasRecentes.length > 0 ? (
            comprasRecentes.map((item, index) => {
              const grupoInfo = grupos.find(g => g.nome === item.grupo);
              return (
                <div 
                  key={index}
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-[80px]">
                      <div className="font-semibold text-slate-800">{item.data}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold">{item.dia}</div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                       {grupoInfo && (
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-white w-fit"
                          style={{ backgroundColor: grupoInfo.cor }}
                        >
                          {grupoInfo.icone} {item.grupo}
                        </span>
                      )}
                      <div className="text-sm text-slate-600 font-medium">
                        {item.fornecedor}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right flex flex-col items-end">
                      <div className="text-lg font-bold text-orange-600">
                        {formatCurrency(item.compras)}
                      </div>
                      {item.faturamentoTotal > 0 && (
                        <div className="text-xs text-slate-400 font-medium">
                          Impacto CMC: {formatPercent((item.compras / item.faturamentoTotal) * 100)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemovePurchase(item.data)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Excluir compra"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500">
              Nenhuma compra registrada neste mês
            </div>
          )}
        </div>
      </div>
    </div>
  );
};