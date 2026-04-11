import { GatoMiaConfig, FunnelStage } from '@/types/settings';
import type { Evento } from '@/types';

/**
 * Dado um card Finalizado, retorna a data do novo lead de recontato
 */
export function calcRecontactDate(evento: Evento, config: GatoMiaConfig): Date | null {
  if (!config.recontact.enabled) return null;
  if (!evento.data) return null;

  const eventDate = new Date(typeof evento.data === 'string' ? evento.data : evento.data.toDate());
  
  // Se for VIP, usa config VIP, senão padrão.
  // Assumimos VIP baseado no valor total para este exemplo.
  const isVip = evento.valorTotal >= config.recontact.vip_threshold_brl;
  const daysBefore = isVip ? config.recontact.vip_days_before : config.recontact.days_before;

  // Recontato: 1 ano para frente - daysBefore
  const recontactDate = new Date(eventDate);
  recontactDate.setFullYear(recontactDate.getFullYear() + 1);
  recontactDate.setDate(recontactDate.getDate() - daysBefore);

  return recontactDate;
}

/**
 * Verifica se um card de orçamento está "parado" demais
 */
export function isQuoteStale(evento: Evento, config: GatoMiaConfig): boolean {
  if (evento.status !== 'orcamento_enviado') return false;
  if (!evento.statusUpdatedAt) return false;

  const updatedDate = new Date(typeof evento.statusUpdatedAt === 'string' ? evento.statusUpdatedAt : evento.statusUpdatedAt.toDate());
  const diffTime = Math.abs(new Date().getTime() - updatedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  return diffDays > config.automation.quote_followup_days;
}

/**
 * Verifica se um evento está próximo sem equipe alocada
 */
export function isTeamAlert(evento: Evento, config: GatoMiaConfig): boolean {
  if (evento.status === 'finalizado' || evento.status === 'cancelado' || evento.status === 'perdido') return false;
  if (!evento.data) return false;
  
  const eventDate = new Date(typeof evento.data === 'string' ? evento.data : evento.data.toDate());
  const diffTime = eventDate.getTime() - new Date().getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= config.automation.team_alert_days && (!evento.equipe || evento.equipe.length === 0)) {
    return true;
  }
  
  return false;
}

/**
 * Verifica se a margem do evento está abaixo do mínimo exigido
 */
export function isBelowMinMargin(evento: Evento, config: GatoMiaConfig): boolean {
  return evento.margemPercent < config.financial.min_margin_pct;
}

/**
 * Obter pendências na hora de finalizar o evento
 */
export function getFinalizationBlockers(evento: Evento, stage: FunnelStage): string[] {
  const blockers: string[] = [];

  if (stage.requires_payment_check && !evento.restantePago) {
    blockers.push("Pagamento do cliente (restante) não confirmado.");
  }

  // Verificar equipe check (Simplificado: vamos assumir que adicionaremos um flag pagoNaEquipe no evento ou que o admin apenas da OK manual no modal)
  // O spec diz para confirmar via modal, então o blocker é mais visual na hora do check.
  // Esta função pode ser usada para validation pre-modal.
  if (stage.requires_team_payment && evento.equipe?.length > 0) {
    // Para simplificar, sem um flag individual para cada recreador, o modal perguntará.
    blockers.push(`Pagamento da equipe (${evento.equipe.length} recreadores) precisa ser validado.`);
  }

  return blockers;
}
