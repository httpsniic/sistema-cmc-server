import React from 'react';
import { Package, TrendingDown, TrendingUp } from 'lucide-react';
import { GroupMetric } from '../types';
import { formatCurrency, formatPercent } from '../utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

interface AnalysisTabProps {
  metricasPorGrupo: GroupMetric[];
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ metricasPorGrupo }) => {
  const dataForCharts = metricasPorGrupo.filter(m => m.compras > 0 || m.faturamento > 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Análise de Performance por Grupo
      </h2>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart: Compras por Grupo */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Distribuição de Compras (R$)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataForCharts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="nome" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `R$${val/1000}k`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="compras" name="Compras" radius={[4, 4, 0, 0]}>
                {dataForCharts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Share of Wallet */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Participação nos Custos</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataForCharts}
                dataKey="compras"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                 {dataForCharts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {metricasPorGrupo.map((metrica, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl p-6 border-t-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{ borderColor: metrica.cor }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl filter drop-shadow-sm">{metrica.icone}</span>
                <h3 className="text-xl font-bold text-slate-800">{metrica.nome}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase font-bold text-slate-400 mb-1">Compras Totais</div>
                <div className="text-2xl font-bold" style={{ color: metrica.cor }}>
                  {formatCurrency(metrica.compras)}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase font-bold text-slate-400 mb-1">Faturamento Relacionado</div>
                <div className="text-lg font-semibold text-slate-700">
                  {formatCurrency(metrica.faturamento)}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs uppercase font-bold text-slate-500">CMC Atual</div>
                  <div className="text-xs text-slate-400">Meta: {metrica.metaCMV}%</div>
                </div>
                
                <div className={`text-2xl font-bold ${
                  metrica.cmc <= metrica.metaCMV ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(metrica.cmc)}
                </div>
              </div>

              <div className="pt-2">
                {metrica.cmc <= metrica.metaCMV ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-semibold">Dentro da meta</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">Acima da meta</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {metricasPorGrupo.filter(m => m.compras > 0).length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhum dado de grupo disponível para este mês.</p>
          <p className="text-sm mt-1">Adicione compras com grupos para visualizar a análise.</p>
        </div>
      )}
    </div>
  );
};