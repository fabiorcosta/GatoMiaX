import { motion } from 'motion/react';
import type { Servico } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { serviceToWhatsAppText, openWhatsApp } from '@/lib/whatsapp';
import { Edit2, MessageCircle, Star, Power, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';

export type ServiceCardMode = "admin" | "public" | "compact";

export interface ServiceCardProps {
  service: Servico;
  mode?: ServiceCardMode;
  onSelect?: (service: Servico) => void;
  onEdit?: (service: Servico) => void;
  onToggleActive?: (service: Servico) => void;
}

export function ServiceCard({ service, mode = "public", onSelect, onEdit, onToggleActive }: ServiceCardProps) {

  // ============================================
  // MODO: COMPACT (Sidebar / Minificação)
  // ============================================
  if (mode === "compact") {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-base border border-surface-border-subtle hover:border-brand-purple/30 transition-all cursor-pointer group">
        <div>
          <h4 className="font-bold text-sm text-text-primary leading-tight group-hover:text-brand-purple transition-colors">
            {service.nome}
          </h4>
          <span className="text-xs font-semibold text-brand-yellow">
            {formatCurrency(service.precoSugerido)}
          </span>
        </div>
        {onSelect && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSelect(service); }}
            className="w-6 h-6 rounded-md bg-brand-purple/10 text-brand-purple flex items-center justify-center font-black group-hover:bg-brand-purple group-hover:text-black transition-colors"
          >
            +
          </button>
        )}
      </div>
    );
  }

  // ============================================
  // MODO: ADMIN (Gestão Interna)
  // ============================================
  if (mode === "admin") {
    return (
      <div className="flex flex-col p-5 rounded-2xl border border-surface-border bg-surface-raised relative overflow-hidden transition-all hover:shadow-lg">
        {!service.ativo && (
          <div className="absolute top-0 left-0 w-full h-1 bg-surface-border-subtle" />
        )}
        
        <div className="flex justify-between items-start mb-3">
          <div className="pr-8">
            <h3 className={`font-display font-bold text-lg ${service.ativo ? 'text-text-primary' : 'text-text-muted'}`}>
              {service.nome}
            </h3>
            <p className="text-xs text-text-muted mt-1 uppercase font-semibold tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Nível {service.nivelMinimo} exigido
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-lg font-black ${service.ativo ? 'text-brand-yellow glow-yellow-text' : 'text-text-muted'}`}>
              {formatCurrency(service.precoSugerido)}
            </span>
          </div>
        </div>

        <p className="text-sm text-text-secondary line-clamp-2 mt-2 mb-4 h-10">
          {service.description || service.descricao || <span className="italic text-text-muted/50">Sem descrição cadastrada.</span>}
        </p>

        <div className="mt-auto pt-4 border-t border-surface-border-subtle flex items-center justify-between gap-3">
          {onToggleActive && (
            <button 
              onClick={() => onToggleActive(service)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                service.ativo 
                ? 'text-danger hover:bg-danger/10' 
                : 'text-success hover:bg-success/10'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {service.ativo ? 'Desativar' : 'Reativar'}
            </button>
          )}

          {onEdit && (
            <Button variant="outline" className="h-8 text-xs py-0 px-4" onClick={() => onEdit(service)}>
              <Edit2 className="w-3 h-3 mr-2" /> Editar
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // MODO: PUBLIC (Vitrine)
  // ============================================
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-3xl border border-surface-border bg-surface-base glass overflow-hidden hover:border-brand-purple transition-colors shadow-xl"
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center mb-4 text-brand-purple border border-brand-purple/20">
          <Star className="w-6 h-6" />
        </div>
        
        <h3 className="font-display font-black text-2xl text-text-primary tracking-tight mb-2">
          {service.nome}
        </h3>
        
        <p className="text-text-secondary leading-relaxed mb-6 flex-1">
          {service.description || service.descricao}
        </p>

        {(service.durationMinutes || service.maxChildren || service.tags?.length || service.timesExecuted !== undefined) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {service.durationMinutes && (
              <span className="text-xs bg-surface-raised px-2 py-1 rounded-md text-text-muted font-semibold">
                ⏱ {service.durationMinutes} min
              </span>
            )}
            {service.maxChildren && (
              <span className="text-xs bg-surface-raised px-2 py-1 rounded-md text-text-muted font-semibold">
                👶 Máx {service.maxChildren} crianças
              </span>
            )}
            {service.timesExecuted !== undefined && service.timesExecuted > 0 && (
              <span className="text-xs bg-brand-yellow/10 text-brand-yellow px-2 py-1 rounded-md font-semibold">
                🔥 Executado {service.timesExecuted} vezes
              </span>
            )}
            {service.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-surface-border px-2 py-1 rounded-md text-text-secondary">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {service.testimonials && service.testimonials.length > 0 && (
          <div className="mb-6 p-4 bg-surface-raised/50 rounded-xl border border-surface-border-subtle">
            <p className="text-sm font-medium text-text-primary italic mb-2">"{service.testimonials[0].text}"</p>
            <p className="text-xs text-brand-yellow font-bold">— {service.testimonials[0].clientName}</p>
          </div>
        )}
        
        <div className="mt-auto">
          <p className="text-xs font-black uppercase text-text-muted mb-1 tracking-widest">Investimento Sugerido</p>
          <p className="text-3xl font-black text-brand-yellow mb-6">
            {formatCurrency(service.precoSugerido)}
          </p>

          <div className="flex gap-3">
            <Button className="flex-1 shadow-glow-purple" onClick={() => onSelect?.(service)}>
              Adicionar ao Pacote
            </Button>
            <Button 
              variant="outline" 
              className="w-12 px-0 shrink-0 border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/10 hover:border-brand-yellow" 
              onClick={() => openWhatsApp("", service)}
              title="Pré-visualizar envio pelo WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
