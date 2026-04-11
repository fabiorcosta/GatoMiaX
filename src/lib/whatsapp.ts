import type { Servico } from '@/types';
import { formatCurrency } from './utils';

/**
 * Converte os dados do serviço em uma string bem formatada 
 * pronta para ser enviada por mensagem.
 */
export function serviceToWhatsAppText(service: Servico): string {
  const nivelLabel: Record<number, string> = { 
    1: "Básico", 
    2: "Intermediário", 
    3: "Sênior" 
  };
  
  const linhas = [
    `*${service.nome.toUpperCase()}*`,
    service.description || service.descricao ? `${service.description || service.descricao}` : null,
    `💰 Investimento sugerido: *${formatCurrency(service.precoSugerido)}*`,
    service.durationMinutes ? `⏱ Duração: ${service.durationMinutes} minutos` : null,
    service.maxChildren ? `👶 Capacidade: Até ${service.maxChildren} crianças` : null,
    `👤 Nível Operacional Exigido: ${nivelLabel[service.nivelMinimo] || "Básico"}`
  ];

  // Filtra itens vazios e junta com 2 quebras de linha
  return linhas.filter(Boolean).join("\n\n");
}

/**
 * Abre uma nova aba com a API do WhatsApp pronta para enviar a mensagem
 */
export function openWhatsApp(phone: string, service: Servico | string) {
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Se recebe o objeto Servico, converte, se recebe string, já é o texto formatado.
  const texto = typeof service === 'string' ? service : serviceToWhatsAppText(service);
  
  const encodedText = encodeURIComponent(texto);
  
  // Assume DDI 55 (Brasil) caso não tenha
  const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  window.open(`https://wa.me/${finalPhone}?text=${encodedText}`, "_blank");
}
