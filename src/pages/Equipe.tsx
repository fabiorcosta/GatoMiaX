import { motion } from 'motion/react';

export default function Equipe() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-bold text-text-primary">
        Equipe
      </h1>
      <p className="text-text-secondary">
        Gestão de recreadores: níveis, salários, disponibilidade e especialidades.
      </p>
      {/* TODO: Fase 1 — Extrair do monolito */}
    </motion.div>
  );
}
