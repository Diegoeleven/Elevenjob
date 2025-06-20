import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchTracking } from '../hooks/useSearchTracking';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (term: string) => void;
  user?: {
    id: string;
    bairro: string;
  } | null;
  className?: string;
}

export default function SearchInput({ 
  placeholder = "Buscar...", 
  onSearch,
  user,
  className = ""
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { trackSearch } = useSearchTracking(user);

  const handleSearch = async (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;

    // Registrar a busca no banco
    await trackSearch(trimmedTerm);
    
    // Executar callback de busca se fornecido
    if (onSearch) {
      onSearch(trimmedTerm);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'transform scale-[1.02]' : ''
      }`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-10 pr-10 py-3 bg-[#2a2a2a] text-white placeholder-gray-400 rounded-xl border transition-all duration-200 focus:outline-none ${
            isFocused 
              ? 'border-[#00d8ff] shadow-lg shadow-[#00d8ff]/20' 
              : 'border-[#333] hover:border-[#444]'
          }`}
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Indicador visual de busca ativa */}
      {isFocused && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00d8ff] to-transparent opacity-50"></div>
      )}
    </form>
  );
}