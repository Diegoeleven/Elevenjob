import { supabase } from '../lib/supabase';

export interface SearchRecord {
  id: string;
  user_id: string;
  bairro: string;
  termo: string;
  data_busca: string;
}

export interface SearchTrend {
  termo: string;
  count: number;
}

/**
 * Registra uma busca no banco de dados
 */
export const registerSearch = async (
  userId: string,
  bairro: string,
  termo: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('buscas')
      .insert({
        user_id: userId,
        bairro: bairro,
        termo: termo.toLowerCase().trim()
      });

    if (error) {
      console.error('Erro ao registrar busca:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar busca:', error);
  }
};

/**
 * Busca as tendências de pesquisa por bairro
 */
export const getSearchTrendsByNeighborhood = async (
  bairro: string,
  limit: number = 10
): Promise<SearchTrend[]> => {
  try {
    const { data, error } = await supabase
      .from('buscas')
      .select('termo')
      .eq('bairro', bairro)
      .gte('data_busca', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 dias
      .order('data_busca', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tendências:', error);
      return [];
    }

    // Contar ocorrências manualmente
    const termCounts: { [key: string]: number } = {};
    
    data?.forEach((item) => {
      const termo = item.termo.toLowerCase().trim();
      termCounts[termo] = (termCounts[termo] || 0) + 1;
    });

    // Converter para array e ordenar
    const trends = Object.entries(termCounts)
      .map(([termo, count]) => ({ termo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return trends;
  } catch (error) {
    console.error('Erro ao buscar tendências:', error);
    return [];
  }
};

/**
 * Busca as pesquisas recentes por bairro
 */
export const getRecentSearchesByNeighborhood = async (
  bairro: string,
  limit: number = 20
): Promise<SearchRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('buscas')
      .select('*')
      .eq('bairro', bairro)
      .order('data_busca', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar pesquisas recentes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar pesquisas recentes:', error);
    return [];
  }
};