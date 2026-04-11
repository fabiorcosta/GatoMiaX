import { Timestamp } from 'firebase/firestore';

export interface FunnelStage {
  id: string;                        // slug único
  label: string;                     // exibido no Kanban
  color: string;                     // hex para o badge
  order: number;                     // posição
  is_terminal: boolean;              // se true, card não avança mais
  terminal_type?: 'won' | 'lost';    // só se is_terminal = true
  triggers_recontact?: boolean;      // só "finalizado" = true
  requires_payment_check?: boolean;  // "executado" ou "finalizado"
  requires_team_payment?: boolean;   // "finalizado"
  auto_create_lead_days?: number;
}

export interface GatoMiaConfig {
  funnel_stages: FunnelStage[];

  automation: {
    recontact_days: number;
    quote_followup_days: number;
    team_alert_days: number;
    auto_archive_months: number;
  };

  financial: {
    min_deposit_pct: number;
    min_margin_pct: number;
    second_payment_trigger: 'before_event' | 'day_of' | 'after_event';
    second_payment_offset_hours: number;
  };

  team: {
    rest_between_events_hours: number;
    ratio_recreador_children: number;
  };

  recontact: {
    enabled: boolean;
    days_before: number;
    vip_threshold_brl: number;
    vip_days_before: number;
    suppression_days: number;
  };
  
  updatedAt?: Timestamp | string;
}

export const DEFAULT_STAGES: FunnelStage[] = [
  { id: 'novo_lead', label: 'Novo Lead', color: '#7F77DD', order: 0, is_terminal: false },
  { id: 'contato_feito', label: 'Contato Feito', color: '#378ADD', order: 1, is_terminal: false },
  { id: 'orcamento_enviado', label: 'Orçamento Enviado', color: '#EF9F27', order: 2, is_terminal: false },
  { id: 'confirmado', label: 'Confirmado', color: '#1D9E75', order: 3, is_terminal: false },
  { id: 'executado', label: 'Executado', color: '#5DCAA5', order: 4, is_terminal: false, requires_payment_check: true, requires_team_payment: false },
  { id: 'finalizado', label: 'Finalizado', color: '#639922', order: 5, is_terminal: true, terminal_type: 'won', triggers_recontact: true, requires_payment_check: true, requires_team_payment: true },
  { id: 'perdido', label: 'Perdido', color: '#E24B4A', order: 6, is_terminal: true, terminal_type: 'lost' },
];

export const DEFAULT_CONFIG: GatoMiaConfig = {
  funnel_stages: DEFAULT_STAGES,
  automation: {
    recontact_days: 180,
    quote_followup_days: 3,
    team_alert_days: 7,
    auto_archive_months: 6,
  },
  financial: {
    min_deposit_pct: 50,
    min_margin_pct: 20,
    second_payment_trigger: 'day_of',
    second_payment_offset_hours: 0,
  },
  team: {
    rest_between_events_hours: 4,
    ratio_recreador_children: 10,
  },
  recontact: {
    enabled: true,
    days_before: 180,
    vip_threshold_brl: 2000,
    vip_days_before: 120,
    suppression_days: 365,
  }
};
