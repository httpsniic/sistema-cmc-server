import React from 'react';
import { AlertCircle, TrendingDown } from 'lucide-react';
import { Transaction, Group, Metrics } from '../types';
import { formatCurrency, formatPercent } from '../utils';

interface DashboardTabProps {
  data: Transaction[];
  metrics: Metrics;
  cmvMeta: number;
  grupos: Group[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ data, metrics, cmvMeta, grupos }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Análise Detalhada - CMC por Dia
      </h2>
      
      {metrics.cmcAtual > cmvMeta && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="font-bold text-red-800">CMC acima da meta</h3>
              <p className="text-red-700 text-sm mt-1">
                O Custo Médio de Compras está {formatPercent(metrics.cmcAtual - cmvMeta)} acima da meta de {cmvMeta}%. 
                Revise compras e ajuste faturamento.
              </p>
            </div>
          </div>
        </div>
      )}

      {metrics.cmcAtual <= cmvMeta && metrics.faturamentoTotal > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <TrendingDown className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="font-bold text-green-800">CMC dentro da meta! 🎯</h3>
              <p className="text-green-700 text-sm mt-1">
                Parabéns! O Custo Médio de Compras está {formatPercent(cmvMeta - metrics.cmcAtual)} abaixo da meta de {cmvMeta}%.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="px-4 py-3 text-left text-xs uppercase font-bold text-slate-500 tracking-wider">Data</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-bold text-slate-500 tracking-wider">Dia</th>
                <th className="px-4 py-3 text-right text-xs uppercase font-bold text-slate-500 tracking-wider">Faturamento</th>
                <th className="px-4 py-3 text-right text-xs uppercase font-bold text-slate-500 tracking-wider">Compras</th>
                <th className="px-4 py-3 text-center text-xs uppercase font-bold text-slate-500 tracking-wider">Grupo</th>
                <th className="px-4 py-3 text-center text-xs uppercase font-bold text-slate-500 tracking-wider">Fornecedor</th>
                <th className="px-4 py-3 text-right text-xs uppercase font-bold text-slate-500 tracking-wider">CMC Dia</th>
                <th className="px-4 py-3 text-right text-xs uppercase font-bold text-slate-500 tracking-wider">CMC Acum.</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Nenhum dado registrado para este mês.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const fatAcumulado = data.slice(0, index + 1).reduce((acc, d) => acc + d.faturamentoTotal, 0);
                  const comprasAcumulado = data.slice(0, index + 1).reduce((acc, d) => acc + d.compras, 0);
                  const cmcDia = item.faturamentoTotal > 0 ? (item.compras / item.faturamentoTotal) * 100 : 0;
                  const cmcAcumulado = fatAcumulado > 0 ? (comprasAcumulado / fatAcumulado) * 100 : 0;
                  const grupoInfo = grupos.find(g => g.nome === item.grupo);

                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-slate-50 transition-colors ${
                        item.faturamentoTotal === 0 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.data}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.dia}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                        {formatCurrency(item.faturamentoTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-orange-600">
                        {item.compras > 0 ? formatCurrency(item.compras) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.grupo && grupoInfo && (
                          <span 
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-sm"
                            style={{ backgroundColor: grupoInfo.cor }}
                          >
                            <span>{grupoInfo.icone}</span>
                            {item.grupo}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-500">
                        {item.fornecedor || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold ${
                        cmcDia > cmvMeta ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {item.faturamentoTotal > 0 ? formatPercent(cmcDia) : '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold ${
                        cmcAcumulado > cmvMeta ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {formatPercent(cmcAcumulado)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};