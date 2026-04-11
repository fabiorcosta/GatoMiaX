import { Timestamp } from 'firebase/firestore';

// ═══════════════════════════════════════
// Evento (Core Entity)
// ═══════════════════════════════════════

// Types dinâmicos de funil agora substituem os estados fixos anteriores
export type EventoStatus = string;

export type TipoEvento = 'festa' | 'colonia';

export type MetodoPagamento = 'pix' | 'dinheiro' | 'cartao' | 'transferencia';

export interface EquipeMembro {
  id: string;
  nome: string;
  nivel: number;
  salario: number;
}

export interface ServicoContratado {
  id: string;
  nome: string;
  precoUnitario: number;
}

export interface ColoniaInfo {
  numSemanas: number;
  adicionalLanche: number;
  descontoIrmaos: number;
}

export interface Evento {
  id: string;

  // Identificação
  clienteId: string;
  clienteNome: string;

  // Temporal
  data: Timestamp | string;
  horario?: string;

  // Tipo
  tipoEvento: TipoEvento;

  // Financeiro
  valorTotal: number;
  valorSinal: number;
  sinalPago: boolean;
  sinalPagoEm?: Timestamp | string;
  restantePago: boolean;
  restantePagoEm?: Timestamp | string;
  metodoPagamento?: MetodoPagamento;
  custoEquipe: number;
  custoDeslocamento: number;
  lucroLiquido: number;
  margemPercent: number;

  // Logística
  distanciaKm: number;
  endereco?: string;

  // Equipe
  equipe: EquipeMembro[];

  // Serviços
  servicosContratados?: ServicoContratado[];

  // Funil
  status: EventoStatus;
  statusUpdatedAt: Timestamp | string;

  // Colônia
  colonia?: ColoniaInfo;

  // Operacional
  observacoes?: string;

  // Metadata
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  criadoPor: string;
}

// ═══════════════════════════════════════
// Cliente
// ═══════════════════════════════════════

export interface Cliente {
  id: string;
  nome: string;
  whatsapp?: string;
  cpf?: string;
  email?: string;
  enderecoPadrao?: string;
  totalEventos: number;
  ultimoEvento?: Timestamp | string;
  consentimento: boolean;
  consentidoEm?: Timestamp | string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ═══════════════════════════════════════
// Recreador
// ═══════════════════════════════════════

export interface Recreador {
  id: string;
  nome: string;
  apelido?: string;
  nivel: 1 | 2 | 3;
  salario: number;
  ativo: boolean;
  whatsapp?: string;
  especialidades?: string[];
  conducao: boolean;
  totalEventos: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ═══════════════════════════════════════
// Serviço
// ═══════════════════════════════════════

export interface CustoVariavel {
  item: string;
  valor: number;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  precoSugerido: number;
  custosVariaveis?: CustoVariavel[];
  checklist: string[];
  nivelMinimo: 1 | 2 | 3;
  ativo: boolean;
  ativoDesde?: Timestamp | string;
  tags?: string[];
  idadeMinima?: number;
  idadeMaxima?: number;
  espacoMinimo?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ═══════════════════════════════════════
// Config (Singleton)
// ═══════════════════════════════════════

export interface AppConfig {
  custoKm: number;
  combustivelBase: number;
  percentualSinal: number;
  alertaSinalHoras: number;
  alertaOrcamentoHoras: number;
  nomeEmpresa: string;
  whatsappEmpresa: string;
  updatedAt: Timestamp | string;
}

// ═══════════════════════════════════════
// UI Types (não persistidos)
// ═══════════════════════════════════════

export type UserRole = 'admin' | 'recreador' | 'viewer';

export interface Usuario {
  id: string; // UID do Firebase Auth
  nome: string;
  email: string;
  role: UserRole;
  approved: boolean;
  createdAt: Timestamp | string;
  lastLogin: Timestamp | string;
}

export type TabKey =
  | 'dashboard'
  | 'funil'
  | 'novo-evento'
  | 'servicos'
  | 'equipe'
  | 'settings';
