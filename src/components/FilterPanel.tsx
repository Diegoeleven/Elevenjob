import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Clock, Mic, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface FilterPanelProps {
  isOpen: boolean;
  bairro: string;
  userId: string;
  onClose: () => void;
  onResults: (results: any[]) => void;
  raioSelecionado?: number;
  onRaioChange?: (raio: number) => void;
}

type SearchType = 'texto' | 'voz' | 'imagem';

interface PesquisaUsuario {
  id: string;
  user_id: string;
  bairro: string;
  termo_pesquisa: string;
  search_text?: string;
  tipo_busca: SearchType;
  data_hora: string;
}

type FilterTab = 'geral' | 'promocoes';

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, bairro, userId, onClose, onResults, raioSelecionado, onRaioChange }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<PesquisaUsuario[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');
    fetchHistory();
    setActiveTab('geral');
  }, [isOpen]);

  const fetchHistory = async () => {
    if (!userId || !bairro) return;
    const query = supabase
      .from('pesquisas_usuarios')
      .select('*')
      .eq('user_id', userId)
      .eq('bairro_usuario', bairro)
      .order('created_at', { ascending: false })
      .limit(5);

    if (activeTab === 'promocoes') {
      query.eq('tipo_filtro', 'promocoes');
    }

    const { data, error } = await query;
    if (!error && data) {
      console.log(`📜 Histórico carregado para ${activeTab}:`, data);
      setHistory(data);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const saveSearch = async (termo: string, tipo: SearchType) => {
    const payload = [{
      user_id: userId,
      bairro_usuario: String(bairro),
      search_text: termo.trim(),
      tipo_busca: tipo,
      tipo_filtro: activeTab,
    }];
    console.log('Payload FINAL:', JSON.stringify(payload, null, 2));
    const { error } = await supabase.from('pesquisas_usuarios').insert(payload);
    if (error) {
      console.error('Erro ao inserir no Supabase:', error.message, error.details, error.hint);
      return false;
    }
    fetchHistory();
    return true;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    await saveSearch(searchTerm, 'texto');

    const searchParams = new URLSearchParams({
      termo: searchTerm,
      raio: (raioSelecionado || 0).toString(),
      tipo: activeTab,
    });
    navigate(`/search-results?${searchParams.toString()}`);
    onClose();
  };

  // Handler do microfone
  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    setIsListening(true);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      await saveSearch(transcript, 'voz');
      const searchParams = new URLSearchParams({
        termo: transcript,
        raio: (raioSelecionado || 0).toString(),
        tipo: activeTab,
      });
      navigate(`/search-results?${searchParams.toString()}`);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Handler da câmera
  const handleCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await saveSearch(file.name, 'imagem');
    const searchParams = new URLSearchParams({
      termo: file.name,
      raio: (raioSelecionado || 0).toString(),
      tipo: activeTab,
    });
    navigate(`/search-results?${searchParams.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-60">
      <div className="bg-[#18181b] rounded-l-2xl shadow-2xl w-full max-w-md h-full p-6 relative animate-slide-in-right flex flex-col">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#00d8ff]"
          onClick={onClose}
          aria-label="Fechar painel"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Filtros</h2>

        {/* Abas de Filtro */}
        <div className="flex border-b border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('geral')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'geral' ? 'text-[#00d8ff] border-b-2 border-[#00d8ff]' : 'text-gray-400'}`}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveTab('promocoes')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'promocoes' ? 'text-[#00d8ff] border-b-2 border-[#00d8ff]' : 'text-gray-400'}`}
          >
            Promoções
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="flex-grow overflow-y-auto">
          {/* Campo de Busca */}
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              placeholder={activeTab === 'geral' ? "Buscar tudo..." : "Buscar promoção..."}
              className="w-full bg-neutral-800 text-white px-4 py-3 rounded-full pr-20 focus:outline-none focus:ring-2 focus:ring-[#00d8ff]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <button onClick={handleSearch} title="Buscar" className="p-1">
                <Search size={18} className="text-[#00d8ff]" />
              </button>
              <button 
                onClick={handleMic} 
                title="Buscar por voz" 
                disabled={isListening}
                className="p-1"
              >
                <Mic size={18} className={isListening ? 'animate-pulse text-green-400' : 'text-[#00d8ff]'} />
              </button>
              {activeTab === 'geral' && (
                <label className="p-1 cursor-pointer">
                  <Camera size={18} className="text-[#00d8ff]" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCamera}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Dropdown de Raio - apenas na aba Geral */}
          {activeTab === 'geral' && (
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Raio de busca</label>
              <select
                value={raioSelecionado || 0}
                onChange={(e) => onRaioChange?.(Number(e.target.value))}
                className="w-full bg-neutral-800 text-white text-sm px-3 py-2 rounded-lg border border-[#333] focus:border-[#00d8ff] focus:outline-none"
              >
                <option value={0}>Só neste bairro</option>
                <option value={1}>Até 1 km</option>
                <option value={2}>Até 2 km</option>
                <option value={5}>Até 5 km</option>
              </select>
            </div>
          )}

          {/* Histórico de Buscas */}
          {history.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs text-gray-400">Últimas buscas</h3>
                {history.map(item => (
                  <button
                    key={item.id}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-white hover:bg-[#2a2a2a] text-left rounded"
                  onClick={() => {
                    setSearchTerm(item.search_text || item.termo_pesquisa);
                    handleSearch();
                  }}
                  >
                  <Clock size={14} className="text-gray-500" />
                  <span>{item.search_text || item.termo_pesquisa}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 