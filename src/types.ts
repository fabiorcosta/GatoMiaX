export interface Recreador {
  id: string;
  nome: string;
  nivel: number;
  salario: number;
}

export interface Service {
  id: string;
  nome: string;
  precoSugerido: number;
  checklist: string[];
  nivelMinimo: number;
}

export interface Evento {
  id: string;
  cliente: string;
  data: string;
  valorTotal: number;
  distanciaKm: number;
  recreadoresIds: string[];
  custoDeslocamento: number;
  custoEquipe: number;
  lucroLiquido: number;
}
