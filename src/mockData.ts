import { Recreador, Service, Evento } from './types';

export const RECREADORES: Recreador[] = [
  { id: '1', nome: 'Aline', nivel: 1, salario: 85 },
  { id: '2', nome: 'Amanda B.', nivel: 1, salario: 85 },
  { id: '3', nome: 'Ágata', nivel: 1, salario: 90 },
  { id: '4', nome: 'Ana Julia', nivel: 1, salario: 95 },
  { id: '5', nome: 'Luh', nivel: 2, salario: 100 },
  { id: '6', nome: 'Wallace', nivel: 3, salario: 120 },
  { id: '7', nome: 'Ari', nivel: 3, salario: 130 },
  { id: '8', nome: 'Isabelli', nivel: 3, salario: 130 },
  { id: '9', nome: 'Lulu', nivel: 3, salario: 130 },
  { id: '10', nome: 'Rodinha', nivel: 3, salario: 130 },
];

export const SERVICES: Service[] = [
  { id: 's1', nome: 'Recreação 3-14 anos', precoSugerido: 1020, checklist: ['Som', 'Microfone', 'Brincadeiras'], nivelMinimo: 1 },
  { id: 's2', nome: 'Clubinho Baby', precoSugerido: 800, checklist: ['Tapete', 'Brinquedos Lúdicos'], nivelMinimo: 1 },
  { id: 's3', nome: 'Pintura Artística', precoSugerido: 350, checklist: ['Tintas', 'Pincéis', 'Glitter'], nivelMinimo: 1 },
  { id: 's4', nome: 'Champions Kids', precoSugerido: 1200, checklist: ['Bolas', 'Coletes', 'Medalhas'], nivelMinimo: 2 },
  { id: 's5', nome: 'Noite do Pijama', precoSugerido: 1500, checklist: ['Cabanas', 'Colchões', 'Luzes'], nivelMinimo: 3 },
  { id: 's6', nome: 'Torta na Cara', precoSugerido: 400, checklist: ['Chantilly', 'Pratos', 'Perguntas'], nivelMinimo: 2 },
];

export const MOCK_EVENTS: Evento[] = [
  {
    id: 'e1',
    cliente: 'Mariana Assad Yanagishita',
    data: '2026-04-17',
    valorTotal: 1020,
    distanciaKm: 10,
    recreadoresIds: ['7', '8', '9', '10'], // Ari, Isabelli, Lulu, Rodinha (4 recreadores)
    custoDeslocamento: 14,
    custoEquipe: 520, // 130 * 4
    lucroLiquido: 486,
  },
  {
    id: 'e2',
    cliente: 'Condomínio Village Damha I',
    data: '2026-01-05',
    valorTotal: 5000,
    distanciaKm: 5,
    recreadoresIds: ['5', '6'],
    custoDeslocamento: 7,
    custoEquipe: 220,
    lucroLiquido: 4773,
  }
];

export const SEASONALITY_DATA = [
  { month: 'Jan', value: 4500, type: 'Colônia' },
  { month: 'Fev', value: 2100, type: 'Comum' },
  { month: 'Mar', value: 2300, type: 'Comum' },
  { month: 'Abr', value: 2800, type: 'Comum' },
  { month: 'Mai', value: 2500, type: 'Comum' },
  { month: 'Jun', value: 2200, type: 'Comum' },
  { month: 'Jul', value: 4800, type: 'Colônia' },
  { month: 'Ago', value: 2400, type: 'Comum' },
  { month: 'Set', value: 2600, type: 'Comum' },
  { month: 'Out', value: 3100, type: 'Comum' },
  { month: 'Nov', value: 2900, type: 'Comum' },
  { month: 'Dez', value: 3500, type: 'Comum' },
];
