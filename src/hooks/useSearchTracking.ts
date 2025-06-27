import { useCallback } from 'react';
import { registrarBusca } from '../services/searchService';

interface User {
  id: string;
  bairro: string;
}

/**
 * Hook para rastrear buscas dos usuários
 */
export const useSearchTracking = (user: User | null) => {
  const trackSearch = useCallback(async (searchTerm: string, tipoBusca: string = 'texto', tipoFiltro: string = 'geral') => {
    if (!user || !searchTerm.trim()) return;
    
    try {
      await registrarBusca(searchTerm, tipoBusca, tipoFiltro, user.id, user.bairro);
    } catch (error) {
      console.error('Erro ao rastrear busca:', error);
    }
  }, [user]);

  return { trackSearch };
};