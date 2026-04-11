import { formatCurrency } from '@/lib/utils';
import type { FunnelStage } from '@/types/settings';
import type { FunnelCard } from '@/types/funnel';
import { cn } from '@/lib/utils';

interface PipelineSidebarProps {
  stages: FunnelStage[];
  cards: FunnelCard[];
  activeStageId: string;
  onStageSelect: (stageId: string) => void;
}

export function PipelineSidebar({ stages, cards, activeStageId, onStageSelect }: PipelineSidebarProps) {
  // Separa terminais de ativos
  const activeStages = stages.filter(s => !s.is_terminal);
  const terminalStages = stages.filter(s => s.is_terminal);

  const calcStageValue = (stageId: string) => {
    return cards.filter(c => c.stageId === stageId).reduce((acc, curr) => acc + curr.estimatedValue, 0);
  };

  const totalPipeline = activeStages.reduce((acc, stage) => acc + calcStageValue(stage.id), 0);

  const renderStage = (stage: FunnelStage) => {
    const stageCards = cards.filter(c => c.stageId === stage.id);
    const stageValue = calcStageValue(stage.id);
    
    return (
      <button
        key={stage.id}
        onClick={() => onStageSelect(stage.id)}
        className={cn(
          "w-full flex flex-col p-3 rounded-xl transition-all border text-left",
          activeStageId === stage.id 
            ? "border-brand-purple bg-brand-purple/5 shadow-md" 
            : "border-transparent hover:bg-surface-raised hover:border-surface-border"
        )}
      >
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className={cn(
              "text-sm font-bold uppercase tracking-wider",
              activeStageId === stage.id ? "text-text-primary" : "text-text-secondary"
            )}>
              {stage.label}
            </span>
          </div>
          <span className="text-xs font-black bg-surface-base px-2 py-0.5 rounded-md text-text-muted border border-surface-border-subtle">
            {stageCards.length}
          </span>
        </div>
        <p className="text-xs font-bold text-text-muted">
          {formatCurrency(stageValue)}
        </p>
      </button>
    );
  };

  return (
    <div className="w-[280px] shrink-0 border-r border-surface-border-subtle bg-surface-base/30 flex flex-col h-full rounded-l-3xl">
      <div className="p-4 border-b border-surface-border-subtle bg-surface-base/80 rounded-tl-3xl">
        <h2 className="text-sm font-display font-black text-text-primary uppercase tracking-widest mb-1">Pipeline Summary</h2>
        <p className="text-[10px] text-text-muted leading-tight">Visão consolidada do fluxo atual</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {activeStages.map(renderStage)}
        
        {terminalStages.length > 0 && (
          <>
            <div className="py-2 mt-4 mb-2 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-surface-border-subtle"></div></div>
              <span className="relative bg-surface-base px-2 text-[10px] uppercase font-bold tracking-widest text-text-muted">Encerrados</span>
            </div>
            {terminalStages.map(renderStage)}
          </>
        )}
      </div>

      <div className="p-4 border-t border-surface-border-subtle bg-surface-raised/30 rounded-bl-3xl">
        <p className="text-[10px] font-black uppercase text-text-muted mb-1 tracking-widest">Total Aberto (Pipeline)</p>
        <p className="text-xl font-display font-bold text-brand-yellow drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">
          {formatCurrency(totalPipeline)}
        </p>
      </div>
    </div>
  );
}
