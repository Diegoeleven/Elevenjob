import React, { useState, useEffect, useRef } from 'react';
import { Filter, Search, Mic, Camera, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  bairro: string;
  userId: string;
  onResults: (results: any[]) => void;
  onOpenFilter: () => void;
  raioSelecionado?: number;
  onRaioChange?: (raio: number) => void;
}

type SearchType = 'texto' | 'voz' | 'imagem';

interface PesquisaUsuario {
  id: string;
  user_id: string;
  bairro: string;
  termo_pesquisa: string;
  tipo_busca: SearchType;
  data_hora: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ bairro, userId, onResults, onOpenFilter, raioSelecionado = 0, onRaioChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<PesquisaUsuario[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Simular localização do usuário (em produção, obter do contexto ou geolocalização real)
  const userLat = -23.5505;
  const userLng = -46.6333;

  // Carrega as 3 últimas pesquisas do bairro
  useEffect(() => {
    if (!bairro) return;
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('pesquisas_usuarios')
        .select('*')
        .eq('bairro_usuario', bairro)
        .order('created_at', { ascending: false })
        .limit(3);
      if (!error && data) setHistory(data);
    };
    fetchHistory();
  }, [bairro]);

  // Salva pesquisa no Supabase
  const saveSearch = async (termo: string, tipo: SearchType) => {
    await supabase.from('pesquisas_usuarios').insert({
      user_id: userId,
      bairro,
      termo_pesquisa: termo,
      tipo_busca: tipo,
      data_hora: new Date().toISOString(),
    });
    setHistory(prev => [{
      id: Math.random().toString(),
      user_id: userId,
      bairro,
      termo_pesquisa: termo,
      tipo_busca: tipo,
      data_hora: new Date().toISOString(),
    }, ...prev.slice(0,2)]);
  };

