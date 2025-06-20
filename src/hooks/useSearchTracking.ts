import { useCallback } from 'react';
import { registerSearch } from '../services/searchService';

interface User {
  id: string;
  bairro: string;
}

/**
 * Hook para rastrear buscas dos usuários
 */
export const useSearchTracking = (user: User | null) => {
  const trackSearch = useCallback(async (searchTerm: string) => {
    if (!user || !searchTerm.trim()) return;
    
    try {
      await registerSearch(user.id, user.bairro, searchTerm);
    } catch (error) {
      console.error('Erro ao rastrear busca:', error);
    }
  }, [user]);

  return { trackSearch };
};