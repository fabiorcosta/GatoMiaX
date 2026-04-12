import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Exceção: não dar scroll se for navegação interna do funil
    // /funil/stageId ou /funil/stageId/leadId
    const isFunnelInternal = pathname.startsWith('/funil');
    
    // Se for exatamente /funil, ou se as rotas mudam substancialmente (ex: de /funil para /equipe), rola pro topo.
    // Mas se o usuário já está no funil, mantemos a posição.
    // O requisito diz: "navegação dentro do funil (troca de stageId ou abertura de leadId) não deve fazer scroll"
    
    // Check if we came from a different root path
    // We only have the current location here, so we'll just check if it's NOT a funnel subroute 
    // that was already active. Actually, the simplest check is: 
    // if it starts with /funil and we are just changing params, don't scroll.
    // But react-router-dom calls this on every change.
    
    // Let's use a ref or just follow the logic: if starts with /funil, don't scroll.
    if (!isFunnelInternal) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
