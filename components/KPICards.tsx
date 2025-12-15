import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Metrics } from '../types';
import { formatCurrency, formatPercent } from '../utils';

interface KPICardsProps {
  metrics: Metrics;
  cmvMeta: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics, cmvMeta }) => {
  const isCmcGood = metrics.cmcAtual <= cmvMeta;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <DollarSign className="w-6 h-6 text-blue-500" />
          <span className="text-xs font-semibold text-blue-600 tracking-wider">FATURAMENTO</span>
        </div>
        <div className="text-2xl font-bold text-blue-900">
          {formatCurrency(metrics.faturamentoTotal)}
        </div>
        <div className="text-xs text-blue-600 mt-1 font-medium">
          Média/dia: {formatCurrency(metrics.mediaFaturamentoDia)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <ShoppingCart className="w-6 h-6 text-orange-500" />
          <span className="text-xs font-semibold text-orange-600 tracking-wider">COMPRAS</span>
        </div>
        <div className="text-2xl font-bold text-orange-900">
          {formatCurrency(metrics.comprasTotal)}
        </div>
        <div className="text-xs text-orange-600 mt-1 font-medium">
          Total acumulado
        </div>
      </div>

      <div className={`bg-gradient-to-br rounded-xl p-4 border shadow-sm ${
        isCmcGood 
          ? 'from-green-50 to-green-100 border-green-200' 
          : 'from-red-50 to-red-100 border-red-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          {isCmcGood ? (
            <TrendingDown className="w-6 h-6 text-green-500" />
          ) : (
            <TrendingUp className="w-6 h-6 text-red-500" />
          )}
          <span className={`text-xs font-semibold tracking-wider ${
            isCmcGood ? 'text-green-600' : 'text-red-600'
          }`}>CMC ATUAL</span>
        </div>
        <div className={`text-2xl font-bold ${
          isCmcGood ? 'text-green-900' : 'text-red-900'
        }`}>
          {formatPercent(metrics.cmcAtual)}
        </div>
        <div className={`text-xs mt-1 font-medium ${
          isCmcGood ? 'text-green-600' : 'text-red-600'
        }`}>
          Meta: {cmvMeta}% | Diff: {formatPercent(metrics.cmcAtual - cmvMeta)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <Calendar className="w-6 h-6 text-purple-500" />
          <span className="text-xs font-semibold text-purple-600 tracking-wider">PROJEÇÃO</span>
        </div>
        <div className="text-2xl font-bold text-purple-900">
          {formatCurrency(metrics.projecaoFaturamento)}
        </div>
        <div className="text-xs text-purple-600 mt-1 font-medium">
          Faltam {Math.max(0, metrics.diasRestantes)} dias
        </div>
      </div>
    </div>
  );
};