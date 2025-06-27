import { supabase } from '../lib/supabase';

export interface SearchRecord {
  id: string;
  user_id: string;
  bairro_usuario: string;
  search_text: string;
  tipo_busca: string;
  tipo_filtro: string;
  created_at: string;
}

export interface SearchTrend {
  termo: string;
  count: number;
}

export interface TrendingSearch {
  termo: string;
  total_buscas: number;
  bairro: string;
}

/**
 * Busca as tendências de busca por bairro usando a view vw_tendencias_busca
 */
export const getTrendingSearches = async (bairro: string) => {
  try {
    const { data, error } = await supabase
      .from("vw_tendencias_busca")
      .select("*")
      .eq("bairro", bairro.toLowerCase())
      .order("total_buscas", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Erro ao buscar tendências:", error);
      return [];
    }

    return data as TrendingSearch[];
  } catch (err) {
    console.error("Erro inesperado ao buscar tendências:", err);
    return [];
  }
};

/**
 * Registra uma busca no banco de dados
 */
export const registrarBusca = async (
  searchText: string, 
  tipoBusca: string = 'texto', 
  tipoFiltro: string = 'geral',
  user_id?: string,
  bairro_usuario?: string
): Promise<void> => {
  try {
    if (!searchText || !bairro_usuario) {
      console.log('Dados insuficientes para registrar busca:', { searchText, bairro_usuario });
      return;
    }

    const { error } = await supabase
      .from('pesquisas_usuarios')
      .insert({
        user_id: user_id || null,
        bairro_usuario: bairro_usuario,
        search_text: searchText.toLowerCase().trim(),
        tipo_busca: tipoBusca,
        tipo_filtro: tipoFiltro
      });

    if (error) {
      console.error('Erro ao registrar busca:', error);
    } else {
      console.log('Busca registrada com sucesso:', { searchText, tipoBusca, tipoFiltro, bairro_usuario });
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
      .from('pesquisas_usuarios')
      .select('search_text')
      .eq('bairro_usuario', bairro)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 dias
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tendências:', error);
      return [];
    }

    // Contar ocorrências manualmente
    const termCounts: { [key: string]: number } = {};
    
    data?.forEach((item) => {
      const termo = item.search_text.toLowerCase().trim();
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
      .from('pesquisas_usuarios')
      .select('*')
      .eq('bairro_usuario', bairro)
      .order('created_at', { ascending: false })
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