import React, { useState } from 'react';
import { Supplier } from '../types';
import { PlusCircle, Trash2, Mail, Phone, Tag } from 'lucide-react';

interface SuppliersTabProps {
  fornecedores: Supplier[];
  onAddSupplier: (fornecedor: Partial<Supplier>) => void;
  onRemoveSupplier: (id: number) => void;
}

export const SuppliersTab: React.FC<SuppliersTabProps> = ({ fornecedores, onAddSupplier, onRemoveSupplier }) => {
  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: '',
    contato: '',
    email: '',
    categorias: ''
  });

  const handleAdd = () => {
    if (!novoFornecedor.nome) {
      alert('Preencha o nome do fornecedor');
      return;
    }
    onAddSupplier({
      ...novoFornecedor,
      categorias: novoFornecedor.categorias.split(',').map(c => c.trim()).filter(Boolean)
    });
    setNovoFornecedor({ nome: '', contato: '', email: '', categorias: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestão de Fornecedores</h2>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5"/> Cadastrar Novo Fornecedor
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-green-900 mb-1.5">Nome</label>
            <input
              type="text"
              placeholder="Ex: Atacadão"
              value={novoFornecedor.nome}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-green-900 mb-1.5">Contato</label>
            <input
              type="text"
              placeholder="(00) 0000-0000"
              value={novoFornecedor.contato}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, contato: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-green-900 mb-1.5">E-mail</label>
            <input
              type="email"
              placeholder="contato@fornecedor.com"
              value={novoFornecedor.email}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-green-900 mb-1.5">Categorias (sep. vírgula)</label>
            <input
              type="text"
              placeholder="Sushi, Outros"
              value={novoFornecedor.categorias}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, categorias: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
          </div>
        </div>
         <div className="mt-4 flex justify-end">
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white font-bold py-2.5 px-8 rounded-lg hover:bg-green-700 active:bg-green-800 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" /> Adicionar Fornecedor
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fornecedores.map(fornecedor => (
          <div key={fornecedor.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-green-400 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold text-slate-800">{fornecedor.nome}</h4>
              <button
                onClick={() => onRemoveSupplier(fornecedor.id)}
                className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Phone className="w-4 h-4 text-green-500" />
                {fornecedor.contato || 'Sem contato'}
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Mail className="w-4 h-4 text-green-500" />
                {fornecedor.email || 'Sem e-mail'}
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase">
                  <Tag className="w-3 h-3" /> Categorias
                </div>
                <div className="flex flex-wrap gap-2">
                  {fornecedor.categorias.map((cat, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-100">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};