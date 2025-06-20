import { useState, useEffect } from 'react';
import { TrendingUp, Search, Calendar, BarChart3, Users, Eye } from 'lucide-react';
import { getSearchTrendsByNeighborhood, getRecentSearchesByNeighborhood, SearchTrend, SearchRecord } from '../services/searchService';

interface SearchTrendsPanelProps {
  bairro: string;
  className?: string;
}

export default function SearchTrendsPanel({ bairro, className = '' }: SearchTrendsPanelProps) {
  const [trends, setTrends] = useState<SearchTrend[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'recent'>('trends');

  useEffect(() => {
    loadSearchData();
  }, [bairro]);

  const loadSearchData = async () => {
    setLoading(true);
    try {
      const [trendsData, recentData] = await Promise.all([
        getSearchTrendsByNeighborhood(bairro, 15),
        getRecentSearchesByNeighborhood(bairro, 30)
      ]);
      
      setTrends(trendsData);
      setRecentSearches(recentData);
    } catch (error) {
      console.error('Erro ao carregar dados de busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMaxCount = () => {
    return Math.max(...trends.map(t => t.count), 1);
  };

  if (loading) {
    return (
      <div className={`bg-[#212121] rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-[#2a2a2a] rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-[#2a2a2a] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#212121] rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#00d8ff]/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#00d8ff]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Tendências de Busca</h3>
            <p className="text-sm text-gray-400">Bairro: {bairro}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-[#00d8ff] text-[#0b0b0b]'
                : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Mais Buscados
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-[#00d8ff] text-[#0b0b0b]'
                : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Recentes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'trends' ? (
          <div className="space-y-4">
            {trends.length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Users className="w-4 h-4" />
                  <span>{trends.reduce((sum, t) => sum + t.count, 0)} buscas nos últimos 30 dias</span>
                </div>
                
                {trends.map((trend, index) => {
                  const percentage = (trend.count / getMaxCount()) * 100;
                  return (
                    <div key={trend.termo} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-[#00d8ff] bg-[#00d8ff]/20 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <span className="text-white font-medium">{trend.termo}</span>
                        </div>
                        <span className="text-sm text-gray-400">{trend.count} buscas</span>
                      </div>
                      
                      <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#00d8ff] to-[#00d8ff]/70 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma busca registrada ainda</p>
                <p className="text-sm text-gray-500 mt-1">
                  As tendências aparecerão conforme os usuários pesquisarem
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recentSearches.length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Eye className="w-4 h-4" />
                  <span>Últimas {recentSearches.length} buscas</span>
                </div>
                
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{search.termo}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(search.data_busca)}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma busca recente</p>
                <p className="text-sm text-gray-500 mt-1">
                  As buscas recentes aparecerão aqui
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer com dica */}
      <div className="px-6 py-4 bg-[#1a1a1a] border-t border-[#2a2a2a]">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-[#00d8ff]/20 rounded">
            <TrendingUp className="w-3 h-3 text-[#00d8ff]" />
          </div>
          <div>
            <p className="text-xs text-gray-300 font-medium mb-1">💡 Dica para Comerciantes</p>
            <p className="text-xs text-gray-400">
              Use essas tendências para criar promoções e produtos que seus clientes estão procurando!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}