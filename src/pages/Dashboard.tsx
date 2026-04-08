import { motion } from 'motion/react';

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-bold text-text-primary">
        Dashboard
      </h1>
      <p className="text-text-secondary">
        KPIs, gráficos de sazonalidade e visão geral do negócio.
      </p>
      {/* TODO: Fase 1 — Extrair componentes do monolito */}
    </motion.div>
  );
}
