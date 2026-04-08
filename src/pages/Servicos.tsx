import { motion } from 'motion/react';

export default function Servicos() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-bold text-text-primary">
        Serviços
      </h1>
      <p className="text-text-secondary">
        Catálogo de serviços com checklist, preços e toggle ativo/inativo.
      </p>
      {/* TODO: Fase 1 — Extrair do monolito */}
    </motion.div>
  );
}
