import React, { useEffect, useState } from 'react';
import { TrendingUp, Search } from 'lucide-react';
import { getTrendingSearches, TrendingSearch } from '../services/searchService';

interface TrendingSearchesPanelProps {
  bairro: string;
  className?: string;
  onTermClick?: (termo: string) => void;
}

export default function TrendingSearchesPanel({ 
  bairro, 
  className = '',
  onTermClick 
}: TrendingSearchesPanelProps) {
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bairro) {
      setLoading(false);
      return;
    }

    const loadTrendingSearches = async () => {
      setLoading(true);
      try {
        const data = await getTrendingSearches(bairro);
        setTrendingSearches(data);
      } catch (error) {
        console.error('Erro ao carregar tendências:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingSearches();
  }, [bairro]);

  const handleTermClick = (termo: string) => {
    if (onTermClick) {
      onTermClick(termo);
    }
  };

  if (loading) {
    return (
      <div className={`bg-[#212121] rounded-xl p-4 ${className}`}>
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

  if (trendingSearches.length === 0) {
    return (
      <div className={`bg-[#212121] rounded-xl p-4 ${className}`}>
        <div className="text-center py-6">
          <TrendingUp className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Nenhuma tendência disponível</p>
          <p className="text-gray-500 text-xs mt-1">As tendências aparecerão conforme as buscas aumentarem</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#212121] rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#00d8ff]" />
        <h3 className="text-white font-semibold text-sm">Tendências no {bairro}</h3>
      </div>
      
      <div className="space-y-2">
        {trendingSearches.map((trend, index) => (
          <button
            key={trend.termo}
            onClick={() => handleTermClick(trend.termo)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#00d8ff] bg-[#00d8ff]/20 px-2 py-1 rounded">
                #{index + 1}
              </span>
              <span className="text-white text-sm truncate">{trend.termo}</span>
            </div>
            <div className="flex items-center gap-1">
              <Search className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{trend.total_buscas}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
        <p className="text-xs text-gray-500 text-center">
          Baseado nas buscas dos últimos 30 dias
        </p>
      </div>
    </div>
  );
} 