  // Busca promoções no Supabase
  const searchPromotions = async (termo: string) => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('bairro', bairro)
      .or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%`);
    if (!error && data) onResults(data);
  };

  // Handler da lupa
  const handleSearch = async () => {
    console.log('🔍 handleSearch chamado com:', { bairro, searchTerm, userId });
    
    if (!bairro || !searchTerm.trim()) {
      console.warn('Tentativa de insert com dados faltando:', { bairro, searchTerm });
      return;
    }

    console.log('✅ Validação passou, preparando payload...');

    try {
      const payload = [{
        user_id: userId && typeof userId === 'string' && userId.trim() !== '' ? userId : null,
        bairro_usuario: String(bairro),
        search_text: searchTerm.trim(),
      }];

      console.log('Payload FINAL:', JSON.stringify(payload, null, 2));
      console.log('Tipos:', {
        user_id: typeof payload[0].user_id,
        bairro_usuario: typeof payload[0].bairro_usuario,
        search_text: typeof payload[0].search_text,
      });

      console.log('🚀 Fazendo insert no Supabase...');
      const { error } = await supabase
        .from('pesquisas_usuarios')
        .insert(payload);

      if (error) {
        console.error('Erro ao inserir no Supabase:', error.message, error.details, error.hint);
        alert('Erro ao salvar pesquisa no Supabase: ' + (error.message || ''));
        return;
      }

      console.log('✅ Insert realizado com sucesso!');
      const searchParams = new URLSearchParams({
        termo: searchTerm,
        raio: raioSelecionado.toString()
      });
      navigate(`/search-results?${searchParams.toString()}`);
    } catch (err) {
      console.error('Erro inesperado no insert:', err);
      alert('Erro inesperado ao tentar salvar pesquisa: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Handler do microfone
  const handleMic = () => {
    console.log('🎤 handleMic chamado');
    
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
      console.log('🎤 Transcript recebido:', transcript);
      setSearchTerm(transcript);
      if (!bairro || !transcript.trim()) {
        console.warn('Tentativa de insert com dados faltando:', { bairro, transcript });
        setIsListening(false);
        return;
      }
      
      console.log('✅ Validação do microfone passou, preparando payload...');
      const payload = [
        {
          bairro_usuario: String(bairro),
          search_text: String(transcript)
        }
      ];
      console.log('Payload FINAL:', JSON.stringify(payload, null, 2));
      
      console.log('🚀 Fazendo insert no Supabase (microfone)...');
      const { error } = await supabase
        .from('pesquisas_usuarios')
        .insert(payload);
      if (error) {
        alert(error.message || 'Erro ao salvar pesquisa no Supabase');
        console.error(error);
        setIsListening(false);
        return;
      }
      
      console.log('✅ Insert do microfone realizado com sucesso!');
      const searchParams = new URLSearchParams({
        termo: transcript,
        raio: raioSelecionado.toString()
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
    // Simula upload
    console.log('Imagem enviada:', file.name);
    await saveSearch(file.name, 'imagem');
    // Futuro: enviar para API de reconhecimento
    // Aqui apenas busca todas promoções do bairro
    // navigate('/search-results', { state: { termo: file.name, bairro, userLat, userLng } });
  };

  // Handler do histórico
  const handleHistoryClick = async (item: PesquisaUsuario) => {
    console.log('📜 handleHistoryClick chamado com:', item);
    
    setSearchTerm(item.termo_pesquisa);
    if (!bairro || !item.termo_pesquisa.trim()) {
      console.warn('Tentativa de insert com dados faltando:', { bairro, termo: item.termo_pesquisa });
      return;
    }
    
    console.log('✅ Validação do histórico passou, preparando payload...');
    const payload = [
      {
        bairro_usuario: String(bairro),
        search_text: String(item.termo_pesquisa)
      }
    ];
    console.log('Payload FINAL:', JSON.stringify(payload, null, 2));
    
    console.log('🚀 Fazendo insert no Supabase (histórico)...');
    const { error } = await supabase
      .from('pesquisas_usuarios')
      .insert(payload);
    if (error) {
      alert(error.message || 'Erro ao salvar pesquisa no Supabase');
      console.error(error);
      return;
    }
    
    console.log('✅ Insert do histórico realizado com sucesso!');
    const searchParams = new URLSearchParams({
      termo: item.termo_pesquisa,
      raio: raioSelecionado.toString()
    });
    navigate(`/search-results?${searchParams.toString()}`);
  };

  console.log('🔄 SearchBar renderizado');
  console.log('🔲 Renderizando JSX da SearchBar');
  return (
    <div className="relative flex items-center gap-2">
      <button
        className="p-2 rounded-full bg-[#212121] text-[#00d8ff] hover:bg-[#2a2a2a]"
        onClick={onOpenFilter}
        title="Filtrar promoções"
      >
        <Filter size={20} />
      </button>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="O que você procura?"
          className="bg-neutral-800 text-white text-sm px-4 py-2 rounded-full w-48 pr-16"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => {}}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        {/* Histórico */}
        {searchTerm === '' && history.length > 0 && (
          <div className="absolute left-0 top-12 bg-[#181818] border border-[#222] rounded-lg shadow-lg w-64 z-20">
            <div className="p-2 text-xs text-gray-400">Últimas buscas</div>
            {history.map(item => (
              <button
                key={item.id}
                className="flex items-center gap-2 w-full px-4 py-2 text-white hover:bg-[#222] text-left"
                onClick={() => handleHistoryClick(item)}
              >
                <Clock size={14} className="text-[#00d8ff]" />
                <span>{item.termo_pesquisa}</span>
                <span className="ml-auto text-xs text-gray-500">{item.tipo_busca}</span>
              </button>
            ))}
          </div>
        )}
        <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex gap-3">
          <button
            onClick={() => { console.log('🖱️ Clique na lupa!'); handleSearch(); }}
            title="Buscar"
          >
            <Search size={18} className="text-[#00d8ff]" />
          </button>
          <button onClick={handleMic} title="Buscar por voz" disabled={isListening}>
            <Mic size={18} className={isListening ? 'animate-pulse text-green-400' : 'text-[#00d8ff]'} />
          </button>
          <label>
            <Camera size={18} className="text-[#00d8ff] cursor-pointer" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCamera}
            />
          </label>
        </div>
      </div>
      
      {/* Seletor de raio de distância */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Raio:</span>
        <select
          value={raioSelecionado}
          onChange={(e) => onRaioChange?.(Number(e.target.value))}
          className="bg-neutral-800 text-white text-xs px-2 py-1 rounded border border-[#333] focus:border-[#00d8ff] focus:outline-none"
        >
          <option value={0}>Só neste bairro</option>
          <option value={1}>Até 1 km</option>
          <option value={2}>Até 2 km</option>
          <option value={5}>Até 5 km</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar; 