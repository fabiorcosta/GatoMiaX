import { cn } from '@/lib/utils';
import type { EventoStatus } from '@/types';

interface StatusBadgeProps {
  status: EventoStatus;
  className?: string;
}

const statusConfig: Record<EventoStatus, { label: string; className: string }> = {
  lead: { label: 'Lead', className: 'bg-status-lead/20 text-[#A78BFA] border-[#A78BFA]/30' },
  orcado: { label: 'Orçado', className: 'bg-status-orcado/20 text-[#60A5FA] border-[#60A5FA]/30' },
  aguardando_sinal: { label: 'Aguardando Sinal', className: 'bg-status-aguardando/20 text-[#F7D117] border-[#F7D117]/30' },
  confirmado: { label: 'Confirmado', className: 'bg-status-confirmado/20 text-[#22C55E] border-[#22C55E]/30' },
  executado: { label: 'Executado', className: 'bg-status-executado/20 text-[#8B3BA6] border-[#8B3BA6]/30' },
  finalizado: { label: 'Finalizado', className: 'bg-status-finalizado/20 text-text-muted border-surface-border-subtle' },
  cancelado: { label: 'Cancelado', className: 'bg-status-cancelado/20 text-[#EF4444] border-[#EF4444]/30' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.lead;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
