import { motion, AnimatePresence } from 'motion/react';
import type { FunnelStage } from '@/types/settings';
import type { FunnelCard } from '@/types/funnel';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MoveStageSheetProps {
  isOpen: boolean;
  onClose: () => void;
  card: FunnelCard | null;
  stages: FunnelStage[];
  onConfirm: (targetStageId: string) => void;
  isMobile?: boolean;
}

export function MoveStageSheet({ isOpen, onClose, card, stages, onConfirm, isMobile = false }: MoveStageSheetProps) {
  if (!card) return null;

  const currentStage = stages.find(s => s.id === card.stageId);
  const activeStages = stages.filter(s => !s.is_terminal && s.id !== card.stageId).sort((a,b)=>a.order-b.order);
  const terminalStages = stages.filter(s => s.is_terminal && s.id !== card.stageId).sort((a,b)=>a.order-b.order);

  const SheetContent = (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="flex justify-between items-center p-4 border-b border-surface-border-subtle shrink-0">
        <div>
          <h3 className="font-display font-bold text-text-primary leading-tight">Mover Card</h3>
          <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{card.clientName}</p>
        </div>
        <button onClick={onClose} className="p-2 text-text-muted rounded-full bg-surface-raised hover:text-text-primary">
           <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
        {currentStage && (
          <div className="flex items-center gap-2 mb-4 px-2 py-1.5 border border-surface-border-subtle bg-surface-raised rounded-lg text-xs w-fit">
            <span className="text-text-muted">Atual:</span>
            <div className="w-2 h-2 rounded-full" style={{backgroundColor: currentStage.color}} />
            <span className="font-bold text-text-secondary">{currentStage.label}</span>
          </div>
        )}

        <div>
           <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-2 px-1">Próximos Estágios</p>
           <div className="space-y-1.5 flex flex-col">
              {activeStages.map(stage => (
                <button 
                  key={stage.id} 
                  onClick={() => onConfirm(stage.id)} 
                  className="flex items-center justify-between p-3 rounded-xl border border-transparent bg-surface-base hover:bg-surface-raised hover:border-surface-border-subtle transition-all text-left"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded bg-brand-yellow/50" style={{backgroundColor: stage.color}} />
                      <span className="font-bold text-sm text-text-primary">{stage.label}</span>
                   </div>
                   <ArrowRight className="w-4 h-4 text-text-muted/50" />
                </button>
              ))}
           </div>
        </div>

        {terminalStages.length > 0 && (
          <div className="pt-4 border-t border-dashed border-surface-border-subtle">
           <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-2 px-1">Encerramento</p>
           <div className="space-y-1.5 flex flex-col">
              {terminalStages.map(stage => (
                <button 
                  key={stage.id} 
                  onClick={() => onConfirm(stage.id)} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${stage.terminal_type === 'won' ? 'bg-success/5 border-success/10 hover:border-success/30 hover:bg-success/10 text-success' : 'bg-danger/5 border-danger/10 hover:border-danger/30 hover:bg-danger/10 text-danger'}`}
                >
                   <span className="font-bold text-sm">{stage.label}</span>
                   <ArrowRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
           </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-120 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-base/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0.5, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative flex flex-col glass card-gradient shadow-2xl border-surface-border border-t sm:border overflow-hidden w-full 
              ${isMobile ? "rounded-t-3xl max-h-[90vh] pb-8" : "sm:max-w-md sm:rounded-3xl max-h-[85vh] sm:w-[400px]"}`
            }
          >
            {isMobile && <div className="w-10 h-1.5 rounded-full bg-surface-border-subtle mx-auto mt-3 shrink-0" />}
            {SheetContent}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
