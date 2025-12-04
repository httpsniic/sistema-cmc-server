export interface Transaction {
  data: string;
  dia: string;
  faturamentoTotal: number;
  compras: number;
  grupo: string;
  fornecedor: string;
}

export interface Supplier {
  id: number;
  nome: string;
  contato: string;
  email: string;
  categorias: string[];
}

export interface Group {
  id: number;
  nome: string;
  cor: string;
  metaCMV: number;
  icone: string;
}

export interface Goal {
  id: number;
  periodo: string;
  faturamentoMeta: number;
  cmcMeta: number;
  ticketMedio: number;
}

export interface Metrics {
  faturamentoTotal: number;
  comprasTotal: number;
  cmcAtual: number;
  diasRealizados: number;
  diasRestantes: number;
  projecaoFaturamento: number;
  mediaFaturamentoDia: number;
}

export interface GroupMetric {
  nome: string;
  cor: string;
  icone: string;
  compras: number;
  faturamento: number;
  cmc: number;
  metaCMV: number;
}