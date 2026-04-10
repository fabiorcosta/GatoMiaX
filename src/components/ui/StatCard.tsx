import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  delay?: number;
}

export function StatCard({ title, value, icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card-gradient rounded-xl p-5 border border-surface-border glass glow-hover relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-brand-purple opacity-20 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-brand-yellow">
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-display font-bold text-text-primary tracking-tight">
          {value}
        </p>
        
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <span
              className={cn(
                "font-medium",
                trend.positive ? "text-success" : "text-danger"
              )}
            >
              {trend.positive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="ml-1.5 text-text-muted">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
