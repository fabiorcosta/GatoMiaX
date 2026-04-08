// ═══════════════════════════════════════
// GatoMiaX — Business Constants
// Valores ajustáveis via Config no Firebase (futuro)
// ═══════════════════════════════════════

/** Custo por km rodado (R$) */
export const CUSTO_KM = 1.40;

/** Custo base de combustível (R$) */
export const COMBUSTIVEL_BASE = 30.0;

/** Percentual do sinal (Cláusula 12ª) */
export const PERCENTUAL_SINAL = 0.50;

/** Horas para alerta de sinal pendente */
export const ALERTA_SINAL_HORAS = 24;

/** Horas para alerta de orçamento sem resposta */
export const ALERTA_ORCAMENTO_HORAS = 48;

/** Salários por nível de recreador (R$) */
export const SALARIOS_POR_NIVEL: Record<number, number> = {
  1: 85,
  2: 100,
  3: 130,
};

/** Estágios do funil com labels e cores */
export const FUNIL_STAGES = [
  { key: 'lead', label: 'Lead', color: 'var(--color-status-lead)' },
  { key: 'orcado', label: 'Orçado', color: 'var(--color-status-orcado)' },
  { key: 'aguardando_sinal', label: 'Aguardando Sinal', color: 'var(--color-status-aguardando)' },
  { key: 'confirmado', label: 'Confirmado', color: 'var(--color-status-confirmado)' },
  { key: 'executado', label: 'Executado', color: 'var(--color-status-executado)' },
  { key: 'finalizado', label: 'Finalizado', color: 'var(--color-status-finalizado)' },
  { key: 'cancelado', label: 'Cancelado', color: 'var(--color-status-cancelado)' },
] as const;

/** Tipos de evento */
export const TIPOS_EVENTO = [
  { key: 'festa', label: 'Festa' },
  { key: 'colonia', label: 'Colônia de Férias' },
] as const;

/** Métodos de pagamento */
export const METODOS_PAGAMENTO = [
  { key: 'pix', label: 'PIX' },
  { key: 'dinheiro', label: 'Dinheiro' },
  { key: 'cartao', label: 'Cartão' },
  { key: 'transferencia', label: 'Transferência' },
] as const;
