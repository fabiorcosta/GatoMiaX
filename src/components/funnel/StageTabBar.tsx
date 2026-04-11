import { useEffect, useRef } from 'react';
import type { FunnelStage } from '@/types/settings';
import type { FunnelCard } from '@/types/funnel';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface StageTabBarProps {
  stages: FunnelStage[];
  cards: FunnelCard[];
  activeStageId: string;
  onStageSelect: (stageId: string) => void;
}

export function StageTabBar({ stages, cards, activeStageId, onStageSelect }: StageTabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Quick fix: sort the stages internally based on order so they appear chronologically left-to-right
  const sortedStages = [...stages].sort((a,b) => a.order - b.order);

  useEffect(() => {
    // When activeStage changes, auto scroll to it
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeStageId]);

  return (
    <div 
      className="flex w-full overflow-x-auto custom-scrollbar bg-surface-base border-b border-surface-border shrink-0 touch-pan-x"
      ref={scrollRef}
    >
      <div className="flex px-4 pt-2">
        {sortedStages.map(stage => {
          const count = cards.filter(c => c.stageId === stage.id).length;
          const isActive = activeStageId === stage.id;
          
          return (
            <button
              key={stage.id}
              data-active={isActive}
              onClick={() => onStageSelect(stage.id)}
              className={cn(
                "relative min-w-max px-4 py-3 flex items-center gap-2 transition-colors",
                isActive ? "text-text-primary" : "text-text-muted hover:bg-surface-raised/50"
              )}
            >
              <span className="text-xs font-bold uppercase tracking-widest">{stage.label}</span>
              <span className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                isActive ? "bg-surface-border text-text-primary" : "bg-surface-base border border-surface-border-subtle"
              )}>
                {count}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeStageIndicator"
                  className="absolute bottom-0 left-4 right-4 h-1 rounded-t-full"
                  style={{ backgroundColor: stage.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
